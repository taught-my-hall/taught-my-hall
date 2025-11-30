import { useNavigation } from '@react-navigation/native';
import { Layer, Stage } from 'react-konva';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Furniture from '../components/Furniture';
import TexturePolygon from '../components/TexturedPolygon';

// 1. Setup Dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROOM_WIDTH = 1000;
const ROOM_HEIGHT = 1400;

export default function RoomScreen() {
  const navigation = useNavigation();

  // Animation Values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const clampValues = (val, currentScale, dimension, screenDimension) => {
    'worklet';
    const scaledRoomSize = dimension * currentScale;

    const limit = (scaledRoomSize + screenDimension) / 2 - 50;

    return Math.min(Math.max(val, -limit), limit);
  };

  // --- GESTURES (TOUCH) ---
  const panGesture = Gesture.Pan()
    .minDistance(3)
    .averageTouches(true)
    .onUpdate(e => {
      const rawX = savedTranslateX.value + e.translationX;
      const rawY = savedTranslateY.value + e.translationY;

      translateX.value = clampValues(
        rawX,
        scale.value,
        ROOM_WIDTH,
        SCREEN_WIDTH
      );
      translateY.value = clampValues(
        rawY,
        scale.value,
        ROOM_HEIGHT,
        SCREEN_HEIGHT
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      const rawScale = savedScale.value * e.scale;
      const newScale = Math.min(Math.max(rawScale, 0.5), 4);

      scale.value = newScale;

      translateX.value = clampValues(
        translateX.value,
        newScale,
        ROOM_WIDTH,
        SCREEN_WIDTH
      );
      translateY.value = clampValues(
        translateY.value,
        newScale,
        ROOM_HEIGHT,
        SCREEN_HEIGHT
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGestures = Gesture.Simultaneous(panGesture, pinchGesture);

  // --- MOUSE WHEEL (ZOOM TO CURSOR) ---
  const handleWheel = e => {
    if (Platform.OS !== 'web') return;

    const scrollAmount = e.deltaY;
    const sensitivity = 0.005;

    const oldScale = scale.value;
    const oldTranslateX = translateX.value;
    const oldTranslateY = translateY.value;

    let newScale = oldScale - scrollAmount * sensitivity;
    newScale = Math.min(Math.max(newScale, 0.5), 5);

    // Calculate Cursor relative to center
    const cursorX = e.nativeEvent.clientX - SCREEN_WIDTH / 2;
    const cursorY = e.nativeEvent.clientY - SCREEN_HEIGHT / 2;

    // Calculate Offset to keep cursor stationary
    const scaleRatio = newScale / oldScale;
    const newTranslateX = cursorX - (cursorX - oldTranslateX) * scaleRatio;
    const newTranslateY = cursorY - (cursorY - oldTranslateY) * scaleRatio;

    scale.value = newScale;
    savedScale.value = newScale;

    // Apply Clamping
    translateX.value = clampValues(
      newTranslateX,
      newScale,
      ROOM_WIDTH,
      SCREEN_WIDTH
    );
    translateY.value = clampValues(
      newTranslateY,
      newScale,
      ROOM_HEIGHT,
      SCREEN_HEIGHT
    );

    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const furnitures = [
    [null, null, null, 'chair_back', null],
    [null, null, 'chair_left', 'table', 'chair_right'],
    [null, 'chair_back', null, 'chair_front', null],
    ['chair_left', 'table', 'chair_right', null, null],
    [null, 'chair_front', null, null, null],
  ];

  const furnitureClick = (row, col) => {
    console.log(`Furniture clicked at row ${row} | col ${col}`);
    navigation.navigate('Furniture');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGestures}>
        <Animated.View
          style={style.container}
          {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
        >
          <Animated.View style={[style.roomContent, animatedStyle]}>
            <Stage width={ROOM_WIDTH} height={ROOM_HEIGHT}>
              <Layer>
                <TexturePolygon
                  points={[
                    [0, 0],
                    [1000, 0],
                    [1000, 400],
                    [0, 400],
                  ]}
                  textureId={'brick1'}
                />
                <TexturePolygon
                  points={[
                    [0, 400],
                    [1000, 400],
                    [1000, 1400],
                    [0, 1400],
                  ]}
                  textureId={'planks1'}
                />
                {furnitures.map((row, i) =>
                  row.map((item, j) => {
                    if (!item) return null;
                    return (
                      <Furniture
                        key={`furniture-${i}-${j}`}
                        modelname={item}
                        offset={[200 * j, 400 + 200 * i]}
                        width={200}
                        height={200}
                      />
                    );
                  })
                )}
              </Layer>
            </Stage>
            <View style={StyleSheet.absoluteFill}>
              {furnitures.map((row, i) =>
                row.map((item, j) => {
                  if (!item) return null;
                  return (
                    <TouchableOpacity
                      key={`click-${i}-${j}`}
                      style={[
                        style.roomSectorClick,
                        { left: 10 + 200 * j, top: 400 + 10 + 200 * i },
                      ]}
                      onPress={() => furnitureClick(i, j)}
                    />
                  );
                })
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <Pressable
        onPress={() => navigation.navigate('Review')}
        style={style.reviewButton}
      >
        <Text style={{ fontSize: 24, color: '#FFF' }}>Review</Text>
      </Pressable>
    </GestureHandlerRootView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  roomContent: {
    width: ROOM_WIDTH,
    height: ROOM_HEIGHT,
    backgroundColor: '#4a90e2',
  },
  roomSectorClick: {
    position: 'absolute',
    height: 190,
    width: 190,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  reviewButton: {
    position: 'absolute',
    bottom: 50,
    right: 50,
    width: 200,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderColor: '#FFF',
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

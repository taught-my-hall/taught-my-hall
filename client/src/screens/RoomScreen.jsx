import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Layer, Stage } from 'react-konva';
import {
  Dimensions,
  Platform,
  StyleSheet,
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

const { width, height } = Dimensions.get('window');

export default function RoomScreen() {
  const navigation = useNavigation();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // --- GESTURES ---
  const panGesture = Gesture.Pan()
    .minDistance(3)
    .averageTouches(true)
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composedGestures = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleWheel = e => {
    if (Platform.OS !== 'web') return;

    const scrollAmount = e.deltaY;
    const sensitivity = 0.001;
    let newScale = scale.value - scrollAmount * sensitivity;

    newScale = Math.max(0.5, Math.min(newScale, 5));

    scale.value = newScale;
    savedScale.value = newScale;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const [svgReload, setSvgReload] = useState(0);

  const furnitures = [
    [null, null, null, 'chairBack', null],
    [null, null, 'chairLeft', 'table', 'chairRight'],
    [null, 'chairBack', null, 'chairFront', null],
    ['chairLeft', 'table', 'chairRight', null, null],
    [null, 'chairFront', null, null, null],
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
          <Animated.View style={[style.rectangle, animatedStyle]}>
            <Stage width={1000} height={1400}>
              <Layer>
                <TexturePolygon
                  points={[
                    [0, 0],
                    [1000, 0],
                    [1000, 400],
                    [0, 400],
                  ]}
                  textureId={'brick1'}
                ></TexturePolygon>
                <TexturePolygon
                  points={[
                    [0, 400],
                    [1000, 400],
                    [1000, 1400],
                    [0, 1400],
                  ]}
                  textureId={'planks1'}
                ></TexturePolygon>
                {furnitures.map((row, i) =>
                  row.map((item, j) => {
                    if (item === null) return null;
                    return (
                      <Furniture
                        key={`furniture-${i}-${j}`}
                        modelname={item}
                        offset={[200 * j, 400 + 200 * i]}
                        width={200}
                        height={200}
                      ></Furniture>
                    );
                  })
                )}
              </Layer>
            </Stage>
            <View style={StyleSheet.absoluteFill}>
              {furnitures.map((row, i) =>
                row.map((item, j) => {
                  if (item === null) return null;
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
    width: '100%',
    height: '100%',
  },
  rectangle: {
    height: 1000,
    aspectRatio: 1 / 1,
    backgroundColor: '#4a90e2',
    borderRadius: 10,
  },
  roomSectorClick: {
    position: 'absolute',
    height: 190,
    width: 190,
    borderWidth: 2,
    borderColor: '#00000037',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

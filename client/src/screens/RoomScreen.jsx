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
  useSharedValue, withTiming,
} from 'react-native-reanimated';
import Furniture from '../components/Furniture';
import TexturePolygon from '../components/TexturedPolygon';
import {useRef} from "react";
import FurnitureScreen from "./FurnitureScreen";

//Room settings
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROOM_WIDTH = 1000;
const ROOM_HEIGHT = 1400;
const TILE_SIZE = 200;
const TILE_CENTER_SHIFT = TILE_SIZE / 40
const FLOOR_OFFSET_Y = 400;

//Zoom settings
const WHEEL_SENSITIVITY = 0.005
const MIN_SCALE = 0.5;
const MAX_SCALE = 4.5
const BASE_CENTERING_SPEED = 0.5;

export default function RoomScreen() {
  const navigation = useNavigation();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isFurnitureOpen = useSharedValue(false);

  const zoomTargetRef = useRef(null);
  const zoomTimeoutRef = useRef(null);

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



  const handleWheel = (e) => {
    if (Platform.OS !== 'web') return;

    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    const scrollAmount = e.deltaY;
    const oldScale = scale.value;
    const oldTranslateX = translateX.value;
    const oldTranslateY = translateY.value;

    const screenCenterX = SCREEN_WIDTH / 2;
    const screenCenterY = SCREEN_HEIGHT / 2;
    const ROOM_CENTER_X = ROOM_WIDTH / 2;
    const ROOM_CENTER_Y = ROOM_HEIGHT / 2;

    let newScale = oldScale - scrollAmount * WHEEL_SENSITIVITY;
    newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
    const isMaxScale = newScale >= MAX_SCALE - 0.01;

    if (!zoomTargetRef.current) {
      const mouseRoomX = ((e.nativeEvent.clientX - screenCenterX - oldTranslateX) / oldScale) + ROOM_CENTER_X;
      const mouseRoomY = ((e.nativeEvent.clientY - screenCenterY - oldTranslateY) / oldScale) + ROOM_CENTER_Y;

      const col = Math.floor(mouseRoomX / TILE_SIZE);
      const row = Math.floor((mouseRoomY - FLOOR_OFFSET_Y) / TILE_SIZE);
      const isValidGrid = col >= 0 && col < 5 && row >= 0 && row < 5 && mouseRoomY >= FLOOR_OFFSET_Y;

      if (isValidGrid) {
        zoomTargetRef.current = {
          type: 'furniture',
          roomX: (col * TILE_SIZE) + (TILE_SIZE/2) + TILE_CENTER_SHIFT,
          roomY: FLOOR_OFFSET_Y + (row * TILE_SIZE) + (TILE_SIZE/2) + TILE_CENTER_SHIFT
        };
      } else {
        zoomTargetRef.current = {
          type: 'point',
          roomX: mouseRoomX,
          roomY: mouseRoomY
        };
      }
    }

    const target = zoomTargetRef.current;

    const currentScreenX = (target.roomX - ROOM_CENTER_X) * oldScale + oldTranslateX + screenCenterX;
    const currentScreenY = (target.roomY - ROOM_CENTER_Y) * oldScale + oldTranslateY + screenCenterY;

    let desiredScreenX = currentScreenX;
    let desiredScreenY = currentScreenY;

    if (target.type === 'furniture') {
      if (isMaxScale) {
        isFurnitureOpen.value = true;
        desiredScreenX = screenCenterX;
        desiredScreenY = screenCenterY;
      } else {
        isFurnitureOpen.value = false;
        const diffX = screenCenterX - currentScreenX;
        const diffY = screenCenterY - currentScreenY;

        const dynamicSpeed = BASE_CENTERING_SPEED;

        desiredScreenX += diffX * dynamicSpeed;
        desiredScreenY += diffY * dynamicSpeed;
      }
    }

    const newTranslateX = desiredScreenX - screenCenterX - (target.roomX - ROOM_CENTER_X) * newScale;
    const newTranslateY = desiredScreenY - screenCenterY - (target.roomY - ROOM_CENTER_Y) * newScale;

    scale.value = newScale;
    savedScale.value = newScale;

    translateX.value = clampValues(newTranslateX, newScale, ROOM_WIDTH, SCREEN_WIDTH);
    translateY.value = clampValues(newTranslateY, newScale, ROOM_HEIGHT, SCREEN_HEIGHT);

    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;

    zoomTimeoutRef.current = setTimeout(() => {
      zoomTargetRef.current = null;
    }, 200);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const vignetteAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFurnitureOpen.value ? 1 : 0, { duration: 300 }),
    };
  });

  const furnitures = [
    [null, null, null, 'chair_back', null],
    [null, null, 'chair_left', 'table', 'chair_right'],
    [null, 'chair_back', null, 'chair_front', null],
    ['chair_left', 'table', 'chair_right', null, null],
    [null, 'chair_front', null, null, null],
  ];

  const furnitureClick = (row, col) => {
    console.log(`Furniture clicked at row ${row} | col ${col}`);
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
                                offset={[TILE_SIZE * j, FLOOR_OFFSET_Y + TILE_SIZE * i]}
                                width={TILE_SIZE}
                                height={TILE_SIZE}
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
                                { left: 10 + TILE_SIZE * j, top: FLOOR_OFFSET_Y + 10 + TILE_SIZE * i },
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

        {/* --- VIGNETTE OVERLAY --- */}
        {/* pointerEvents="none" ensures clicks pass through to the room */}
        <Animated.View
            style={[style.vignetteOverlay, vignetteAnimatedStyle]}
            pointerEvents="none"
        >
          <View style={style.vignetteGradient} />

          <View style={style.vignetteTextContainer}>
            <FurnitureScreen/>
          </View>
        </Animated.View>


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
    zIndex: 200, // Ensure button is above vignette
  },

  // --- VIGNETTE STYLES ---
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100, // Above room, below UI buttons
    justifyContent: 'center',
    alignItems: 'center',
  },
  vignetteGradient: {
    // IMPORTANT: Make this absolute so it doesn't push the text around
    ...StyleSheet.absoluteFillObject,
    // Web Support: Standard CSS gradient
    ...(Platform.OS === 'web'
        ? {
          backgroundImage:
              'radial-gradient(circle, transparent 40%, rgba(20, 20, 20, 0.7) 90%)',
        }
        : {
          // Native Fallback: A simple border frame to mimic window/vignette
          borderWidth: 50,
          borderColor: 'rgba(20, 20, 20, 0.4)',
        }),
  },
  // New Styles for Text
  vignetteTextContainer: {
    alignItems: 'center',
    opacity: 0.8,
    width:800,
    height:800,
    backgroundColor:"black",
    borderRadius:30,
    borderColor:"white",
    borderWidth:2,
    // Optional: Add top padding if you want text higher up
    // paddingBottom: 300,
  },
  vignetteTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  vignetteSubtitle: {
    fontSize: 16,
    color: '#DDD',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
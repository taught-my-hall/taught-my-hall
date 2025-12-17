import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions, // 1. Import this
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
import useImage from 'use-image';
import PalaceTile from '../../../components/palaceTile';
import Vignette from '../../../components/Vignette';
import { textures } from '../../../utils/textures';
import FurnitureScreen from '../../furniture';

// Removed static Dimensions.get call here

const PALACE_MAP_RAW = [
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  [
    '1__',
    '1__',
    '1__',
    '1__',
    '1__',
    '0__',
    '2_bedGreen_',
    '2__',
    '2__',
    '2__',
    '2__',
  ],
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  ['0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__'],
  [
    '3__',
    '3__0',
    '3__',
    '3__',
    '3__',
    '0__',
    '4__',
    '4__',
    '4__0',
    '4__',
    '4__',
  ],
  [
    '3__',
    '3_chairWood_',
    '3__',
    '3__',
    '3__',
    '0__',
    '4__',
    '4__',
    '4__',
    '4__',
    '4__',
  ],
  [
    '3__',
    '3__',
    '3__',
    '3__',
    '3__',
    '0__',
    '4_chairWood_',
    '4__',
    '4__',
    '4__',
    '4__',
  ],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
  [
    '3__',
    '3__',
    '3_bedGreen_',
    '3__',
    '3__',
    '0__',
    '4__',
    '4_bedGreen_',
    '4__',
    '4__',
    '4__',
  ],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
];

const SPLIT_MAP = PALACE_MAP_RAW.map(row => row.map(cell => cell.split('_')));
const MAP_HEIGHT = SPLIT_MAP.length;
const MAP_WIDTH = SPLIT_MAP[0].length;
const TILE_SIZE = 100;
const MAP_PIXEL_WIDTH = MAP_WIDTH * TILE_SIZE;
const MAP_PIXEL_HEIGHT = MAP_HEIGHT * TILE_SIZE;

const WHEEL_SENSITIVITY = 0.005;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const BASE_CENTERING_SPEED = 0.5;

const clampValues = (val, currentScale, mapSize, screenSize) => {
  'worklet';
  const scaledMapSize = mapSize * currentScale;
  const limit = (scaledMapSize + screenSize) / 2 - 100;
  return Math.min(Math.max(val, -limit), limit);
};

function PalaceScreen() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isFurnitureOpen = useSharedValue(false);
  const zoomTargetRef = useRef(null);
  const zoomTimeoutRef = useRef(null);
  const layerRef = useRef(null);

  const [furnitureSheet] = useImage(textures.furniture);
  const [imgStone] = useImage(textures.stone1);
  const [imgPlanks] = useImage(textures.planks1);
  const [imgBrick] = useImage(textures.brick1);

  const imageMap = useMemo(
    () => ({
      stone1: imgStone,
      planks1: imgPlanks,
      brick1: imgBrick,
      furnitureSheet: furnitureSheet,
    }),
    [imgStone, imgPlanks, imgBrick, furnitureSheet]
  );

  useEffect(() => {
    translateX.value = clampValues(
      translateX.value,
      scale.value,
      MAP_PIXEL_WIDTH,
      screenWidth
    );
    translateY.value = clampValues(
      translateY.value,
      scale.value,
      MAP_PIXEL_HEIGHT,
      screenHeight
    );
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  }, [
    screenWidth,
    screenHeight,
    scale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ]);

  const processedTiles = useMemo(() => {
    const tiles = [];

    SPLIT_MAP.forEach((row, i) => {
      row.forEach((tile, j) => {
        const el = tile[0];

        const check = (r, c) => SPLIT_MAP[r][c][0] !== el;
        const checkDiag = (r, c) =>
          SPLIT_MAP[r][c][0] !== el && SPLIT_MAP[r][c][0] !== '0';

        const top = i === 0 ? el !== '0' : check(i - 1, j);
        const bottom = i === MAP_HEIGHT - 1 ? el !== '0' : check(i + 1, j);
        const left = j === 0 ? el !== '0' : check(i, j - 1);
        const right = j === MAP_WIDTH - 1 ? el !== '0' : check(i, j + 1);

        const topLeft = i === 0 || j === 0 ? false : checkDiag(i - 1, j - 1);
        const topRight =
          i === 0 || j === MAP_WIDTH - 1 ? false : checkDiag(i - 1, j + 1);
        const bottomLeft =
          i === MAP_HEIGHT - 1 || j === 0 ? false : checkDiag(i + 1, j - 1);
        const bottomRight =
          i === MAP_HEIGHT - 1 || j === MAP_WIDTH - 1
            ? false
            : checkDiag(i + 1, j + 1);

        tiles.push(
          <PalaceTile
            key={`${i}-${j}-tile`}
            tileData={tile}
            i={i}
            j={j}
            s={TILE_SIZE}
            imageMap={imageMap}
            flags={[
              top,
              topRight,
              right,
              bottomRight,
              bottom,
              bottomLeft,
              left,
              topLeft,
            ]}
          />
        );
      });
    });
    return tiles;
  }, [imageMap]);

  useEffect(() => {
    const areImagesReady =
      imageMap.stone1 &&
      imageMap.planks1 &&
      imageMap.brick1 &&
      imageMap.furnitureSheet;

    if (!areImagesReady) return;

    const cacheHandle = requestAnimationFrame(() => {
      if (layerRef.current) {
        layerRef.current.clearCache();
        layerRef.current.cache({
          pixelRatio: 1,
          x: 0,
          y: 0,
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
        });
      }
    });
    return () => cancelAnimationFrame(cacheHandle);
  }, [processedTiles, imageMap]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(3)
        .averageTouches(true)
        .onStart(() => {
          isFurnitureOpen.value = false;
        })
        .onUpdate(e => {
          const rawX = savedTranslateX.value + e.translationX;
          const rawY = savedTranslateY.value + e.translationY;

          translateX.value = clampValues(
            rawX,
            scale.value,
            MAP_PIXEL_WIDTH,
            screenWidth
          );
          translateY.value = clampValues(
            rawY,
            scale.value,
            MAP_PIXEL_HEIGHT,
            screenHeight
          );
        })
        .onEnd(() => {
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }),
    [
      translateX,
      translateY,
      savedTranslateX,
      savedTranslateY,
      isFurnitureOpen,
      scale,
      screenWidth,
      screenHeight,
    ]
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate(e => {
          const rawScale = savedScale.value * e.scale;
          const newScale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);

          scale.value = newScale;

          translateX.value = clampValues(
            translateX.value,
            newScale,
            MAP_PIXEL_WIDTH,
            screenWidth
          );
          translateY.value = clampValues(
            translateY.value,
            newScale,
            MAP_PIXEL_HEIGHT,
            screenHeight
          );
        })
        .onEnd(() => {
          savedScale.value = scale.value;
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }),
    [
      scale,
      savedScale,
      translateX,
      translateY,
      savedTranslateX,
      savedTranslateY,
      screenWidth,
      screenHeight,
    ]
  );

  const composedGestures = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  const handleWheel = useCallback(
    e => {
      if (Platform.OS !== 'web') return;

      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);

      const scrollAmount = e.deltaY;
      const oldScale = scale.value;
      const oldTranslateX = translateX.value;
      const oldTranslateY = translateY.value;

      // Use dynamic dimensions
      const screenCenterX = screenWidth / 2;
      const screenCenterY = screenHeight / 2;
      const ROOM_CENTER_X = MAP_PIXEL_WIDTH / 2;
      const ROOM_CENTER_Y = MAP_PIXEL_HEIGHT / 2;

      const mouseRoomX =
        (e.nativeEvent.clientX - screenCenterX - oldTranslateX) / oldScale +
        ROOM_CENTER_X;
      const mouseRoomY =
        (e.nativeEvent.clientY - screenCenterY - oldTranslateY) / oldScale +
        ROOM_CENTER_Y;

      if (!zoomTargetRef.current) {
        const col = Math.floor(mouseRoomX / TILE_SIZE);
        const row = Math.floor(mouseRoomY / TILE_SIZE);

        const isValidGrid =
          col >= 0 && col < MAP_WIDTH && row >= 0 && row < MAP_HEIGHT;

        const hasFurniture = isValidGrid && SPLIT_MAP[row][col][1] !== '';

        if (isValidGrid) {
          zoomTargetRef.current = {
            type: hasFurniture ? 'furniture' : 'floor',
            roomX: col * TILE_SIZE + TILE_SIZE / 2,
            roomY: row * TILE_SIZE + TILE_SIZE / 2,
          };
        } else {
          zoomTargetRef.current = {
            type: 'point',
            roomX: mouseRoomX,
            roomY: mouseRoomY,
          };
        }
      }

      const target = zoomTargetRef.current;

      let newScale = oldScale - scrollAmount * WHEEL_SENSITIVITY;
      newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

      const isMaxScale = newScale >= MAX_SCALE - 0.1;
      const currentScreenX =
        (target.roomX - ROOM_CENTER_X) * oldScale +
        oldTranslateX +
        screenCenterX;
      const currentScreenY =
        (target.roomY - ROOM_CENTER_Y) * oldScale +
        oldTranslateY +
        screenCenterY;

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
          desiredScreenX += diffX * BASE_CENTERING_SPEED;
          desiredScreenY += diffY * BASE_CENTERING_SPEED;
        }
      } else {
        isFurnitureOpen.value = false;

        if (target.type === 'floor') {
          const diffX = screenCenterX - currentScreenX;
          const diffY = screenCenterY - currentScreenY;
          desiredScreenX += diffX * BASE_CENTERING_SPEED;
          desiredScreenY += diffY * BASE_CENTERING_SPEED;
        }
      }

      const newTranslateX =
        desiredScreenX -
        screenCenterX -
        (target.roomX - ROOM_CENTER_X) * newScale;
      const newTranslateY =
        desiredScreenY -
        screenCenterY -
        (target.roomY - ROOM_CENTER_Y) * newScale;

      scale.value = newScale;
      savedScale.value = newScale;

      translateX.value = clampValues(
        newTranslateX,
        newScale,
        MAP_PIXEL_WIDTH,
        screenWidth // Dynamic width
      );
      translateY.value = clampValues(
        newTranslateY,
        newScale,
        MAP_PIXEL_HEIGHT,
        screenHeight // Dynamic height
      );

      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      zoomTimeoutRef.current = setTimeout(() => {
        zoomTargetRef.current = null;
      }, 200);
    },
    [
      scale,
      translateX,
      translateY,
      savedScale,
      savedTranslateX,
      savedTranslateY,
      isFurnitureOpen,
      screenWidth, // Added dependency
      screenHeight, // Added dependency
    ]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView
      style={style.body}
      {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
    >
      <GestureDetector gesture={composedGestures}>
        <Animated.View style={style.container}>
          <Animated.View style={[style.rectangle, animatedStyle]}>
            <Stage
              width={MAP_WIDTH * TILE_SIZE}
              height={MAP_HEIGHT * TILE_SIZE}
              options={{ pixelRatio: 1 }}
            >
              <Layer ref={layerRef} listening={false}>
                {processedTiles}
              </Layer>
            </Stage>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      <Pressable
        onPress={() => router.navigate('/room/TODO/review')}
        style={style.reviewButton}
      >
        <Text style={style.reviewButtonText}>Review</Text>
      </Pressable>
      <Vignette isOpened={isFurnitureOpen}>
        <FurnitureScreen />
      </Vignette>
    </GestureHandlerRootView>
  );
}

const style = StyleSheet.create({
  body: {
    flex: 1,
  },
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
    height: MAP_HEIGHT * TILE_SIZE,
    width: MAP_WIDTH * TILE_SIZE,
    backgroundColor: '#4a90e2',
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
  reviewButtonText: { fontSize: 24, color: '#FFF' },
});

export default memo(PalaceScreen);

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { Platform, StyleSheet } from 'react-native';
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
import { textures } from '../../../utils/textures';

// 1. MOVE STATIC DATA OUTSIDE THE COMPONENT
// This prevents it from being re-created in memory on every render.
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

function PalaceScreen() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
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

  const processedTiles = useMemo(() => {
    const tiles = [];

    SPLIT_MAP.forEach((row, i) => {
      row.forEach((tile, j) => {
        const el = tile[0];

        // Helper for boundary check to keep code clean
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
  // --- GESTURES ---
  // Memoize gesture handlers to prevent recreation on every render
  useEffect(() => {
    // 1. Guard: Check if images are actually loaded yet
    const areImagesReady =
      imageMap.stone1 &&
      imageMap.planks1 &&
      imageMap.brick1 &&
      imageMap.furnitureSheet; // <--- Critical: Wait for this!

    if (!areImagesReady) return;

    const cacheHandle = requestAnimationFrame(() => {
      if (layerRef.current) {
        layerRef.current.clearCache();
        // 2. Fix: Explicitly set x, y, width, and height.
        // This prevents the "Width or height equals 0" crash entirely.
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
        .onUpdate(e => {
          translateX.value = savedTranslateX.value + e.translationX;
          translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }),
    [translateX, translateY, savedTranslateX, savedTranslateY]
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate(e => {
          scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
          savedScale.value = scale.value;
        }),
    [scale, savedScale]
  );

  const composedGestures = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  // Memoize the wheel handler to prevent recreation on every render
  const handleWheel = useCallback(
    e => {
      if (Platform.OS !== 'web') return;
      const scrollAmount = e.deltaY;
      const sensitivity = 0.001;
      let newScale = scale.value - scrollAmount * sensitivity;
      newScale = Math.max(0.5, Math.min(newScale, 5));
      scale.value = newScale;
      savedScale.value = newScale;
    },
    [scale, savedScale]
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
    <GestureHandlerRootView style={style.body}>
      <GestureDetector gesture={composedGestures}>
        <Animated.View
          style={style.container}
          {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
        >
          <Animated.View style={[style.rectangle, animatedStyle]}>
            <Stage
              width={MAP_WIDTH * TILE_SIZE}
              height={MAP_HEIGHT * TILE_SIZE}
              // Optimization 2: Force 1:1 pixel ratio (see below)
              options={{ pixelRatio: 1 }}
            >
              <Layer ref={layerRef} listening={false}>
                {processedTiles}
              </Layer>
            </Stage>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
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
});

export default memo(PalaceScreen);

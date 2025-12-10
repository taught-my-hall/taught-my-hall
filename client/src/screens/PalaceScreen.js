import { useNavigation } from '@react-navigation/native';
import { memo, useCallback, useMemo } from 'react';
import { Layer, Stage } from 'react-konva';
import { Dimensions, Platform, Pressable, StyleSheet, Text } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import PalaceTile from '../components/palaceTile';

const { width, height } = Dimensions.get('window');

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
    '2_table_',
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
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
  [
    '3__',
    '3__',
    '3_chairLeft_',
    '3__',
    '3__',
    '0__',
    '4__',
    '4_table_',
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
  const navigation = useNavigation();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // --- GESTURES ---
  // Memoize gesture handlers to prevent recreation on every render
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

  // 2. PRE-CALCULATE GRID LOGIC
  // We use useMemo to calculate all the "flags" (borders) only once on mount.
  // This removes the heavy math from the render loop.
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
  }, []); // Empty dependency array = runs once on mount

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGestures}>
        <Animated.View
          style={style.container}
          {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
        >
          <Animated.View style={[style.rectangle, animatedStyle]}>
            <Stage
              width={MAP_WIDTH * TILE_SIZE}
              height={MAP_HEIGHT * TILE_SIZE}
            >
              {/* 3. ADD LISTENING={FALSE}
                 If you do not need click events on the *Layer itself*,
                 set listening={false} to improve hit-graph performance.
                 Events on children (PalaceTile) will still work if configured correctly,
                 but usually, you want this on the layer or background tiles.
              */}
              {/* Set listening={false} to improve hit-graph performance */}
              <Layer listening={false}>{processedTiles}</Layer>
            </Stage>
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
    width: '100%',
    height: '100%',
  },
  rectangle: {
    // Ideally calculated from content, but large enough to cover
    height: MAP_HEIGHT * TILE_SIZE,
    width: MAP_WIDTH * TILE_SIZE,
    backgroundColor: '#4a90e2',
    // borderRadius: 10, // Border radius on a canvas container can sometimes cause perf issues on Android
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
});

// Export a memoized version of the component to prevent unnecessary re-renders
export default memo(PalaceScreen);

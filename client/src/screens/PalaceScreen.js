import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Layer, Stage } from 'react-konva';
import { Dimensions, Platform, StyleSheet } from 'react-native';
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

export default function PalaceScreen() {
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

  const palaceMap = [
    [
      '1__',
      '1__',
      '1__',
      '1__',
      '1__',
      '0__',
      '2__',
      '2__',
      '2__',
      '2__',
      '2__',
    ],
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
    [
      '1__',
      '1__',
      '1__',
      '1__',
      '1__',
      '0__',
      '2__',
      '2__',
      '2__',
      '2__',
      '2__',
    ],
    [
      '1__',
      '1__',
      '1__',
      '1__',
      '1__',
      '0__',
      '2__',
      '2__',
      '2__',
      '2__',
      '2__',
    ],
    [
      '1__',
      '1__',
      '1__',
      '1__',
      '1__',
      '0__',
      '2__',
      '2__',
      '2__',
      '2__',
      '2__',
    ],
    [
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
      '0__',
    ],
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
      '3__',
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
      '4__',
      '4__',
      '4__',
      '4__',
      '4__',
    ],
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
    [
      '3__',
      '3__',
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
  ];

  const splitMap = palaceMap.map(row => row.map(cell => cell.split('_')));

  const mapHeight = splitMap.length;
  const mapWidth = splitMap[0].length;
  const tileSize = 100;

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
            <Stage width={mapWidth * tileSize} height={mapHeight * tileSize}>
              <Layer>
                {splitMap.map((row, i) =>
                  row.map((tile, j) => {
                    const isRoom = tile[0][0] !== '0';
                    const el = tile[0];
                    const top =
                      i === 0
                        ? el !== '0' // granica, ale tylko jeśli to nie korytarz
                        : splitMap[i - 1][j][0] !== el;

                    const bottom =
                      i === mapHeight - 1
                        ? el !== '0'
                        : splitMap[i + 1][j][0] !== el;

                    const left =
                      j === 0 ? el !== '0' : splitMap[i][j - 1][0] !== el;

                    const right =
                      j === mapWidth - 1
                        ? el !== '0'
                        : splitMap[i][j + 1][0] !== el;

                    const topLeft =
                      i === 0 || j === 0
                        ? false
                        : splitMap[i - 1][j - 1][0] !== el &&
                          splitMap[i - 1][j - 1][0] !== '0';

                    const topRight =
                      i === 0 || j === mapWidth - 1
                        ? false
                        : splitMap[i - 1][j + 1][0] !== el &&
                          splitMap[i - 1][j + 1][0] !== '0';

                    const bottomLeft =
                      i === mapHeight - 1 || j === 0
                        ? false
                        : splitMap[i + 1][j - 1][0] !== el &&
                          splitMap[i + 1][j - 1][0] !== '0';

                    const bottomRight =
                      i === mapHeight - 1 || j === mapWidth - 1
                        ? false
                        : splitMap[i + 1][j + 1][0] !== el &&
                          splitMap[i + 1][j + 1][0] !== '0';
                    return (
                      <PalaceTile
                        key={`${i}-${j}-tile`}
                        tileData={tile}
                        i={i}
                        j={j}
                        s={tileSize}
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
                      ></PalaceTile>
                    );
                  })
                )}
              </Layer>
            </Stage>
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

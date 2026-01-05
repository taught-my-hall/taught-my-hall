import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import useImage from 'use-image';

import Furniture from '../../components/Furniture';
import PalaceTile from '../../components/palaceTile';
import Vignette from '../../components/Vignette';
import FurnitureScreen from '../furniture';

import { FURNITURE_MAP } from '../../utils/furnitureMap';
import {
  getTempPalaceMatrix,
  getTempPalaceRoute,
  setTempPalaceMatrix,
} from '../../utils/tempData';
import { textures } from '../../utils/textures';

const TILE_SIZE = 100;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;

const clampValues = (val, currentScale, mapSize, screenSize) => {
  'worklet';
  const scaledMapSize = mapSize * currentScale;
  const limit = (scaledMapSize + screenSize) / 2;
  return Math.min(Math.max(val, -limit), limit);
};

export default function PalaceSetupScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const [matrix, setMatrix] = useState(() => getTempPalaceMatrix());
  const [selectedFurniture, setSelectedFurniture] = useState(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isFurnitureOpen = useSharedValue(false);

  const layerRef = useRef(null);

  useEffect(() => {
    setTempPalaceMatrix(matrix);
  }, [matrix]);

  const [furnitureSheet] = useImage(textures.furniture);
  const [imgStone] = useImage(textures.stone1);
  const [imgPlanks] = useImage(textures.planks1);
  const [imgBrick] = useImage(textures.brick1);

  const SPLIT_MAP = useMemo(
    () => matrix.map(row => row.map(cell => cell.split('_'))),
    [matrix]
  );
  const MAP_HEIGHT = SPLIT_MAP.length;
  const MAP_WIDTH = useMemo(() => {
    let max = 0;
    SPLIT_MAP.forEach(row => {
      if (row.length > max) max = row.length;
    });
    return max;
  }, [SPLIT_MAP]);

  const MAP_PIXEL_WIDTH = MAP_WIDTH * TILE_SIZE;
  const MAP_PIXEL_HEIGHT = MAP_HEIGHT * TILE_SIZE;

  const imageMap = useMemo(
    () => ({
      stone1: imgStone,
      planks1: imgPlanks,
      brick1: imgBrick,
      furnitureSheet: furnitureSheet,
    }),
    [imgStone, imgPlanks, imgBrick, furnitureSheet]
  );

  const toggleFurnitureAt = (row, col) => {
    if (!selectedFurniture) return;

    setMatrix(prevMatrix => {
      if (!prevMatrix[row] || !prevMatrix[row][col]) return prevMatrix;

      const newMatrix = [...prevMatrix];
      const newRow = [...newMatrix[row]];
      const cellString = newRow[col];
      const parts = cellString.split('_');

      const currentFurniture = parts[1];

      if (currentFurniture === selectedFurniture) {
        parts[1] = '';
      } else {
        parts[1] = selectedFurniture;
      }

      newRow[col] = parts.join('_');
      newMatrix[row] = newRow;
      return newMatrix;
    });
  };

  // Zmiana 3: Logika tapnięcia przyjmuje x i y jako argumenty
  // Używamy SCREEN_WIDTH z hooka useWindowDimensions
  const handleTapLogic = (tapX, tapY) => {
    const screenCenterX = SCREEN_WIDTH / 2;
    const screenCenterY = SCREEN_HEIGHT / 2;
    const ROOM_CENTER_X = MAP_PIXEL_WIDTH / 2;
    const ROOM_CENTER_Y = MAP_PIXEL_HEIGHT / 2;

    // Odwracamy transformacje:
    // 1. Odejmujemy środek ekranu (żeby mieć 0 na środku)
    // 2. Odejmujemy przesunięcie (translateX)
    // 3. Dzielimy przez skalę (zoom)
    // 4. Dodajemy środek pokoju (żeby wrócić do układu współrzędnych mapy 0,0 w lewym górnym rogu)
    const mapX =
      (tapX - screenCenterX - translateX.value) / scale.value + ROOM_CENTER_X;
    const mapY =
      (tapY - screenCenterY - translateY.value) / scale.value + ROOM_CENTER_Y;

    const col = Math.floor(mapX / TILE_SIZE);
    const row = Math.floor(mapY / TILE_SIZE);

    // Dodatkowe logi do debugowania, jeśli nadal nie działa
    // console.log({ tapX, screenCenterX, transX: translateX.value, scale: scale.value, mapX, col });

    if (row >= 0 && row < MAP_HEIGHT && col >= 0 && col < MAP_WIDTH) {
      toggleFurnitureAt(row, col);
    }
  };

  const processedTiles = useMemo(() => {
    const tiles = [];
    SPLIT_MAP.forEach((row, i) => {
      row.forEach((tile, j) => {
        const el = tile[0];

        const check = (r, c) => {
          if (r < 0 || r >= MAP_HEIGHT || c < 0 || c >= MAP_WIDTH) return true;
          if (!SPLIT_MAP[r] || !SPLIT_MAP[r][c]) return true;
          return SPLIT_MAP[r][c][0] !== el;
        };

        const checkDiag = (r, c) => {
          if (r < 0 || r >= MAP_HEIGHT || c < 0 || c >= MAP_WIDTH) return true;
          if (!SPLIT_MAP[r] || !SPLIT_MAP[r][c]) return true;
          return SPLIT_MAP[r][c][0] !== el && SPLIT_MAP[r][c][0] !== '0';
        };

        const top = check(i - 1, j);
        const bottom = check(i + 1, j);
        const left = check(i, j - 1);
        const right = check(i, j + 1);

        const topLeft = checkDiag(i - 1, j - 1);
        const topRight = checkDiag(i - 1, j + 1);
        const bottomLeft = checkDiag(i + 1, j - 1);
        const bottomRight = checkDiag(i + 1, j + 1);

        tiles.push(
          <PalaceTile
            key={`${i}-${j}-tile-${tile[1]}`}
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
  }, [SPLIT_MAP, imageMap, MAP_HEIGHT, MAP_WIDTH]);

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
        try {
          layerRef.current.cache({
            pixelRatio: 1,
            x: 0,
            y: 0,
            width: MAP_PIXEL_WIDTH,
            height: MAP_PIXEL_HEIGHT,
          });
        } catch (e) {
          console.log('Cache error skipped');
        }
      }
    });
    return () => cancelAnimationFrame(cacheHandle);
  }, [processedTiles, imageMap, MAP_PIXEL_WIDTH, MAP_PIXEL_HEIGHT]);

  const panGesture = Gesture.Pan()
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
        SCREEN_WIDTH
      );
      translateY.value = clampValues(
        rawY,
        scale.value,
        MAP_PIXEL_HEIGHT,
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
      const newScale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);
      scale.value = newScale;

      // Przy zoomowaniu też clampujemy, żeby nie uciekło
      translateX.value = clampValues(
        translateX.value,
        newScale,
        MAP_PIXEL_WIDTH,
        SCREEN_WIDTH
      );
      translateY.value = clampValues(
        translateY.value,
        newScale,
        MAP_PIXEL_HEIGHT,
        SCREEN_HEIGHT
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Zmiana 4: Przekazujemy e.x i e.y explicite do runOnJS
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(e => {
      runOnJS(handleTapLogic)(e.x, e.y);
    });

  const composedGestures = Gesture.Race(
    tapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture)
  );

  const handleWheel = useCallback(e => {}, []);

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
          {/* Zmiana 5: Upewniamy się, że wrapper ma rozmiar całej mapy */}
          <Animated.View
            style={[
              style.rectangle,
              { width: MAP_PIXEL_WIDTH, height: MAP_PIXEL_HEIGHT },
              animatedStyle,
            ]}
          >
            <Stage
              width={MAP_PIXEL_WIDTH}
              height={MAP_PIXEL_HEIGHT}
              options={{ pixelRatio: 1 }}
            >
              <Layer ref={layerRef} listening={false}>
                {processedTiles}
              </Layer>
            </Stage>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* --- SIDEBAR LIST (Furniture) --- */}
      <View style={style.furnitureListBlock}>
        <Text style={style.headerListTitle}>Furniture</Text>
        <ScrollView contentContainerStyle={style.furnitureListContent}>
          {Object.keys(FURNITURE_MAP).map(key => {
            const isSelected = selectedFurniture === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedFurniture(isSelected ? null : key)}
                style={[
                  style.furnitureItem,
                  isSelected && style.furnitureItemActive,
                ]}
              >
                {/* Zmiana: Optymalizacja Sidebaru - jeśli renderowanie wielu Stage 
                   powoduje lagi, można tu użyć statycznych obrazków PNG, 
                   ale zostawiam jak jest zgodnie z Twoim kodem, bo prosiłeś tylko o fixa klikania.
                */}
                {furnitureSheet && (
                  <View style={{ width: 40, height: 40, overflow: 'hidden' }}>
                    <Stage width={40} height={40}>
                      <Layer>
                        <Furniture
                          modelname={key}
                          image={furnitureSheet}
                          tileSize={40}
                        />
                      </Layer>
                    </Stage>
                  </View>
                )}
                <Text style={{ color: 'white', fontSize: 10 }}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Pressable
        onPress={() => {
          setTempPalaceMatrix(matrix);
          const route = getTempPalaceRoute();
          router.navigate(route ?? '/backrooms');
        }}
        style={style.reviewButton}
      >
        <Text style={style.reviewButtonText}>Save</Text>
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
    backgroundColor: '#333',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rectangle: {
    // backgroundColor: '#4a90e2', // Opcjonalnie wyłącz kolor tła, żeby widzieć tylko mapę
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
    zIndex: 200,
  },
  reviewButtonText: { fontSize: 24, color: '#FFF' },
  furnitureListBlock: {
    position: 'absolute',
    left: 50,
    top: 50,
    width: 100,
    height: '80%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  headerListTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  furnitureListContent: {
    alignItems: 'center',
    gap: 15,
    paddingBottom: 20,
  },
  furnitureItem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  furnitureItemActive: {
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#444',
  },
});

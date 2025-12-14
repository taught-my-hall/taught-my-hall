import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import useImage from 'use-image';

// Importy komponentów
import Furniture from '../../components/Furniture'; // Zakładam, że tu jest komponent z poprzedniego promptu
import PalaceTile from '../../components/palaceTile';
import Vignette from '../../components/Vignette';
import FurnitureScreen from '../furniture';

// Importy danych
import { FURNITURE_MAP } from '../../utils/furnitureMap';
import { getTempPalaceMatrix, setTempPalaceMatrix } from '../../utils/tempData';
import { textures } from '../../utils/textures';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TILE_SIZE = 100;
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

export default function PalaceSetupScreen() {
  const router = useRouter();

  const [matrix, setMatrix] = useState(() => getTempPalaceMatrix());
  const [selectedFurniture, setSelectedFurniture] = useState(null);

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

  const SPLIT_MAP = useMemo(
    () => matrix.map(row => row.map(cell => cell.split('_'))),
    [matrix]
  );
  const MAP_HEIGHT = SPLIT_MAP.length;
  const MAP_WIDTH = SPLIT_MAP[0].length;
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
      const newMatrix = [...prevMatrix];
      const newRow = [...newMatrix[row]];
      const cellString = newRow[col];
      const parts = cellString.split('_');
      if (parts[0] === '0') return prevMatrix;

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

  const handleTapLogic = evt => {
    const screenCenterX = SCREEN_WIDTH / 2;
    const screenCenterY = SCREEN_HEIGHT / 2;
    const ROOM_CENTER_X = MAP_PIXEL_WIDTH / 2;
    const ROOM_CENTER_Y = MAP_PIXEL_HEIGHT / 2;

    const mapX =
      (evt.x - screenCenterX - translateX.value) / scale.value + ROOM_CENTER_X;
    const mapY =
      (evt.y - screenCenterY - translateY.value) / scale.value + ROOM_CENTER_Y;

    const col = Math.floor(mapX / TILE_SIZE);
    const row = Math.floor(mapY / TILE_SIZE);

    if (row >= 0 && row < MAP_HEIGHT && col >= 0 && col < MAP_WIDTH) {
      toggleFurnitureAt(row, col);
    }
  };

  const processedTiles = useMemo(() => {
    const tiles = [];

    SPLIT_MAP.forEach((row, i) => {
      row.forEach((tile, j) => {
        const el = tile[0]; // Room ID

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
            width: MAP_WIDTH * TILE_SIZE,
            height: MAP_HEIGHT * TILE_SIZE,
          });
        } catch (e) {
          console.log('Cache error skipped during render');
        }
      }
    });
    return () => cancelAnimationFrame(cacheHandle);
  }, [processedTiles, imageMap, MAP_WIDTH, MAP_HEIGHT]);

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
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(e => {
      runOnJS(handleTapLogic)(e);
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
          <Animated.View
            style={[
              style.rectangle,
              { width: MAP_WIDTH * TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE },
              animatedStyle,
            ]}
          >
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
                {/* Renderujemy mebel używając Twojego komponentu Furniture */}
                {furnitureSheet && (
                  <View style={{ width: 40, height: 40 }}>
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
                {/* Opcjonalnie nazwa */}
                <Text style={{ color: 'white', fontSize: 10 }}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Pressable
        onPress={() => {
          setTempPalaceMatrix(matrix);
          router.navigate('/backrooms');
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
    zIndex: 200,
  },
  reviewButtonText: { fontSize: 24, color: '#FFF' },

  // --- STYLING SIDEBARU (Wzorowane na poprzednim ekranie) ---
  furnitureListBlock: {
    position: 'absolute',
    left: 50,
    top: 50,
    width: 100, // Węższy niż pokoje, bo tylko ikony
    height: '80%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 100, // Nad mapą
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
    backgroundColor: '#222', // Tło dla nieaktywnego
  },
  furnitureItemActive: {
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#444',
  },
});

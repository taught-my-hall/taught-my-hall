import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
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
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import useImage from 'use-image';

import { apiClient } from '../../../services/apiClient';

import Furniture from '../../components/Furniture';
import FurnitureScreen from '../../components/FurnitureScreen';
import PalaceTile from '../../components/palaceTile';
import Vignette from '../../components/Vignette';

import { FURNITURE_MAP } from '../../utils/furnitureMap';
import {
  getPalacesData,
  getTempPalaceId,
  getTempPalaceMatrix,
  getTempPalaceName,
  setTempPalaceMatrix,
  updatePalaceInCache,
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

  // 2. --- ZMIANA: Tłumaczenie ID na Nazwy przy inicjalizacji ---
  const [matrix, setMatrix] = useState(() => {
    const rawMatrix = getTempPalaceMatrix();
    const palaceId = getTempPalaceId();

    // Jeśli nie ma ID (nowy pałac), zwracamy czystą macierz
    if (!palaceId) return rawMatrix;

    // Pobieramy dane pałacu, żeby dostać listę furniture
    const allPalaces = getPalacesData();
    const currentPalace = allPalaces.find(
      p => String(p.id) === String(palaceId)
    );

    // Jeśli nie znaleziono pałacu lub mebli, nic nie robimy
    if (!currentPalace || !currentPalace.furniture) return rawMatrix;

    // Tworzymy mapę: ID -> NAZWA (np. 15 -> 'bedGreen')
    const idToNameMap = {};
    currentPalace.furniture.forEach(item => {
      idToNameMap[item.id] = item.name;
    });

    // Przelatujemy przez macierz i podmieniamy ID na nazwy
    return rawMatrix.map(row =>
      row.map(cell => {
        if (!cell || typeof cell !== 'string') return cell;

        const parts = cell.split('_');
        // parts[0] = tło (np. "1"), parts[1] = mebel (np. "15" lub "bedGreen")
        const furniturePart = parts[1];

        // Sprawdzamy czy to liczba (ID) i czy mamy jej nazwę
        if (
          furniturePart &&
          !isNaN(furniturePart) &&
          idToNameMap[furniturePart]
        ) {
          parts[1] = idToNameMap[furniturePart];
          // Zwracamy zrekonstruowany string: "1_bedGreen_"
          return parts.join('_') + (cell.endsWith('_') ? '' : '_');
        }

        return cell;
      })
    );
  });

  const [selectedFurniture, setSelectedFurniture] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isFurnitureOpen = useSharedValue(false);

  const listScrollY = useSharedValue(0);
  const startScrollY = useSharedValue(0);
  const isDraggingScroll = useSharedValue(false);

  const [listHeight, setListHeight] = useState(0);
  const [listContentHeight, setListContentHeight] = useState(0);
  const scrollViewRef = useAnimatedRef();

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

  const handleTapLogic = (tapX, tapY) => {
    const screenCenterX = SCREEN_WIDTH / 2;
    const screenCenterY = SCREEN_HEIGHT / 2;
    const ROOM_CENTER_X = MAP_PIXEL_WIDTH / 2;
    const ROOM_CENTER_Y = MAP_PIXEL_HEIGHT / 2;

    const mapX =
      (tapX - screenCenterX - translateX.value) / scale.value + ROOM_CENTER_X;
    const mapY =
      (tapY - screenCenterY - translateY.value) / scale.value + ROOM_CENTER_Y;

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
      if (isDraggingScroll.value) return;

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
      if (isDraggingScroll.value) return;
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
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(e => {
      runOnJS(handleTapLogic)(e.x, e.y);
    });

  const composedGestures = Gesture.Race(
    tapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture)
  );

  const scrollHandler = useAnimatedScrollHandler(event => {
    if (!isDraggingScroll.value) {
      listScrollY.value = event.contentOffset.y;
    }
  });

  const panScrollGesture = Gesture.Pan()
    .averageTouches(true)
    .activateAfterLongPress(0)
    .onStart(() => {
      isDraggingScroll.value = true;
      startScrollY.value = listScrollY.value;
    })
    .onUpdate(e => {
      const visibleHeight = listHeight;
      const fullHeight = listContentHeight;

      if (fullHeight <= visibleHeight || visibleHeight === 0) return;

      const indicatorHeight = (visibleHeight / fullHeight) * visibleHeight;
      const maxScroll = fullHeight - visibleHeight;
      const maxIndicatorMove = visibleHeight - indicatorHeight;

      const multiplier = maxScroll / maxIndicatorMove;
      const targetScrollY = startScrollY.value + e.translationY * multiplier;
      const clampedScrollY = Math.min(Math.max(targetScrollY, 0), maxScroll);

      listScrollY.value = clampedScrollY;
      scrollTo(scrollViewRef, 0, clampedScrollY, false);
    })
    .onEnd(() => {
      isDraggingScroll.value = false;
    })
    .onFinalize(() => {
      isDraggingScroll.value = false;
    });

  const scrollIndicatorStyle = useAnimatedStyle(() => {
    const visibleHeight = listHeight;
    const fullHeight = listContentHeight;

    if (fullHeight <= visibleHeight || visibleHeight === 0) {
      return { opacity: 0 };
    }

    const indicatorHeight = (visibleHeight / fullHeight) * visibleHeight;
    const maxScroll = fullHeight - visibleHeight;
    const maxIndicatorMove = visibleHeight - indicatorHeight;

    const scrollRatio = listScrollY.value / maxScroll;
    const translateY = scrollRatio * maxIndicatorMove;

    return {
      height: indicatorHeight,
      transform: [{ translateY: isNaN(translateY) ? 0 : translateY }],
      opacity: 1,
    };
  });

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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const palaceId = getTempPalaceId();
      const name = getTempPalaceName();

      const apiMatrix = matrix.map(row =>
        row.map(cell => {
          if (!cell) return null;
          if (typeof cell === 'string') {
            if (cell.endsWith('__')) return cell.slice(0, -1);
            if (!cell.endsWith('_')) return cell + '_';
          }
          return cell;
        })
      );

      const payload = {
        name: name,
        palace_matrix: apiMatrix,
      };

      let serverResponse;

      if (palaceId) {
        serverResponse = await apiClient(`/api/palaces/${palaceId}/`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        serverResponse = await apiClient('/api/palaces/', {
          method: 'POST',
          body: payload,
        });
      }

      if (serverResponse) {
        updatePalaceInCache(serverResponse);
        setTempPalaceMatrix(serverResponse.palace_matrix);

        router.navigate(`/palace/${serverResponse.id}`);
      }
    } catch (error) {
      console.error('SAVE ERROR:', error);
      Alert.alert('Error', 'Nie udało się zapisać.');
    } finally {
      setIsSaving(false);
    }
  };

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

      <View
        style={style.furnitureListBlock}
        onLayout={e => setListHeight(e.nativeEvent.layout.height - 40)}
      >
        <Text style={style.headerListTitle}>Furniture</Text>

        <View style={{ flex: 1, width: '100%', position: 'relative' }}>
          <Animated.ScrollView
            ref={scrollViewRef}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={style.furnitureListContent}
            onContentSizeChange={(w, h) => setListContentHeight(h)}
          >
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
          </Animated.ScrollView>

          <View style={style.customScrollTrack}>
            <GestureDetector gesture={panScrollGesture}>
              <Animated.View
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                style={[style.customScrollBar, scrollIndicatorStyle]}
              />
            </GestureDetector>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={isSaving}
        style={style.reviewButton}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={style.reviewButtonText}>Save</Text>
        )}
      </Pressable>

      <Vignette isOpened={isFurnitureOpen}>
        {/* Zabezpieczenie: renderuj tylko jeśli selectedFurniture istnieje */}
        {selectedFurniture && (
          // W Setupie masz tylko nazwę mebla (klucz), nie masz ID z bazy danych
          // Jeśli FurnitureScreen wymaga ID, to tutaj będzie problem,
          // ale żeby nie wywalało błędu, przekaż stringa lub null.
          <FurnitureScreen furnitureId={selectedFurniture} />
        )}
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
  rectangle: {},
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
    overflow: 'hidden',
    left: 50,
    top: 50,
    width: 200,
    height: '80%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerListTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  furnitureListContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 80,
    paddingRight: 18,
    paddingLeft: 4,
  },
  furnitureItem: {
    width: 78,
    height: 75,
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
  customScrollTrack: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 101,
  },
  customScrollBar: {
    width: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginVertical: 2,
  },
});

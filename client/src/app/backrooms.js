import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, // 1. Imported ActivityIndicator
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import useImage from 'use-image';

import { apiClient } from '../../services/apiClient';
import BackroomSegment from '../components/BackroomLines';
import { setPalacesData, setTempPalaceMatrix } from '../utils/tempData';
import { textures } from '../utils/textures';

export default function BackroomScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const svgWidth = width * 3;

  // 2. Initialize loading to true so we don't show the empty state prematurely
  const [isLoading, setIsLoading] = useState(true);
  const [palaces, setPalaces] = useState([]);
  const [pointer, setPointer] = useState(0);
  const [pointerBefore, setPointerBefore] = useState(0);

  const offset = useRef(new Animated.Value(0)).current;

  const fetchPalaceList = useCallback(async () => {
    try {
      const data = await apiClient('/api/palaces/', {
        method: 'GET',
      });
      if (data) {
        setPalaces(data);
        setPalacesData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // 3. Mark loading as finished regardless of success or failure
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPalaceList();
  }, [fetchPalaceList]);

  const [imgWall1] = useImage(textures.wall1);
  const [imgWall2] = useImage(textures.wall2);
  const [imgFloor] = useImage(textures.wall4);
  const [imgWood] = useImage(textures.wood3);

  const imageMap = useMemo(
    () => ({
      wall1: imgWall1,
      floor: imgFloor,
      wall2: imgWall2,
      wood1: imgWood,
    }),
    [imgWall1, imgWall2, imgFloor, imgWood]
  );

  const textureConfig = {
    floor: imageMap.floor,
    wall: imageMap.wall1,
    ceil: imageMap.wall2,
    door: imageMap.wood1,
  };

  const emptyStateTextures = {
    ...textureConfig,
    door: null,
  };

  const pointedIndices = [pointer - 1, pointer, pointer + 1];

  const animateMove = direction => {
    Animated.timing(offset, {
      toValue: width * -direction,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setPointer(prev =>
        direction < 0
          ? Math.max(prev - 1, 0)
          : Math.min(prev + 1, palaces.length - 1)
      );
      offset.setValue(0);
    });
  };

  const roomLeft = () => {
    setPointerBefore(prev => Math.max(prev - 1, 0));
    if (pointer === 0) return;
    animateMove(-1);
  };

  const roomRight = () => {
    setPointerBefore(prev => Math.min(prev + 1, palaces.length - 1));
    if (pointer === palaces.length - 1) return;
    animateMove(1);
  };

  const openNewPalace = () => {
    setTempPalaceMatrix(null);
    router.navigate('/palace/create');
  };

  // 4. Show Loading Spinner while fetching
  // This prevents the "Create first room" door from flashing briefly
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        key={`container-${width}`}
        style={[
          styles.svgBox,
          {
            width: svgWidth,
            height: height,
            transform: [{ translateX: offset }],
          },
        ]}
      >
        <View style={{ width: svgWidth, height: height }}>
          {palaces.length === 0 ? (
            <View
              style={{ position: 'absolute', top: 0, left: 0, width, height }}
              pointerEvents="box-none"
            >
              <BackroomSegment
                i={0}
                p={0}
                total={1}
                title="Create first room!"
                svgWidth={svgWidth}
                images={emptyStateTextures}
                onPress={openNewPalace}
              />
            </View>
          ) : (
            pointedIndices.map((p, i) => {
              if (p < 0 || p >= palaces.length) return null;

              const currentPalace = palaces[p];

              return (
                <View
                  key={`palace-wrapper-${currentPalace.id || p}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                  }}
                  pointerEvents="box-none"
                >
                  <BackroomSegment
                    i={i - 1}
                    p={p}
                    total={palaces.length}
                    title={currentPalace.name}
                    svgWidth={svgWidth}
                    images={textureConfig}
                    onPress={() => {
                      router.navigate(`/palace/${currentPalace.id}`);
                    }}
                  />
                </View>
              );
            })
          )}
        </View>
      </Animated.View>

      {palaces.length > 0 && pointerBefore !== 0 && (
        <Pressable
          style={[styles.button, styles.buttonLeft]}
          onPress={roomLeft}
        >
          <Text selectable={false} style={styles.buttonText}>
            {'<'}
          </Text>
        </Pressable>
      )}

      {palaces.length > 0 && pointerBefore !== palaces.length - 1 && (
        <Pressable
          style={[styles.button, styles.buttonRight]}
          onPress={roomRight}
        >
          <Text selectable={false} style={styles.buttonText}>
            {'>'}
          </Text>
        </Pressable>
      )}

      <Pressable onPress={openNewPalace} style={styles.reviewButton}>
        <Text style={styles.newPalaceText}>New Palace</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
    backgroundColor: '#8d8d8d',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  buttonLeft: {
    left: 0,
  },
  buttonRight: {
    right: 0,
  },
  buttonText: {
    fontSize: 48,
    textAlign: 'center',
    margin: 0,
  },
  svgBox: {
    position: 'absolute',
    top: 0,
    left: 0,
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
  newPalaceText: {
    fontSize: 24,
    color: '#FFF',
  },
});

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { apiClient } from '../../services/apiClient';
import BackroomLines from '../components/BackroomLines';
import {
  getPalacesData,
  setPalacesData,
  setTempPalaceId,
  setTempPalaceMatrix,
  setTempPalaceName,
} from '../utils/tempData';
import { textures } from '../utils/textures';

export default function BackroomScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const svgWidth = width * 3;

  const [isLoading, setIsLoading] = useState(true);
  const [palaces, setPalaces] = useState([]);
  const [pointer, setPointer] = useState(0);
  const [pointerBefore, setPointerBefore] = useState(0);

  const [palaceIds, setPalaceIds] = useState([]);

  const offset = useRef(new Animated.Value(0)).current;

  const setIds = data => {
    const idx = Object.keys(data).map(Number);
    idx.sort((a, b) => a - b);
    setPalaceIds(idx);
  };

  const fetchPalaceList = useCallback(async () => {
    const cachedData = getPalacesData();

    if (cachedData) {
      setPalaces(cachedData);
      setIds(cachedData);
      setIsLoading(false);
      return;
    } else {
      try {
        const data = await apiClient('/api/palaces/', {
          method: 'GET',
        });
        if (data) {
          const modifiedData = Object.fromEntries(
            Object.values(data).map(el => [el.id, el])
          );
          setPalaces(modifiedData);
          setPalacesData(modifiedData);
          setIds(modifiedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPalaceList();
  }, [fetchPalaceList]);

  const textureConfig = {
    floor: textures.wall4,
    wall: textures.wall1,
    ceil: textures.wall2,
    door: textures.wood3,
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
      useNativeDriver: false,
    }).start(() => {
      setPointer(prev =>
        direction < 0
          ? Math.max(prev - 1, 0)
          : Math.min(prev + 1, palaceIds.length - 1)
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
    setPointerBefore(prev => Math.min(prev + 1, palaceIds.length - 1));
    if (pointer === palaceIds.length - 1) return;
    animateMove(1);
  };

  const openNewPalace = () => {
    setTempPalaceMatrix(null);
    setTempPalaceId(null);
    setTempPalaceName('');
    router.navigate('/palace/create');
  };

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
          {palaceIds.length === 0 ? (
            <View
              style={{ position: 'absolute', top: 0, left: 0, width, height }}
              pointerEvents="box-none"
            >
              <BackroomLines
                i={0}
                p={0}
                total={1}
                title="Create first room!"
                svgWidth={svgWidth}
                images={emptyStateTextures}
                palaceId="empty-state"
                onPress={openNewPalace}
              />
            </View>
          ) : (
            pointedIndices.map((p, i) => {
              if (p < 0 || p >= palaceIds.length) return null;

              const currentPalace = palaces[palaceIds[p]];

              console.log(currentPalace);

              const uniqueKey = `palace-${currentPalace.id}-view-${i}`;

              return (
                <View
                  key={uniqueKey}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                  }}
                  pointerEvents="box-none"
                >
                  <BackroomLines
                    i={i - 1}
                    p={p}
                    total={palaceIds.length}
                    title={currentPalace.name}
                    svgWidth={svgWidth}
                    images={textureConfig}
                    palaceId={currentPalace.id}
                    onPress={() => {
                      setTempPalaceId(currentPalace.id);
                      setTempPalaceName(currentPalace.name);
                      console.log(currentPalace);
                      router.navigate(`/palace/${currentPalace.id}`);
                    }}
                  />
                </View>
              );
            })
          )}
        </View>
      </Animated.View>

      {palaceIds.length > 0 && pointerBefore !== 0 && (
        <Pressable
          style={[styles.button, styles.buttonLeft]}
          onPress={roomLeft}
        >
          <Text selectable={false} style={styles.buttonText}>
            {'<'}
          </Text>
        </Pressable>
      )}

      {palaceIds.length > 0 && pointerBefore !== palaceIds.length - 1 && (
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

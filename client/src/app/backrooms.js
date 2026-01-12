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
// UWAGA: Wywaliłem useImage, bo tu go nie potrzebujemy
// BackroomLines to teraz SVG i sam sobie ogarnie assety

import { apiClient } from '../../services/apiClient';
// Upewnij się, że importujesz poprawną nazwę (u Ciebie był z tym problem)
import BackroomLines from '../components/BackroomLines';
import {
  setPalacesData,
  setTempPalaceId,
  setTempPalaceMatrix,
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

  const offset = useRef(new Animated.Value(0)).current;

  const fetchPalaceList = useCallback(async () => {
    try {
      const data = await apiClient('/api/palaces/', {
        method: 'GET',
      });
      if (data) {
        setPalaces(data);
        // console.log(data); // Debug off
        setPalacesData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPalaceList();
  }, [fetchPalaceList]);

  // Używamy surowych importów z textures
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
      useNativeDriver: false, // SVG i Layout lepiej działają bez native drivera tutaj
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
    setTempPalaceId(null);
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
          {palaces.length === 0 ? (
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
                palaceId="empty-state" // Fake ID dla pustego stanu
                onPress={openNewPalace}
              />
            </View>
          ) : (
            pointedIndices.map((p, i) => {
              if (p < 0 || p >= palaces.length) return null;

              const currentPalace = palaces[p];

              // FIX NA BŁĄD "Duplicate key":
              // Klucz musi być unikalny dla pozycji w renderze (i) oraz danych (id).
              // Dodanie 'view-i' gwarantuje, że React wie, który to slot.
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
                    i={i - 1} // Pozycja wizualna (-1, 0, 1)
                    p={p} // Index w tablicy
                    total={palaces.length}
                    title={currentPalace.name}
                    svgWidth={svgWidth}
                    images={textureConfig}
                    palaceId={currentPalace.id} // <--- TO JEST KLUCZOWE DLA TEKSTUR
                    onPress={() => {
                      setTempPalaceId(currentPalace.id);
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

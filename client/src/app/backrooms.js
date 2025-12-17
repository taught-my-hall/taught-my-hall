import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { apiClient } from '../../services/apiClient';
import BackroomLines from '../components/BackroomLines';
import PalaceList from '../components/PalaceList';
import Vignette from '../components/Vignette';

const { width, height } = Dimensions.get('window');
const svgWidth = width * 3;

export default function BackroomScreen() {
  const router = useRouter();
  const isNewPalaceOpen = useSharedValue(false);

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
      }
    } catch (err) {
      console.error('Failed to load palaces:', err);
    }
  }, []);

  useEffect(() => {
    fetchPalaceList();
  }, [fetchPalaceList]);

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
          : Math.min(prev + 1, palaces.length - 1)
      );

      offset.setValue(0);
    });
  };

  const moveLeft = () => {
    setPointerBefore(prev => Math.max(prev - 1, 0));
    if (pointer === 0) return;
    animateMove(-1);
  };

  const moveRight = () => {
    setPointerBefore(prev => Math.min(prev + 1, palaces.length - 1));
    if (pointer === palaces.length - 1) return;
    animateMove(1);
  };

  const openNewPalace = () => {
    isNewPalaceOpen.value = true;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.svgBox, { transform: [{ translateX: offset }] }]}
      >
        <View style={{ width: svgWidth, height: height }}>
          {pointedIndices.map((p, i) => {
            if (p < 0 || p >= palaces.length) return null;

            const currentPalace = palaces[p];

            return (
              <View
                key={i}
                style={StyleSheet.absoluteFill}
                pointerEvents="box-none"
              >
                <BackroomLines
                  onPress={() => {
                    router.navigate('/palace/TODO');
                  }}
                  i={i}
                  p={p}
                  total={palaces.length}
                  title={currentPalace.name}
                  svgWidth={svgWidth}
                />
              </View>
            );
          })}
        </View>
      </Animated.View>
      {pointerBefore !== 0 && (
        <Pressable style={[styles.button, { left: 0 }]} onPress={moveLeft}>
          <Text selectable={false} style={styles.buttonText}>
            {'<'}
          </Text>
        </Pressable>
      )}
      {pointerBefore !== palaces.length - 1 && (
        <Pressable style={[styles.button, { right: 0 }]} onPress={moveRight}>
          <Text selectable={false} style={styles.buttonText}>
            {'>'}
          </Text>
        </Pressable>
      )}
      <Pressable onPress={openNewPalace} style={styles.reviewButton}>
        <Text style={{ fontSize: 24, color: '#FFF' }}>New Palace</Text>
      </Pressable>
      <Vignette isOpened={isNewPalaceOpen}>
        <PalaceList />
      </Vignette>
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
  text: {
    color: '#fff',
    fontSize: 24,
  },
  button: {
    position: 'absolute',
    backgroundColor: '#8d8d8d',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 48,
    textAlign: 'center',
    margin: 0,
  },
  svgBox: {
    position: 'absolute',
    top: 0,
    width: svgWidth,
    height: height,
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

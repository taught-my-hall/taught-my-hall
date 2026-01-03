import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import useImage from 'use-image';

// Adjust this path if your file is actually in utils
import { apiClient } from '../../services/apiClient';
import BackroomSegment from '../components/BackroomLines';
import PalaceList from '../components/PalaceList';
import Vignette from '../components/Vignette';
import { textures } from '../utils/textures';

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

  // Texture loading
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
    isNewPalaceOpen.value = true;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.svgBox, { transform: [{ translateX: offset }] }]}
      >
        <View style={styles.roomsContainer}>
          {pointedIndices.map((p, i) => {
            if (p < 0 || p >= palaces.length) return null;

            const isFirstRoom = p === 0;
            const isLastRoom = p === palaces.length - 1;
            const currentPalace = palaces[p];

            return (
              <BackroomSegment
                key={`palace-${currentPalace.id || p}`}
                xOffset={i * width}
                title={currentPalace.name}
                images={textureConfig}
                isFirst={isFirstRoom}
                isLast={isLastRoom}
                onPress={() => {
                  router.navigate(`/palace/${currentPalace.id}`);
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      {pointerBefore !== 0 && (
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
  roomsContainer: {
    width: svgWidth,
    height: height,
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
    zIndex: 200,
  },
  newPalaceText: {
    fontSize: 24,
    color: '#FFF',
  },
});

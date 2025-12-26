import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
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
import BackroomSegment from '../components/BackroomLines';
import PalaceList from '../components/PalaceList';
import Vignette from '../components/Vignette';
import { textures } from '../utils/textures';

const { width, height } = Dimensions.get('window');
const svgWidth = width * 3;

export default function BackroomScreen() {
  const router = useRouter();
  const isNewPalaceOpen = useSharedValue(false);
  const [rooms, setRooms] = useState([
    { title: 'Create new room' },
    { title: 'Room 1' },
    { title: 'Room 2' },
    { title: 'Room 3' },
  ]);
  const [pointer, setPointer] = useState(0);
  const [pointerBefore, setPointerBefore] = useState(0);

  const offset = useRef(new Animated.Value(0)).current;

  const pointedRooms = [pointer - 1, pointer, pointer + 1];

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

  const animateMove = direction => {
    Animated.timing(offset, {
      toValue: width * -direction,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setPointer(prev =>
        direction < 0
          ? Math.max(prev - 1, 0)
          : Math.min(prev + 1, rooms.length - 1)
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
    setPointerBefore(prev => Math.min(prev + 1, rooms.length - 1));
    if (pointer === rooms.length - 1) return;
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
        {/* ZMIANA: Usunięto Stage i Layer. Mamy zwykły View jako kontener */}
        <View style={{ width: svgWidth, height: height }}>
          {pointedRooms.map((p, i) => {
            if (p < 0 || p >= rooms.length) return null;

            const isFirstRoom = p === 0;
            const isLastRoom = p === rooms.length - 1;

            return (
              <BackroomSegment
                key={`room-${p}`}
                xOffset={i * width}
                title={rooms[p].title}
                images={textureConfig}
                isFirst={isFirstRoom}
                isLast={isLastRoom}
                onPress={() => {
                  console.log('Kliknięto pokój:', rooms[p].title);
                  router.navigate('/palace/TODO');
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Przyciski nawigacyjne */}
      {pointerBefore !== 0 && (
        <Pressable style={[styles.button, { left: 0 }]} onPress={roomLeft}>
          <Text selectable={false} style={styles.buttonText}>
            {'<'}
          </Text>
        </Pressable>
      )}
      {pointerBefore !== rooms.length - 1 && (
        <Pressable style={[styles.button, { right: 0 }]} onPress={roomRight}>
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
  button: {
    position: 'absolute',
    backgroundColor: '#8d8d8d',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
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
});

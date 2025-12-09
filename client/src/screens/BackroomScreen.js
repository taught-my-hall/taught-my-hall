import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import BackroomLines from '../components/BackroomLines.js';
import PalaceList from '../components/PalaceList';
import Vignette from '../components/Vignette';

const { width, height } = Dimensions.get('window');
const svgWidth = width * 3;

export default function BackroomScreen() {
  const navigation = useNavigation();
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

  console.log(pointer);
  const pointedRooms = [pointer - 1, pointer, pointer + 1];

  const animateMove = direction => {
    Animated.timing(offset, {
      toValue: width * -direction,
      duration: 300,
      useNativeDriver: false,
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

  const handleRoomEnter = () => {
    navigation.navigate('Palace');
  };

  const vignetteAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isNewPalaceOpen.value ? 1 : 0, { duration: 300 }),
    };
  });

  const openNewPalace = () => {
    isNewPalaceOpen.value = true;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.svgBox, { transform: [{ translateX: offset }] }]}
      >
        <View style={{ width: svgWidth, height: height }}>
          {pointedRooms.map((p, i) => {
            if (p < 0 || p >= rooms.length) return null;
            return (
              <View
                key={i}
                style={StyleSheet.absoluteFill}
                pointerEvents="box-none"
              >
                <BackroomLines
                  onPress={handleRoomEnter}
                  i={i}
                  p={p}
                  total={rooms.length}
                  title={rooms[p].title}
                  svgWidth={svgWidth} // <--- Pass this prop!
                />
              </View>
            );
          })}
        </View>
      </Animated.View>
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

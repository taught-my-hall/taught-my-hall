import React, { useState, useRef, use } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg from 'react-native-svg';
import BackroomLines from '../components/BackroomLines.js';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const svgWidth = width * 3;

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
});

export default function BackroomScreen() {
  const navigation = useNavigation();
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
    navigation.navigate('Room');
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
    </View>
  );
}

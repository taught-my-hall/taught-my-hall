import { Platform, StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export default function RoomScreen() {
  // --- SHARED VALUES ---
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // --- GESTURES ---
  const panGesture = Gesture.Pan()
    .minDistance(3)
    .averageTouches(true)
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composedGestures = Gesture.Simultaneous(panGesture, pinchGesture);

  // --- WHEEL HANDLER (WEB) ---
  const handleWheel = e => {
    if (Platform.OS !== 'web') return;

    const scrollAmount = e.deltaY;
    const sensitivity = 0.001;
    let newScale = scale.value - scrollAmount * sensitivity;

    newScale = Math.max(0.5, Math.min(newScale, 5));

    scale.value = newScale;
    savedScale.value = newScale;
  };

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGestures}>
        <Animated.View
          style={style.container}
          {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
        >
          <Animated.View style={[style.rectangle, animatedStyle]}>
            {/* Room Content */}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%', // Ensure it takes full width
    height: '100%', // Ensure it takes full height
  },
  rectangle: {
    width: 200,
    height: 200,
    backgroundColor: '#4a90e2',
    borderRadius: 10,
  },
});

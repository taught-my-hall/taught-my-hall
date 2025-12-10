import PropTypes from 'prop-types';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function Vignette({ isOpened, children }) {
  const [isBlocking, setIsBlocking] = useState(false);

  useAnimatedReaction(
    () => isOpened.value,
    currentValue => {
      if (currentValue !== isBlocking) {
        runOnJS(setIsBlocking)(currentValue);
      }
    },
    [isOpened, isBlocking]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isOpened.value ? 1 : 0, { duration: 300 }),
    };
  });

  const handleClose = () => {
    isOpened.value = false;
  };

  return (
    <Animated.View
      style={[style.vignetteOverlay, animatedStyle]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handleClose}
        style={style.vignetteGradient}
        pointerEvents={isBlocking ? 'auto' : 'none'}
      />

      <Pressable
        style={style.vignetteTextContainer}
        pointerEvents={isBlocking ? 'auto' : 'none'}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

Vignette.propTypes = {
  isOpened: PropTypes.shape({
    value: PropTypes.bool.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

const style = StyleSheet.create({
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100, // Above room, below UI buttons
    justifyContent: 'center',
    alignItems: 'center',
  },
  vignetteGradient: {
    // IMPORTANT: Make this absolute so it doesn't push the text around
    ...StyleSheet.absoluteFillObject,
    // Web Support: Standard CSS gradient
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'radial-gradient(circle, transparent 40%, rgba(20, 20, 20, 0.7) 90%)',
        }
      : {
          // Native Fallback: A simple border frame to mimic window/vignette
          borderWidth: 50,
          borderColor: 'rgba(20, 20, 20, 0.4)',
        }),
  },
  // New Styles for Text
  vignetteTextContainer: {
    alignItems: 'center',
    opacity: 0.8,
    width: 800,
    height: "90%",
    backgroundColor: 'black',
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 2,
  },
});

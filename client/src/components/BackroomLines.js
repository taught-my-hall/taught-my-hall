import React from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Circle, Line, Polygon, Svg, Text as SvgText } from 'react-native-svg';

// --- Layout Constants (Ratios) ---
const FLOOR_HEIGHT_RATIO = 0.7;
const CEIL_HEIGHT_RATIO = 0.15;
const LEFT_CORNER = 0.25;
const RIGHT_CORNER = 0.75;
const DOOR_WIDTH_RATIO = 0.2;
const DOOR_HEIGHT_RATIO = 0.4;
const FLOOR_COLOR = '#403524ff';

export default function BackroomLines({
  i,
  p,
  total,
  title,
  onPress,
  svgWidth,
}) {
  // Use hook for dynamic dimensions (Handles web resize automatically)
  const { width, height } = useWindowDimensions();

  const isFirst = p === 0;
  const isLast = p === total - 1;

  // --- Dynamic Calculations ---
  const doorW = width * DOOR_WIDTH_RATIO;
  const doorH = height * DOOR_HEIGHT_RATIO;

  // Center the door relative to the segment
  const doorX = width * (i + 0.5 - DOOR_WIDTH_RATIO / 2);
  const doorY = height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO);

  const canvasWidth = svgWidth || width;

  const handlePress = (e) => {
    // Fix for web: remove focus outline after click
    if (Platform.OS === 'web' && e?.target?.blur) {
      e.target.blur();
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <View
      // Apply width/height dynamically here so the container resizes
      style={[styles.container, { width, height }]}
      pointerEvents="box-none"
    >
      <Svg
        height={height}
        width={canvasWidth}
        pointerEvents="none"
        style={styles.svg}
      >
        {isFirst ? (
          <>
            <Polygon
              points={`${width * (i + LEFT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 0.51)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 0.51)},${height} 
            ${width * i},${height}`}
              fill={FLOOR_COLOR}
            />
            <Line
              x1={width * (i + LEFT_CORNER)}
              y1={height * FLOOR_HEIGHT_RATIO}
              x2={width * (i + 0.5)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * i}
              y1={height}
              x2={width * (i + LEFT_CORNER)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + LEFT_CORNER)}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + LEFT_CORNER)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * i}
              y1={0}
              x2={width * (i + LEFT_CORNER)}
              y2={height * CEIL_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + LEFT_CORNER)}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + 0.5)}
              y2={height * CEIL_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
          </>
        ) : (
          <>
            <Polygon
              points={`${width * i},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 0.51)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 0.51)},${height} 
            ${width * i},${height}`}
              fill={FLOOR_COLOR}
            />
            <Line
              x1={width * i}
              y1={height * FLOOR_HEIGHT_RATIO}
              x2={width * (i + 0.5)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * i}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + 0.5)}
              y2={height * CEIL_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
          </>
        )}
        {isLast ? (
          <>
            <Polygon
              points={`${width * (i + 0.5)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + RIGHT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 1)},${height} 
            ${width * (i + 0.5)},${height}`}
              fill={FLOOR_COLOR}
            />
            <Line
              x1={width * (i + 0.5)}
              y1={height * FLOOR_HEIGHT_RATIO}
              x2={width * (i + RIGHT_CORNER)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + RIGHT_CORNER)}
              y1={height * FLOOR_HEIGHT_RATIO}
              x2={width * (i + 1)}
              y2={height}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + RIGHT_CORNER)}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + RIGHT_CORNER)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + 0.5)}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + RIGHT_CORNER)}
              y2={height * CEIL_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + RIGHT_CORNER)}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + 1)}
              y2={0}
              stroke="white"
              strokeWidth={2}
            />
          </>
        ) : (
          <>
            <Polygon
              points={`${width * (i + 0.5)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 1)},${height * FLOOR_HEIGHT_RATIO} 
            ${width * (i + 1)},${height} 
            ${width * (i + 0.5)},${height}`}
              fill={FLOOR_COLOR}
            />
            <Line
              x1={width * (i + 0.5)}
              y1={height * FLOOR_HEIGHT_RATIO}
              x2={width * (i + 1)}
              y2={height * FLOOR_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
            <Line
              x1={width * (i + 0.5)}
              y1={height * CEIL_HEIGHT_RATIO}
              x2={width * (i + 1)}
              y2={height * CEIL_HEIGHT_RATIO}
              stroke="white"
              strokeWidth={2}
            />
          </>
        )}
        {/* Door Lines */}
        <Line
          x1={width * (i + 0.5 - DOOR_WIDTH_RATIO / 2)}
          y1={height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO)}
          x2={width * (i + 0.5 - DOOR_WIDTH_RATIO / 2)}
          y2={height * FLOOR_HEIGHT_RATIO}
          stroke="white"
          strokeWidth={2}
        />
        <Line
          x1={width * (i + 0.5 + DOOR_WIDTH_RATIO / 2)}
          y1={height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO)}
          x2={width * (i + 0.5 + DOOR_WIDTH_RATIO / 2)}
          y2={height * FLOOR_HEIGHT_RATIO}
          stroke="white"
          strokeWidth={2}
        />
        <Line
          x1={width * (i + 0.5 - DOOR_WIDTH_RATIO / 2)}
          y1={height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO)}
          x2={width * (i + 0.5 + DOOR_WIDTH_RATIO / 2)}
          y2={height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO)}
          stroke="white"
          strokeWidth={2}
        />
        <SvgText
          x={width * (i + 0.5)}
          y={height * 0.35}
          fontSize={24}
          fill={'white'}
          textAnchor="middle"
          fontFamily="Arial"
        >
          {title}
        </SvgText>
        <Circle cx={width * (i + 0.55)} cy={height * 0.5} r={5} fill="white" />
      </Svg>

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Maps to ${title}`}
        style={[
          styles.pressable,
          {
            left: doorX,
            top: doorY,
            width: doorW,
            height: doorH,
          },
        ]}
      />
    </View>
  );
}

BackroomLines.propTypes = {
  i: PropTypes.number.isRequired,
  p: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  svgWidth: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    // Width and height are handled dynamically via inline styles
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
  },
  pressable: {
    position: 'absolute',
    zIndex: 999,
  },
});
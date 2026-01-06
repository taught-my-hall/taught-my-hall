import React from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Circle,
  Defs,
  Image,
  Line,
  Pattern,
  Polygon,
  Rect,
  Svg,
  Text as SvgText,
} from 'react-native-svg';

// --- Layout Constants (Ratios) ---
const FLOOR_HEIGHT_RATIO = 0.7;
const CEIL_HEIGHT_RATIO = 0.15;
const LEFT_CORNER = 0.25;
const RIGHT_CORNER = 0.75;
const DOOR_WIDTH_RATIO = 0.2;
const DOOR_HEIGHT_RATIO = 0.4;

// Fallback colors (visible if textures fail or are loading)
const FLOOR_COLOR = '#403524';
const WALL_COLOR = '#5c4e36';
const CEIL_COLOR = '#2a2a2a';
const DOOR_COLOR = '#1a1a1a';

export default function BackroomLines({
                                        i,
                                        p,
                                        total,
                                        title,
                                        onPress,
                                        svgWidth,
                                        images, // Received from BackroomScreen
                                      }) {
  const { width, height } = useWindowDimensions();

  const isFirst = p === 0;
  const isLast = p === total - 1;

  // --- Dynamic Calculations ---
  const doorW = width * DOOR_WIDTH_RATIO;
  const doorH = height * DOOR_HEIGHT_RATIO;
  const doorX = width * (i + 0.5 - DOOR_WIDTH_RATIO / 2);
  const doorY = height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO);

  const canvasWidth = svgWidth || width;

  const handlePress = (e) => {
    if (Platform.OS === 'web' && e?.target?.blur) {
      e.target.blur();
    }
    if (onPress) {
      onPress();
    }
  };

  // Helper: Get strict URL string from image object or string
  const getImgHref = (img) => {
    if (!img) return null;
    // If it's a DOM node (from use-image on web), get .src
    if (typeof img === 'object' && img.src) return img.src;
    // If it's already a string URL or require() number
    return img;
  };

  const floorSrc = getImgHref(images?.floor);
  const wallSrc = getImgHref(images?.wall);
  const ceilSrc = getImgHref(images?.ceil);
  const doorSrc = getImgHref(images?.door);

  // Generate Unique IDs using index 'i' to prevent collisions
  const floorId = `floorPat-${i}`;
  const wallId = `wallPat-${i}`;
  const ceilId = `ceilPat-${i}`;
  const doorId = `doorPat-${i}`;

  // Use Pattern URL if source exists, else fallback color
  const floorFill = floorSrc ? `url(#${floorId})` : FLOOR_COLOR;
  const wallFill = wallSrc ? `url(#${wallId})` : WALL_COLOR;
  const ceilFill = ceilSrc ? `url(#${ceilId})` : CEIL_COLOR;
  const doorFill = doorSrc ? `url(#${doorId})` : DOOR_COLOR;

  return (
      <View
          style={[styles.container, { width, height }]}
          pointerEvents="box-none"
      >
        <Svg
            height={height}
            width={canvasWidth}
            pointerEvents="none"
            style={styles.svg}
        >
          <Defs>
            {/* Floor Pattern */}
            {floorSrc && (
                <Pattern
                    id={floorId}
                    patternUnits="userSpaceOnUse"
                    width={256}
                    height={256}
                >
                  <Image
                      href={floorSrc}
                      x="0"
                      y="0"
                      width="256"
                      height="256"
                      preserveAspectRatio="xMidYMid slice"
                  />
                </Pattern>
            )}
            {/* Wall Pattern */}
            {wallSrc && (
                <Pattern
                    id={wallId}
                    patternUnits="userSpaceOnUse"
                    width={256}
                    height={256}
                >
                  <Image
                      href={wallSrc}
                      x="0"
                      y="0"
                      width="256"
                      height="256"
                      preserveAspectRatio="xMidYMid slice"
                  />
                </Pattern>
            )}
            {/* Ceiling Pattern */}
            {ceilSrc && (
                <Pattern
                    id={ceilId}
                    patternUnits="userSpaceOnUse"
                    width={256}
                    height={256}
                >
                  <Image
                      href={ceilSrc}
                      x="0"
                      y="0"
                      width="256"
                      height="256"
                      preserveAspectRatio="xMidYMid slice"
                  />
                </Pattern>
            )}
            {/* Door Pattern */}
            {doorSrc && (
                <Pattern
                    id={doorId}
                    patternUnits="userSpaceOnUse"
                    width={doorW}
                    height={doorH}
                >
                  <Image
                      href={doorSrc}
                      x="0"
                      y="0"
                      width={doorW}
                      height={doorH}
                      preserveAspectRatio="none"
                  />
                </Pattern>
            )}
          </Defs>

          {isFirst ? (
              <>
                {/* Ceiling */}
                <Polygon
                    points={`
                ${width * i},0 
                ${width * (i + 0.51)},0 
                ${width * (i + 0.51)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + LEFT_CORNER)},${height * CEIL_HEIGHT_RATIO}
              `}
                    fill={ceilFill}
                />
                {/* Left Wall */}
                <Polygon
                    points={`
                ${width * i},0 
                ${width * (i + LEFT_CORNER)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + LEFT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
                ${width * i},${height}
              `}
                    fill={wallFill}
                />
                {/* Floor */}
                <Polygon
                    points={`${width * (i + LEFT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height} 
              ${width * i},${height}`}
                    fill={floorFill}
                />
                {/* Wireframes */}
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
                {/* Middle Segment */}
                {/* Ceiling */}
                <Polygon
                    points={`
                ${width * i},0 
                ${width * (i + 0.51)},0 
                ${width * (i + 0.51)},${height * CEIL_HEIGHT_RATIO} 
                ${width * i},${height * CEIL_HEIGHT_RATIO}
              `}
                    fill={ceilFill}
                />
                {/* Floor */}
                <Polygon
                    points={`${width * i},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height} 
              ${width * i},${height}`}
                    fill={floorFill}
                />
                {/* Wireframes */}
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
                {/* Ceiling */}
                <Polygon
                    points={`
                ${width * (i + 0.5)},0 
                ${width * (i + 1)},0 
                ${width * (i + RIGHT_CORNER)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + 0.5)},${height * CEIL_HEIGHT_RATIO}
              `}
                    fill={ceilFill}
                />
                {/* Right Wall */}
                <Polygon
                    points={`
                ${width * (i + 1)},0 
                ${width * (i + 1)},${height} 
                ${width * (i + RIGHT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
                ${width * (i + RIGHT_CORNER)},${height * CEIL_HEIGHT_RATIO}
              `}
                    fill={wallFill}
                />
                {/* Floor */}
                <Polygon
                    points={`${width * (i + 0.5)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + RIGHT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 1)},${height} 
              ${width * (i + 0.5)},${height}`}
                    fill={floorFill}
                />
                {/* Wireframes */}
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
                {/* Middle Segment Right Half */}
                {/* Ceiling */}
                <Polygon
                    points={`
                ${width * (i + 0.5)},0 
                ${width * (i + 1)},0 
                ${width * (i + 1)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + 0.5)},${height * CEIL_HEIGHT_RATIO}
              `}
                    fill={ceilFill}
                />
                {/* Floor */}
                <Polygon
                    points={`${width * (i + 0.5)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 1)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 1)},${height} 
              ${width * (i + 0.5)},${height}`}
                    fill={floorFill}
                />
                {/* Wireframes */}
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

          {/* --- Door --- */}
          <Rect
              x={doorX}
              y={doorY}
              width={doorW}
              height={doorH}
              fill={doorFill}
          />
          {/* Door Wireframe */}
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
  images: PropTypes.shape({
    floor: PropTypes.any,
    wall: PropTypes.any,
    ceil: PropTypes.any,
    door: PropTypes.any,
  }),
};

const styles = StyleSheet.create({
  container: {
    // Dynamic dimensions via inline styles
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
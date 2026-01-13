import PropTypes from 'prop-types';
import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  Image as RNImage,
  StyleSheet, // Potrzebne do wyciągnięcia URI z require()
  useWindowDimensions,
  View,
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

const FLOOR_HEIGHT_RATIO = 0.7;
const CEIL_HEIGHT_RATIO = 0.15;
const LEFT_CORNER = 0.25;
const RIGHT_CORNER = 0.75;
const DOOR_WIDTH_RATIO = 0.2;
const DOOR_HEIGHT_RATIO = 0.4;

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
  images,
  palaceId,
}) {
  const { width, height } = useWindowDimensions();

  const isFirst = p === 0;
  const isLast = p === total - 1;

  const doorW = width * DOOR_WIDTH_RATIO;
  const doorH = height * DOOR_HEIGHT_RATIO;
  // i służy TYLKO do obliczania pozycji X/Y
  const doorX = width * (i + 0.5 - DOOR_WIDTH_RATIO / 2);
  const doorY = height * (FLOOR_HEIGHT_RATIO - DOOR_HEIGHT_RATIO);

  const canvasWidth = svgWidth || width;

  const handlePress = e => {
    if (Platform.OS === 'web' && e?.target?.blur) {
      e.target.blur();
    }
    if (onPress) {
      onPress();
    }
  };

  // Funkcja naprawiająca problem "białych tekstur"
  // require('./img.png') zwraca liczbę. SVG potrzebuje "file://..." lub "http://..."
  const resolveAsset = source => {
    if (!source) return null;
    if (typeof source === 'string') return source; // Już jest URL
    try {
      const asset = RNImage.resolveAssetSource(source);
      return asset ? asset.uri : null;
    } catch (e) {
      return null;
    }
  };

  const floorSrc = resolveAsset(images?.floor);
  const wallSrc = resolveAsset(images?.wall);
  const ceilSrc = resolveAsset(images?.ceil);
  const doorSrc = resolveAsset(images?.door);

  const instanceId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const uniquePrefix = `palace-${palaceId}-${instanceId}`;
  const floorId = `${uniquePrefix}-floor`;
  const wallId = `${uniquePrefix}-wall`;
  const ceilId = `${uniquePrefix}-ceil`;
  const doorId = `${uniquePrefix}-door`;

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
            <Polygon
              points={`
                ${width * i},0 
                ${width * (i + 0.51)},0 
                ${width * (i + 0.51)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + LEFT_CORNER)},${height * CEIL_HEIGHT_RATIO}
              `}
              fill={ceilFill}
            />
            <Polygon
              points={`
                ${width * i},0 
                ${width * (i + LEFT_CORNER)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + LEFT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
                ${width * i},${height}
              `}
              fill={wallFill}
            />
            <Polygon
              points={`${width * (i + LEFT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height} 
              ${width * i},${height}`}
              fill={floorFill}
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
              points={`
                ${width * i},0 
                ${width * (i + 0.51)},0 
                ${width * (i + 0.51)},${height * CEIL_HEIGHT_RATIO} 
                ${width * i},${height * CEIL_HEIGHT_RATIO}
              `}
              fill={ceilFill}
            />
            <Polygon
              points={`${width * i},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 0.51)},${height} 
              ${width * i},${height}`}
              fill={floorFill}
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
              points={`
                ${width * (i + 0.5)},0 
                ${width * (i + 1)},0 
                ${width * (i + RIGHT_CORNER)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + 0.5)},${height * CEIL_HEIGHT_RATIO}
              `}
              fill={ceilFill}
            />
            <Polygon
              points={`
                ${width * (i + 1)},0 
                ${width * (i + 1)},${height} 
                ${width * (i + RIGHT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
                ${width * (i + RIGHT_CORNER)},${height * CEIL_HEIGHT_RATIO}
              `}
              fill={wallFill}
            />
            <Polygon
              points={`${width * (i + 0.5)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + RIGHT_CORNER)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 1)},${height} 
              ${width * (i + 0.5)},${height}`}
              fill={floorFill}
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
              points={`
                ${width * (i + 0.5)},0 
                ${width * (i + 1)},0 
                ${width * (i + 1)},${height * CEIL_HEIGHT_RATIO} 
                ${width * (i + 0.5)},${height * CEIL_HEIGHT_RATIO}
              `}
              fill={ceilFill}
            />
            <Polygon
              points={`${width * (i + 0.5)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 1)},${height * FLOOR_HEIGHT_RATIO} 
              ${width * (i + 1)},${height} 
              ${width * (i + 0.5)},${height}`}
              fill={floorFill}
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
  palaceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
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

import { Circle, Group, Layer, Stage, Text } from 'react-konva';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import TexturePolygon from '../components/TexturedPolygon';

const { width, height } = Dimensions.get('window');

const floorHeight = 0.7;
const ceilHeight = 0.15;
const leftCorner = 0.25;
const rightCorner = 0.75;
const doorWidth = 0.2;
const doorHeight = 0.4;

const BackroomSegment = ({
  xOffset, // Pozycja X tego segmentu w kontenerze rodzica (np. 0, width, 2*width)
  title,
  images = {},
  onPress,
  isFirst,
  isLast,
}) => {
  // Współrzędne wewnątrz Stage są lokalne (0 do width), nie dodajemy już xOffset do punktów wielokątów!
  const w = width;
  const h = height;

  // --- GEOMETRIA (Lokalna) ---
  const bx1 = isFirst ? w * leftCorner : 0;
  const bx2 = isLast ? w * rightCorner : w;

  const backLeft = [bx1, h * floorHeight];
  const backRight = [bx2, h * floorHeight];
  const backTopLeft = [bx1, h * ceilHeight];
  const backTopRight = [bx2, h * ceilHeight];

  const screenBottomLeft = [0, h];
  const screenBottomRight = [w, h];
  const screenTopLeft = [0, 0];
  const screenTopRight = [w, 0];

  const floorPoints = [
    screenBottomLeft,
    backLeft,
    backRight,
    screenBottomRight,
  ];
  const ceilPoints = [screenTopLeft, backTopLeft, backTopRight, screenTopRight];
  const backWallPoints = [backTopLeft, backLeft, backRight, backTopRight];

  const leftWallPoints = isFirst
    ? [screenTopLeft, screenBottomLeft, backLeft, backTopLeft]
    : null;
  const rightWallPoints = isLast
    ? [screenTopRight, screenBottomRight, backRight, backTopRight]
    : null;

  // --- GEOMETRIA DRZWI ---
  const dX = w * (0.5 - doorWidth / 2); // Środek lokalny
  const dY = h * (floorHeight - doorHeight);
  const dW = w * doorWidth;
  const dH = h * doorHeight;
  const doorPoints = [
    [dX, dY],
    [dX, dY + dH],
    [dX + dW, dY + dH],
    [dX + dW, dY],
  ];

  return (
    // Główny kontener pozycjonowany absolutnie w Animated.View
    <View style={[styles.container, { left: xOffset }]}>
      {/* WARSTWA 1: GRAFIKA (Stage per segment) */}
      <Stage width={w} height={h} style={styles.stage}>
        <Layer>
          <Group>
            <TexturePolygon
              points={floorPoints}
              image={images.floor}
              brightness={1}
            />
            <TexturePolygon
              points={ceilPoints}
              image={images.ceil}
              brightness={0.7}
            />
            {leftWallPoints && (
              <TexturePolygon
                points={leftWallPoints}
                image={images.wall}
                brightness={0.8}
              />
            )}
            {rightWallPoints && (
              <TexturePolygon
                points={rightWallPoints}
                image={images.wall}
                brightness={0.8}
              />
            )}
            <TexturePolygon
              points={backWallPoints}
              image={images.wall}
              brightness={0.6}
            />

            <TexturePolygon
              points={doorPoints}
              image={images.door}
              brightness={0.9}
            />

            <Text
              x={0}
              y={h * 0.35}
              width={w}
              text={title}
              fontSize={24}
              fontFamily="Arial"
              fill="white"
              align="center"
              listening={false}
            />
            <Circle
              x={w * 0.55}
              y={h * 0.5}
              radius={5}
              fill="white"
              listening={false}
            />
          </Group>
        </Layer>
      </Stage>

      {/* WARSTWA 2: INTERAKCJA (Pressable nałożony na drzwi) */}
      <Pressable
        style={{
          position: 'absolute',
          left: dX,
          top: dY,
          width: dW,
          height: dH,
          // backgroundColor: 'rgba(255,0,0,0.3)', // Debug: odkomentuj by widzieć przycisk
        }}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height,
  },
  stage: {
    width: width,
    height: height,
  },
});

export default BackroomSegment;

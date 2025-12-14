import { useRouter } from 'expo-router';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { setTempPalaceMatrix } from '../../utils/tempData';

const CELL_SIZE = 40;
const GAP_SIZE = 2;
const CELL_TOTAL = CELL_SIZE + GAP_SIZE;

const DISTANCE_TO_EDGE_TRIGGER = 5;
const EXPANSION_AMOUNT = 5;

const INITIAL_BOUNDS = {
  minX: -10,
  maxX: 9,
  minY: -10,
  maxY: 9,
};

const DEFAULT_ROOMS = [
  { id: '3', name: 'Room 3', color: '#4C1D95', x: -2, y: -2, w: 4, h: 4 },
  { id: '2', name: 'Room 2', color: '#10B981', x: 3, y: -6, w: 3, h: 3 },
  { id: '1', name: 'Room 1', color: '#991B1B', x: -6, y: 3, w: 3, h: 3 },
];

const generateRandomColor = () => {
  const hex = Math.floor(Math.random() * 16777215).toString(16);
  return `#${hex.padEnd(6, '0')}`;
};

export default function PalaceCreatorScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState('0');
  const activeRoomIdRef = useRef('0');
  const [selectedCells, setSelectedCells] = useState({});
  const [bounds, setBounds] = useState(INITIAL_BOUNDS);

  const boundsRef = useRef(INITIAL_BOUNDS);
  const panVal = useRef({ x: 0, y: 0 });

  const window = Dimensions.get('window');

  const initialWidth = 20 * CELL_TOTAL;
  const initialHeight = 20 * CELL_TOTAL;
  const initialCamX = (window.width - initialWidth) / 2;
  const initialCamY = (window.height - initialHeight) / 2;

  const pan = useRef(
    new Animated.ValueXY({ x: initialCamX, y: initialCamY })
  ).current;

  const handleAddRoom = () => {
    const newId = (rooms.length + 1).toString();
    const newRoom = {
      id: newId,
      name: `Room ${newId}`,
      color: generateRandomColor(),
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    };

    setRooms([newRoom, ...rooms]);
    handleRoomPress(newId);
  };

  const handleRoomPress = id => {
    setActiveRoomId(id);
    activeRoomIdRef.current = id;
  };

  const Cell = React.memo(
    function CellComponent({ baseColor, selectedRoomId, label }) {
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      const displayColor = selectedRoom ? selectedRoom.color : baseColor;

      return (
        <View style={[styles.cell, { backgroundColor: displayColor }]}>
          {label && <Text style={styles.cellLabel}>{label}</Text>}
        </View>
      );
    },
    (prev, next) =>
      prev.selectedRoomId === next.selectedRoomId &&
      prev.baseColor === next.baseColor
  );

  Cell.propTypes = {
    baseColor: PropTypes.string.isRequired,
    selectedRoomId: PropTypes.string,
    label: PropTypes.string,
  };

  useEffect(() => {
    panVal.current = { x: initialCamX, y: initialCamY };
    const id = pan.addListener(value => {
      panVal.current = value;
    });
    return () => pan.removeListener(id);
  }, [initialCamX, initialCamY, pan]);

  const toggleCell = (r, c) => {
    const key = `${r},${c}`;
    const currentActiveId = activeRoomIdRef.current;
    if (currentActiveId !== '0') {
      setSelectedCells(prev => {
        const currentOwnerId = prev[key];

        if (currentOwnerId === currentActiveId) {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        } else {
          return { ...prev, [key]: currentActiveId };
        }
      });
    }
  };

  const getBaseColor = useCallback(
    (x, y) => {
      const room = rooms.find(
        roomIn =>
          x >= roomIn.x &&
          x < roomIn.x + roomIn.w &&
          y >= roomIn.y &&
          y < roomIn.y + roomIn.h
      );
      return room ? room.color : '#262626';
    },
    [rooms]
  );

  const checkExpansionOnTap = (clickedX, clickedY) => {
    const currentBounds = boundsRef.current;
    let newBounds = { ...currentBounds };
    let hasChanged = false;

    let xOffsetShift = 0;
    let yOffsetShift = 0;

    if (clickedX - currentBounds.minX < DISTANCE_TO_EDGE_TRIGGER) {
      newBounds.minX -= EXPANSION_AMOUNT;
      xOffsetShift -= EXPANSION_AMOUNT * CELL_TOTAL;
      hasChanged = true;
    }

    if (currentBounds.maxX - clickedX < DISTANCE_TO_EDGE_TRIGGER) {
      newBounds.maxX += EXPANSION_AMOUNT;
      hasChanged = true;
    }

    if (clickedY - currentBounds.minY < DISTANCE_TO_EDGE_TRIGGER) {
      newBounds.minY -= EXPANSION_AMOUNT;
      yOffsetShift -= EXPANSION_AMOUNT * CELL_TOTAL;
      hasChanged = true;
    }

    if (currentBounds.maxY - clickedY < DISTANCE_TO_EDGE_TRIGGER) {
      newBounds.maxY += EXPANSION_AMOUNT;
      hasChanged = true;
    }

    if (hasChanged) {
      pan.setOffset({
        x: panVal.current.x + xOffsetShift,
        y: panVal.current.y + yOffsetShift,
      });
      pan.setValue({ x: 0, y: 0 });

      boundsRef.current = newBounds;
      setBounds(newBounds);
    }
  };

  const handleTap = evt => {
    const { locationX, locationY } = evt.nativeEvent;
    const gridPixelX = locationX - panVal.current.x;
    const gridPixelY = locationY - panVal.current.y;
    const colIndex = Math.floor(gridPixelX / CELL_TOTAL);
    const rowIndex = Math.floor(gridPixelY / CELL_TOTAL);
    const logicalX = boundsRef.current.minX + colIndex;
    const logicalY = boundsRef.current.minY + rowIndex;

    if (
      logicalX >= boundsRef.current.minX &&
      logicalX <= boundsRef.current.maxX &&
      logicalY >= boundsRef.current.minY &&
      logicalY <= boundsRef.current.maxY
    ) {
      toggleCell(logicalY, logicalX);
      checkExpansionOnTap(logicalX, logicalY);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: panVal.current.x,
          y: panVal.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          handleTap(evt);
        }
      },
    })
  ).current;

  const gridCells = useMemo(() => {
    const rows = [];
    for (let r = bounds.minY; r <= bounds.maxY; r++) {
      const rowCells = [];
      for (let c = bounds.minX; c <= bounds.maxX; c++) {
        const key = `${r},${c}`;
        const isCenter = r === 0 && c === 0;
        const savedRoomId = selectedCells[key];

        rowCells.push(
          <Cell
            key={key}
            baseColor={getBaseColor(c, r)}
            selectedRoomId={savedRoomId}
            label={isCenter ? '0,0' : null}
          />
        );
      }
      rows.push(
        <View key={r} style={styles.row}>
          {rowCells}
        </View>
      );
    }
    return rows;
  }, [bounds, selectedCells, getBaseColor]);

  const webContainerStyle = Platform.select({
    web: {
      userSelect: 'none',
      touchAction: 'none',
      outline: 'none',
    },
    default: {},
  });

  const getGridMatrix = () => {
    let rBoundMin = 100;
    let rBoundMax = -100;
    let cBoundMin = 100;
    let cBoundMax = -100;
    const places = [];
    Object.keys(selectedCells).forEach(key => {
      const val = selectedCells[key];
      let [r, c] = key.split(',').map(Number);
      places.push([r, c, val]);
      if (r < rBoundMin) rBoundMin = r;
      if (r > rBoundMax) rBoundMax = r;
      if (c < cBoundMin) cBoundMin = c;
      if (c > cBoundMax) cBoundMax = c;
    });
    if (places.length === 0) return [];
    const matrix = Array.from(
      { length: Math.abs(rBoundMax - rBoundMin + 1) },
      () =>
        Array.from({ length: Math.abs(cBoundMax - cBoundMin + 1) }, () => '0__')
    );
    places.map(place => {
      let [r, c, v] = place;
      matrix[r - rBoundMin][c - cBoundMin] = v + '__';
    });
    console.log(matrix);
    return matrix;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Infinite Grid</Text>
      </View>

      {/* 3. Apply the web styles to the Viewport */}
      <View
        style={[styles.viewport, webContainerStyle]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.gridContainer,
            { transform: pan.getTranslateTransform() },
          ]}
        >
          {gridCells}
        </Animated.View>
        <View style={styles.roomsListBlock}>
          {/* Screen Title */}
          <Text style={styles.headerListTitle}>Rooms</Text>

          {/* New Room Action */}
          <TouchableOpacity
            style={styles.newRoomButton}
            onPress={handleAddRoom}
          >
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.newRoomText}>New room</Text>
          </TouchableOpacity>

          <View style={styles.roomsList}>
            {rooms.map(room => {
              const isActive = activeRoomId === room.id;
              return (
                <TouchableOpacity
                  key={room.id}
                  onPress={() => handleRoomPress(room.id)}
                  style={isActive ? styles.roomItemActive : styles.roomItem}
                >
                  <Text style={[styles.roomText, { color: room.color }]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
      <Pressable
        onPress={() => {
          if (Object.keys(selectedCells).length > 0) {
            setTempPalaceMatrix(getGridMatrix());
            router.navigate('/palace/setup');
          }
        }}
        style={styles.reviewButton}
      >
        <Text style={{ fontSize: 24, color: '#FFF' }}>New Palace</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  header: {
    paddingVertical: 15,
    backgroundColor: '#171717',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 10,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  viewport: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'column',
    gap: GAP_SIZE,
    padding: GAP_SIZE,
  },
  row: {
    flexDirection: 'row',
    gap: GAP_SIZE,
  },
  roomsListBlock: {
    marginLeft: 50,
    marginTop: 50,
    width: 200,
    height: '80%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  headerListTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  newRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 5, // Align + with the border of the box below
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 38,
    marginRight: 15,
    fontWeight: '500',
  },
  newRoomText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
    position: 'relative',
    top: 1,
  },
  // --- The requested style block ---
  roomsList: {
    flexDirection: 'column',
    gap: 15, // Adds space between items (React Native 0.71+)
  },
  // Style for the selected room (Room 3)
  roomItemActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start', // Wraps width to content
    minWidth: 150, // Ensures the pill shape looks similar to image
  },
  // Style for non-selected rooms
  roomItem: {
    paddingVertical: 10,
    paddingHorizontal: 20, // Keep padding to align text with the item above
  },
  roomText: {
    fontSize: 24,
    fontWeight: '800',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    // Platform.select works perfectly inside StyleSheet.create
    ...Platform.select({
      web: { userSelect: 'none' },
    }),
  },
  cellLabel: { fontSize: 8, color: 'rgba(255,255,255,0.5)' },
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

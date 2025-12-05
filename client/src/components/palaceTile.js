import React, { memo, useMemo } from 'react';
import { Group } from 'react-konva';
import Furniture from './Furniture';
import TexturePolygon from './TexturedPolygon';

// --- CONSTANTS ---
const h = 6;
const r = 5;
const doorRadius = 25;
const br_lower = 0.5;
const br_higher = 1.5;

// --- GENERATOR FUNCTION (Moved outside) ---
// This function takes 's' and generates the geometry.
const getWallData = (s) => ({
  0: [
    [
      [
        [0, 0],
        [s, 0],
        [s, r],
        [0, r],
      ],
      1,
    ],
    [
      [
        [0, r],
        [s, r],
        [s, r + h],
        [0, r + h],
      ],
      br_higher,
    ],
  ],
  1: [
    [
      [
        [s, 0],
        [s, r + h],
        [s - r - h, r + h],
      ],
      br_higher,
    ],
    [
      [
        [s, 0],
        [s - r - h, 0],
        [s - r - h, r + h],
      ],
      br_higher,
    ],
    [
      [
        [s, 0],
        [s, r],
        [s - r, r],
        [s - r, 0],
      ],
      1,
    ],
  ],
  2: [
    [
      [
        [s, 0],
        [s, s],
        [s - r, s],
        [s - r, 0],
      ],
      1,
    ],
    [
      [
        [s - r, 0],
        [s - r, s],
        [s - r - h, s],
        [s - r - h, 0],
      ],
      br_higher,
    ],
  ],
  3: [
    [
      [
        [s, s],
        [s - r - h, s - r - h],
        [s, s - r - h],
      ],
      br_lower,
    ],
    [
      [
        [s, s],
        [s - r - h, s - r - h],
        [s - r - h, s],
      ],
      br_higher,
    ],
    [
      [
        [s, s],
        [s, s - r],
        [s - r, s - r],
        [s - r, s],
      ],
      1,
    ],
  ],
  4: [
    [
      [
        [s, s],
        [0, s],
        [0, s - r],
        [s, s - r],
      ],
      1,
    ],
    [
      [
        [s, s - r],
        [0, s - r],
        [0, s - r - h],
        [s, s - r - h],
      ],
      br_lower,
    ],
  ],
  5: [
    [
      [
        [0, s],
        [r + h, s - r - h],
        [0, s - r - h],
      ],
      br_lower,
    ],
    [
      [
        [0, s],
        [r + h, s - r - h],
        [r + h, s],
      ],
      br_lower,
    ],
    [
      [
        [0, s],
        [r, s],
        [r, s - r],
        [0, s - r],
      ],
      1,
    ],
  ],
  6: [
    [
      [
        [0, 0],
        [0, s],
        [r, s],
        [r, 0],
      ],
      1,
    ],
    [
      [
        [r, 0],
        [r, s],
        [r + h, s],
        [r + h, 0],
      ],
      br_lower,
    ],
  ],
  7: [
    [
      [
        [0, 0],
        [r + h, r + h],
        [r + h, 0],
      ],
      br_lower,
    ],
    [
      [
        [0, 0],
        [r + h, r + h],
        [0, r + h],
      ],
      br_higher,
    ],
    [
      [
        [0, 0],
        [0, r],
        [r, r],
        [r, 0],
      ],
      1,
    ],
  ],
});

const PalaceTile = ({ tileData, i, j, s, flags }) => {
  // Use useMemo here so we don't recalculate the wall geometry
  // on every render, but we still have access to 's'.
  const wallData = useMemo(() => getWallData(s), [s]);

  return (
      <Group x={j * s} y={i * s}>
        <TexturePolygon
            key={`${i}-${j}-floor`}
            points={[
              [0, 0],
              [s + 1, 0],
              [s + 1, s + 1],
              [0, s + 1],
            ]}
            textureId={tileData[0] === '0' ? 'stone1' : 'planks1'}
            lineWidth={0}
        />

        {tileData[1] !== '' && (
            <Furniture
                modelname={tileData[1]}
                offset={[0, 0]}
                scale={0.5}
            />
        )}

        {flags.map((b, idx) => {
          let polygons = [];

          // Cardinal directions (Top, Right, Bottom, Left)
          if (idx % 2 === 0 && b) {
            const data = wallData[idx];
            if (data) {
              data.forEach((dv, di) => {
                polygons.push(
                    <TexturePolygon
                        key={`${i}-${j}-${idx}-${di}`}
                        points={dv[0]}
                        textureId={'brick1'}
                        brightness={dv[1]}
                    />
                );
              });
            }
          }
          // Corner logic
          else {
            const idx_b = (idx + 7) % 8;
            const idx_f = (idx + 9) % 8;

            const key = `${flags[idx_b] ? idx_b : ''}${b ? idx : ''}${flags[idx_f] ? idx_f : ''}`;

            const d = wallData[key];

            if (d !== undefined) {
              d.forEach((dv, di) => {
                polygons.push(
                    <TexturePolygon
                        key={`${i}-${j}-${idx}-${di}`}
                        points={dv[0]}
                        textureId={'brick1'}
                        brightness={dv[1]}
                    />
                );
              });
            }
          }

          if (polygons.length === 0) return null;
          return <Group key={`${i}-${j}-${idx}-group`}>{polygons}</Group>;
        })}

        {tileData[2] === '0' && (
            <TexturePolygon
                key={`${i}-${j}-door-up`}
                points={[
                  [s / 2 - doorRadius, -r - h],
                  [s / 2 + doorRadius, -r - h],
                  [s / 2 + doorRadius, r + h],
                  [s / 2 - doorRadius, r + h],
                ]}
                textureId={tileData[0] === '0' ? 'stone1' : 'planks1'}
                lineWidth={0}
            />
        )}
      </Group>
  );
};

// Check props for equality to prevent re-renders
const arePropsEqual = (prevProps, nextProps) => {
  return (
      prevProps.i === nextProps.i &&
      prevProps.j === nextProps.j &&
      prevProps.s === nextProps.s &&
      prevProps.tileData === nextProps.tileData &&
      // Efficiently compare the boolean flags array
      prevProps.flags.length === nextProps.flags.length &&
      prevProps.flags.every((val, index) => val === nextProps.flags[index])
  );
};

export default memo(PalaceTile, arePropsEqual);
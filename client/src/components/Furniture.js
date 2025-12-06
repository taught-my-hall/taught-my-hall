import { Group } from 'react-konva';
import models from '../utils/furnitureModels';
import TexturePolygon from './TexturedPolygon';

export default function Furniture({
  // eslint-disable-next-line
  modelname,
  // eslint-disable-next-line
  offset = [0, 0],
  // eslint-disable-next-line
  scale = 1,
}) {
  const [offsetX, offsetY] = offset;

  return (
    <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
      {models[modelname].map((cuboid, cuboidIndex) =>
        cuboid.map((poly, polyIndex) => {
          const offsetPoints = poly.points.map(([x, y]) => [x, y]);

          return (
            <TexturePolygon
              key={`${cuboidIndex}-${polyIndex}`}
              points={offsetPoints}
              textureId={poly.textureId}
              angle={poly.angle}
            />
          );
        })
      )}
    </Group>
  );
}

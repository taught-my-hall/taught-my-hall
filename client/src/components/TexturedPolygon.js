import { Shape } from 'react-konva';
import useImage from 'use-image';

import { textures } from '../utils/textures.js';

export default function TexturePolygon({
  points,
  textureId,
  angle,
  width = 400,
  height = 400,
}) {
  const [image] = useImage(textures[textureId]);

  if (!image) {
    return null;
  }
  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        const [firstX, firstY] = points[0];
        ctx.beginPath();
        ctx.moveTo(firstX, firstY);
        for (let i = 1; i < points.length; i++) {
          const [x, y] = points[i];
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const pattern = ctx.createPattern(image, 'repeat');
        let new_angle = ((angle / Math.PI) * 360 + 360) % 360;
        ctx.rotate(new_angle);
        ctx.fillStyle = pattern;
        ctx.fill();

        ctx.strokeStyle = '#bcb3ae24';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.strokeShape(shape);
      }}
    />
  );
}

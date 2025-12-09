import { Shape } from 'react-konva';
import useImage from 'use-image';
import { textures } from '../utils/textures.js';

export default function TexturePolygon({
  // eslint-disable-next-line
  points,
  // eslint-disable-next-line
  textureId,
  // eslint-disable-next-line
  angle,
  // eslint-disable-next-line
  width = 400,
  // eslint-disable-next-line
  height = 400,
  // eslint-disable-next-line
  lineWidth = 0.5,
  // eslint-disable-next-line
  brightness = 1,
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
        // eslint-disable-next-line
        for (let i = 1; i < points.length; i++) {
          const [x, y] = points[i];
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.filter = `brightness(${brightness})`;

        const pattern = ctx.createPattern(image, 'repeat');

        let new_angle = ((angle / Math.PI) * 360 + 360) % 360;
        ctx.rotate(new_angle);

        ctx.fillStyle = pattern;
        ctx.fill();

        if (lineWidth > 0) {
          ctx.strokeStyle = '#bcb3ae24';
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }

        ctx.strokeShape(shape);

        ctx.filter = 'none';
      }}
    />
  );
}

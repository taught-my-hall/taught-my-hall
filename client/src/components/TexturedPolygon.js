import PropTypes from 'prop-types';
import { memo } from 'react';
import { Shape } from 'react-konva';

const TexturePolygon = ({
  points,
  image,
  angle = 0,
  lineWidth = 0.5,
  brightness = 1,
}) => {
  if (!image) return null;

  return (
    <Shape
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
      listening={false}
      sceneFunc={ctx => {
        if (!points || points.length === 0) return;

        ctx.beginPath();
        const [firstX, firstY] = points[0];
        ctx.moveTo(firstX, firstY);
        for (let i = 1; i < points.length; i++) {
          const [x, y] = points[i];
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const pattern = ctx.createPattern(image, 'repeat');

        if (angle) {
          ctx.save();
          ctx.rotate(((angle / Math.PI) * 360 + 360) % 360);
        }

        ctx.fillStyle = pattern;
        ctx.fill();

        if (angle) ctx.restore();

        if (brightness !== 1) {
          ctx.save();
          if (brightness < 1) {
            ctx.fillStyle = 'black';
            ctx.globalAlpha = 1 - brightness;
          } else {
            ctx.fillStyle = 'white';
            ctx.globalAlpha = brightness - 1;
          }
          ctx.fill();
          ctx.restore();
        }

        if (lineWidth > 0) {
          ctx.strokeStyle = '#bcb3ae24';
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }
      }}
    />
  );
};

TexturePolygon.propTypes = {
  points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  image: PropTypes.object, // DOM Image object
  angle: PropTypes.number,
  lineWidth: PropTypes.number,
  brightness: PropTypes.number,
};

export default memo(TexturePolygon);

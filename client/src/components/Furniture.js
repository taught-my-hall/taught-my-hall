import PropTypes from 'prop-types';
import { memo } from 'react';
import { Image } from 'react-konva';
import { FURNITURE_MAP } from '../utils/furnitureMap';

const Furniture = ({ modelname, image, tileSize }) => {
  const cleanName = modelname.replace(/[0-9_]/g, '');
  const sprite = FURNITURE_MAP[cleanName] || FURNITURE_MAP[modelname];

  if (!sprite || !image) return null;

  const maxSide = Math.max(sprite.w, sprite.h);
  const targetSize = tileSize * 0.9;
  const scale = targetSize / maxSide;

  const finalWidth = sprite.w * scale;
  const finalHeight = sprite.h * scale;

  const centeredX = (tileSize - finalWidth) / 2;
  const centeredY = (tileSize - finalHeight) / 2;

  return (
    <Image
      image={image}
      crop={{
        x: sprite.x,
        y: sprite.y,
        width: sprite.w,
        height: sprite.h,
      }}
      width={finalWidth}
      height={finalHeight}
      x={centeredX}
      y={centeredY}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
};

Furniture.propTypes = {
  modelname: PropTypes.string.isRequired,
  image: PropTypes.object,
  tileSize: PropTypes.number,
};

export default memo(Furniture);

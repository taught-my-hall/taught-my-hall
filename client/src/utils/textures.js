import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const textures = {
  wood1: isWeb
    ? '/textures/wood1.png'
    : require('../../public/textures/wood1.png'),
  wood2: isWeb
    ? '/textures/wood2.png'
    : require('../../public/textures/wood2.png'),
  stone1: isWeb
    ? '/textures/stone1.png'
    : require('../../public/textures/stone1.png'),
  brick1: isWeb
    ? '/textures/brick1.png'
    : require('../../public/textures/brick1.png'),
  planks1: isWeb
    ? '/textures/planks1.png'
    : require('../../public/textures/planks1.png'),
  furniture: isWeb
    ? '/textures/furniture.png'
    : require('../../public/textures/furniture.png'),
};

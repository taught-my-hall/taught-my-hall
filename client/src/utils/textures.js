import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const pathSwitch = path => (isWeb ? path : `../../public${path}`);

export const textures = {
  wood1: pathSwitch('/textures/wood1.png'),
  wood2: pathSwitch('/textures/wood2.png'),
  stone1: pathSwitch('/textures/stone1.png'),
  brick1: pathSwitch('/textures/brick1.png'),
  planks1: pathSwitch('/textures/planks1.png'),
  furniture: pathSwitch('/textures/furniture.png'),
};

export const iconsFishcards = {
  'award-simple': pathSwitch('/textures/icons/award-simple-svgrepo-com.svg'),
  'clipboard-list-check': pathSwitch(
    '/textures/icons/clipboard-list-check-svgrepo-com.svg'
  ),
  'door-open': pathSwitch('/textures/icons/door-open-svgrepo-com.svg'),
  grid: pathSwitch('/textures/icons/grid-svgrepo-com.svg'),
  network: pathSwitch('/textures/icons/network-svgrepo-com.svg'),
  sunset: pathSwitch('/textures/icons/sunset-svgrepo-com.svg'),
  tag: pathSwitch('/textures/icons/tag-svgrepo-com.svg'),
  user: pathSwitch('/textures/icons/user-svgrepo-com.svg'),
};

export const iconsGui = {
  'eye-slash': pathSwitch('/textures/icons/eye-slash-svgrepo-com.svg'),
  eye: pathSwitch('/textures/icons/eye-svgrepo-com.svg'),
};

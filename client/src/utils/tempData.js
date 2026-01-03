let tempPalaceMatrix = null;
let palacesData = null;

export const setTempPalaceMatrix = matrix => {
  tempPalaceMatrix = matrix;
};

export const getTempPalaceMatrix = () => {
  return tempPalaceMatrix;
};

export const setPalacesData = data => {
  palacesData = data;
};

export const getPalacesData = () => {
  return palacesData;
};

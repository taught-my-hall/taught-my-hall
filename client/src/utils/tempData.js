let tempPalaceMatrix = null;

export const setTempPalaceMatrix = matrix => {
  tempPalaceMatrix = matrix;
  console.log(tempPalaceMatrix);
};

export const getTempPalaceMatrix = () => {
  return tempPalaceMatrix;
};

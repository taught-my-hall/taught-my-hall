let palacesData = null;

export const setTempPalaceMatrix = matrix => {
  localStorage.setItem('tempPalaceMatrix', JSON.stringify(matrix));
};

export const getTempPalaceMatrix = () => {
  const res = localStorage.getItem('tempPalaceMatrix');
  return res ? JSON.parse(res) : null;
};

export const setTempPalaceId = route => {
  localStorage.setItem('tempPalaceId', route);
};

export const getTempPalaceId = () => {
  const res = localStorage.getItem('tempPalaceId');
  return res ? JSON.parse(res) : null;
};

export const setPalacesData = data => {
  palacesData = data;
};

export const getPalacesData = () => {
  return palacesData;
};

export const updatePalaceInCache = updatedPalace => {
  if (!updatedPalace || !updatedPalace.id) return;

  palacesData[updatedPalace.id] = updatedPalace;
};

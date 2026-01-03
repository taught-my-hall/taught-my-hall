export const setTempPalaceMatrix = matrix => {
  localStorage.setItem('tempPalaceMatrix', JSON.stringify(matrix));
};

export const getTempPalaceMatrix = () => {
  const res = localStorage.getItem('tempPalaceMatrix');
  return res ? JSON.parse(res) : null;
};

export const setTempPalaceRoute = route => {
  localStorage.setItem('tempPalaceRoute', route);
};

export const getTempPalaceRoute = () => {
  return localStorage.getItem('tempPalaceRoute');
};

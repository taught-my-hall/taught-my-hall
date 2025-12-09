const s = 200;

function atan(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

function createCuboid(p1, p2, p3, textures) {
  p1 = [p1[0] * s, p1[1] * s];
  p2 = [p2[0] * s, p2[1] * s];
  p3 = [p3[0] * s, p3[1] * s];
  while (textures.length < 3) textures.push(textures[0]);
  let res = [
    {
      points: [p1, [p2[0], p1[1]], p2, [p1[0], p2[1]]],
      textureId: textures[0],
      angle: 0,
    },
    {
      points: [p2, p3, [p3[0], p3[1] - p2[1] + p1[1]], [p2[0], p1[1]]],
      textureId: textures[1],
      angle: 0,
    },
    {
      points: [p2, p3, [p3[0] - p2[0] + p1[0], p3[1]], [p1[0], p2[1]]],
      textureId: textures[2],
      angle: 0,
    },
  ];
  res[2].angle = atan(res[2].points[0], res[2].points[1]);
  return res;
}

const models = {
  table: [
    createCuboid([0.2, 0.6], [0.25, 0.4], [0.28, 0.35], ['wood2']),
    createCuboid([0.8, 0.6], [0.85, 0.4], [0.88, 0.35], ['wood2']),
    createCuboid([0.15, 0.7], [0.2, 0.5], [0.23, 0.45], ['wood2']),
    createCuboid([0.75, 0.7], [0.8, 0.5], [0.83, 0.45], ['wood2']),
    createCuboid([0.15, 0.5], [0.8, 0.45], [0.88, 0.35], ['wood2']),
  ],
  chairLeft: [
    createCuboid([0.4, 0.6], [0.45, 0.5], [0.48, 0.45], ['wood1']), // left back
    createCuboid([0.6, 0.6], [0.65, 0.5], [0.68, 0.45], ['wood1']), // right back
    createCuboid([0.35, 0.7], [0.4, 0.6], [0.43, 0.55], ['wood1']), // left front
    createCuboid([0.55, 0.7], [0.6, 0.6], [0.63, 0.55], ['wood1']), // right front
    createCuboid([0.35, 0.6], [0.6, 0.55], [0.68, 0.4], ['wood1']), // plank
    createCuboid([0.35, 0.55], [0.4, 0.35], [0.48, 0.2], ['wood1']),
  ],
  chairBack: [
    createCuboid([0.4, 0.6], [0.45, 0.5], [0.48, 0.45], ['wood1']),
    createCuboid([0.6, 0.6], [0.65, 0.5], [0.68, 0.45], ['wood1']),
    createCuboid([0.35, 0.7], [0.4, 0.6], [0.43, 0.55], ['wood1']),
    createCuboid([0.55, 0.7], [0.6, 0.6], [0.63, 0.55], ['wood1']),
    createCuboid([0.35, 0.6], [0.6, 0.55], [0.68, 0.4], ['wood1']),
    createCuboid([0.4, 0.45], [0.65, 0.3], [0.68, 0.25], ['wood1']),
  ],

  chairRight: [
    createCuboid([0.4, 0.6], [0.45, 0.5], [0.48, 0.45], ['wood1']),
    createCuboid([0.6, 0.6], [0.65, 0.5], [0.68, 0.45], ['wood1']),
    createCuboid([0.35, 0.7], [0.4, 0.6], [0.43, 0.55], ['wood1']),
    createCuboid([0.55, 0.7], [0.6, 0.6], [0.63, 0.55], ['wood1']),
    createCuboid([0.35, 0.6], [0.6, 0.55], [0.68, 0.4], ['wood1']),
    createCuboid([0.55, 0.55], [0.6, 0.35], [0.68, 0.2], ['wood1']), // right
  ],

  chairFront: [
    createCuboid([0.4, 0.6], [0.45, 0.5], [0.48, 0.45], ['wood1']),
    createCuboid([0.6, 0.6], [0.65, 0.5], [0.68, 0.45], ['wood1']),
    createCuboid([0.35, 0.7], [0.4, 0.6], [0.43, 0.55], ['wood1']),
    createCuboid([0.55, 0.7], [0.6, 0.6], [0.63, 0.55], ['wood1']),
    createCuboid([0.35, 0.6], [0.6, 0.55], [0.68, 0.4], ['wood1']),
    createCuboid([0.35, 0.55], [0.6, 0.3], [0.63, 0.25], ['wood1']),
  ],
};

export default models;

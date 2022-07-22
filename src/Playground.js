const playgroundWidth = 500;

const Playground = {
  width: Math.min(window.innerWidth, playgroundWidth),
  height: Math.min(window.innerWidth, playgroundWidth),
};

const navHeight = 56;
const checkInRowHeight = 20;
const stageOffsetY = navHeight + checkInRowHeight;

const scale = Playground.width / playgroundWidth;


export {
  stageOffsetY,
  scale,
  Playground,
};

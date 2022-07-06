// todo: move to helper file
const getBoolArrFromInt = (myInt, size) => {
  const arr = [];
  while (myInt) {
    arr.push((myInt & 1) === 1);
    myInt >>= 1;
  }

  if (size) {
    while (size - arr.length) {
      arr.push(false);
    }
  }

  return arr;
};

// todo: move to helper file
const getIntFromBoolArr = (arr) => {
  const lastOne = arr.lastIndexOf(true);
  if (lastOne !== -1) {
    arr = arr.slice(0, lastOne + 1).reverse();
  }
  if (arr.length === 1) {
    return 1;
  }
  return arr.reduce((res, x) => res << 1 | x);
};

const randomProperty = (obj) => {
  const keys = Object.keys(obj);
  return keys[keys.length * Math.random() << 0];
};

export {
  getBoolArrFromInt,
  getIntFromBoolArr,
  randomProperty,
};

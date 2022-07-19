const getUserGoogleUId = (user) => user.auth.currentUser.providerData[0].uid;

const getUId = (auth) => auth.currentUser.uid;

export {
  getUserGoogleUId,
  getUId,
};

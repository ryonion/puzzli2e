const getUserGoogleUId = (user) => user.auth.currentUser.providerData[0].uid;

export {
  getUserGoogleUId,
};

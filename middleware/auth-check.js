const jwt = require("jsonwebtoken");

const authenCheck = (req, res, next) => {
  const authenHeader = req.get("Authorization");
  if (!authenHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authenHeader.split(" ")[1];
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  let tokenVerification;
  try {
    tokenVerification = jwt.verify(token, "secretkey");
  } catch (error) {
    req.isAuth = false;
    return next();
  }

  if (!tokenVerification) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = tokenVerification.userId;
  return next();
};

module.exports = {
  authenCheck,
};

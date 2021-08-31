const { Loaders } = require("../graphql/resolvers/resolverHelper");

const initiate = (req, res, next) => {
  Loaders.setEventLoader();
  Loaders.setUserLoader();
  return next();
};

module.exports = { initiate };

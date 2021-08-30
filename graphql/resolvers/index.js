const userResolver = require("./userResolver");
const bookingsResolver = require("./bookingsResolver");
const eventsResolver = require("./eventsResolver");

module.exports = {
  ...userResolver,
  ...bookingsResolver,
  ...eventsResolver,
};

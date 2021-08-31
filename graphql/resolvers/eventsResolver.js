const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./resolverHelper");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      let ans = events.map((ev) => {
        return transformEvent(ev._doc);
      });
      return ans;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createEvent: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error("Please login before creating event.");
      let event = args.event;
      event.price = Number(event.price);
      event.date = new Date(event.date).toISOString();
      const newEvent = new Event({ ...event, creator: req.userId });
      await newEvent.save();
      const user = await User.findById(req.userId);
      if (!user) throw new Error("User with ID not found");
      user.createdEvents.push(newEvent);
      await user.save();
      return transformEvent(newEvent._doc);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

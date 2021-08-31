const Event = require("../../models/event");
const User = require("../../models/user");
const DataLoader = require("dataloader");

const Loaders = {
  setEventLoader: function () {
    this.eventLoader = new DataLoader((eventIds) => {
      return getEventsFunc(eventIds);
    });
  },
  setUserLoader: function () {
    this.userLoader = new DataLoader((userIds) => {
      return User.find({ _id: { $in: userIds } });
    });
  },
  eventLoader: null,
  userLoader: null,
};

const transformEvent = (event) => {
  return {
    ...event,
    date: new Date(event.date).toISOString(),
    _id: event._id,
    creator: getUserFunc.bind(this, event.creator),
  };
};

const transformBooking = (bking) => {
  return {
    ...bking,
    _id: bking._id,
    createdAt: new Date(bking.createdAt).toISOString(),
    updatedAt: new Date(bking.updatedAt).toISOString(),
    event: getEventFunc.bind(this, bking.event.toString()),
    user: getUserFunc.bind(this, bking.user),
  };
};

const getEventsFunc = async (eventIDs) => {
  try {
    const events = await Event.find({ _id: { $in: eventIDs } });
    return events.map((e) => {
      return transformEvent(e._doc);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getEventFunc = async (eventID) => {
  try {
    const event = await Loaders.eventLoader.load(eventID.toString());
    return event;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUserFunc = async (uID) => {
  try {
    const user = await Loaders.userLoader.load(uID.toString());
    return {
      ...user._doc,
      password: null,
      _id: user._doc._id,
      createdEvents: () => Loaders.eventLoader.loadMany(user._doc.createdEvents),
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  transformEvent,
  transformBooking,
  getEventsFunc,
  getEventFunc,
  getUserFunc,
  Loaders,
};

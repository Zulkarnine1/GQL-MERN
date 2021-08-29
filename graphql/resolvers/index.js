const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const getEventsFunc = async (eventIDs) => {
  try {
    const events = await Event.find({ _id: { $in: eventIDs } });
    return events.map((e) => {
      return {
        ...e._doc,
        date: new Date(e._doc.date).toISOString(),
        _id: e._doc._id,
        creator: getUserFunc.bind(this, e.creator),
      };
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getEventFunc = async (eventID) => {
  try {
    const event = await Event.findById(eventID);
    return {
      ...event._doc,
      _id: event.id,
      date: new Date(event._doc.date).toISOString(),
      creator: getUserFunc.bind(this, event.creator.toString()),
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUserFunc = async (uID) => {
  try {
    const user = await User.findById(uID);
    return {
      ...user._doc,
      password: null,
      _id: user._doc._id,
      createdEvents: getEventsFunc.bind(this, user.createdEvents),
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find({});
      let ans = events.map((ev) => {
        return {
          ...ev._doc,
          _id: ev._doc._id,
          creator: getUserFunc.bind(this, ev._doc.creator.toString()),
          date: new Date(ev._doc.date).toISOString(),
        };
      });
      return ans;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bookings: async () => {
    try {
      let bookings = await Booking.find({});
      bookings = bookings.map((bking) => {
        return {
          ...bking._doc,
          _id: bking.id,
          createdAt: new Date(bking._doc.createdAt).toISOString(),
          updatedAt: new Date(bking._doc.updatedAt).toISOString(),
          event: getEventFunc.bind(this, bking._doc.event.toString()),
          user: getUserFunc.bind(this, bking._doc.user),
        };
      });
      return bookings;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createEvent: async (args) => {
    try {
      let event = args.event;
      event.price = Number(event.price);
      event.date = new Date(event.date).toISOString();
      const newEvent = new Event({ ...event, creator: "612b3eea9905252f64ad43e1" });
      await newEvent.save();
      const user = await User.findById("612b3eea9905252f64ad43e1");
      if (!user) throw new Error("User with ID not found");
      user.createdEvents.push(newEvent);
      await user.save();
      return {
        ...newEvent._doc,
        creator: getUserFunc.bind(this, user.id),
        date: new Date(newEvent._doc.date).toISOString(),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      const { email, password } = args.user;
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        throw new Error("User exists already");
      }
      let hashedPass = await bcrypt.hash(password, 12);
      const newUser = new User({ email, password: hashedPass, createdEvents: [] });
      await newUser.save();
      return { email: newUser.email, _id: newUser.id, password: null, createdEvents: getEventsFunc([]) };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bookEvent: async (args) => {
    try {
      const evID = args.eventId;
      const event = await Event.findOne({ _id: evID });
      if (!event) throw new Error("Event with this ID doesn't exist.");
      const booking = new Booking({
        event: evID,
        user: "612b3eea9905252f64ad43e1",
      });
      let result = await booking.save();
      const ans = {
        ...result._doc,
        _id: result.id,
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
        event: getEventFunc.bind(this, result._doc.event.toString()),
        user: getUserFunc.bind(this, result._doc.user),
      };
      return ans;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      if (!booking) throw new Error("Booking with this ID doesn't exist");
      let event = Object.assign({}, booking.event);
      await booking.remove();
      return {
        ...event._doc,
        _id: event._doc._id,
        date: new Date(event._doc.date).toISOString(),
        creator: getUserFunc.bind(this, event._doc.creator.toString()),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

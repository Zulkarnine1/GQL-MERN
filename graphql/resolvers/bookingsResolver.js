const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const { transformEvent, transformBooking } = require("./resolverHelper");

module.exports = {
  bookings: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error("Please login before viewing your bookings.");
      let bookings = await Booking.find({});
      bookings = bookings.map((bking) => {
        return transformBooking(bking._doc);
      });
      return bookings;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bookEvent: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error("Please login before booking an event.");
      const evID = args.eventId;
      const event = await Event.findOne({ _id: evID });
      if (!event) throw new Error("Event with this ID doesn't exist.");
      const booking = new Booking({
        event: evID,
        user: "612b3eea9905252f64ad43e1",
      });
      let result = await booking.save();
      const ans = transformBooking(result._doc);
      return ans;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelBooking: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error("Please login before cancelling a booking.");
      const booking = await Booking.findById(args.bookingId).populate("event");
      if (!booking) throw new Error("Booking with this ID doesn't exist");
      let event = Object.assign({}, booking.event);
      await booking.remove();
      return transformEvent(event._doc);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

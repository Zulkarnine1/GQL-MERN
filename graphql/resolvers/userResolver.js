const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const { getEventsFunc } = require("./resolverHelper");
const jwt = require("jsonwebtoken");

module.exports = {
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
  login: async (args) => {
    try {
      const { email, password } = args;
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) throw new Error("Invalid input data.");

      const passMatch = await bcrypt.compare(password, existingUser._doc.password);
      if (!passMatch) throw new Error("Invalid input data");

      const token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, "secretkey", { expiresIn: "24h" });

      return {
        userId: existingUser.id,
        token,
        tokenExpiration: 24,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

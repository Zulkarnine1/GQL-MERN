const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const GQLSchema = require("./graphql/schema/index");
const GQLResolvers = require("./graphql/resolvers/index");
const { authenCheck } = require("./middleware/auth-check");
const { initiate } = require("./middleware/loaderInitializer");

const app = express();

const EVENTS = [];

app.use(express.json());
app.use(authenCheck);
app.use(initiate);
app.use(
  "/graphql",

  graphqlHTTP({
    schema: GQLSchema,
    rootValue: GQLResolvers,
    graphiql: true,
  })
);

mongoose
  .connect("mongodb://admin:password@localhost:27017/eventDB?authSource=admin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Server is running on PORT => " + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

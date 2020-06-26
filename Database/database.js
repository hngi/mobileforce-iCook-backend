const mongoose = require("mongoose");
//TODO: put mongodb URI in .env file


mongoose.connect(
  process.env.MONGODB_URI || "mongodb+srv://admin-babslaw:babalola1996@cluster0-hthp7.mongodb.net/iCook?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("connected to mongodb");
});
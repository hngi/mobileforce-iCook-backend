const express = require("express");
require('dotenv').config()

//const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors')

const app = express();

//init middleware
//1. Body Parser
app.use(express.json())
app.use(express.urlencoded({extended: false}))
//2. CORS
app.use(cors())

//connect to mongoDB Atlas
//TODO: put mongodb URI in .env file
mongoose.connect(
  "mongodb+srv://GoZaddy:iCookPass123@cluster0-zogx0.gcp.mongodb.net/iChop?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("connected to mongodb");
});

//api routes
app.use("/api/users", require("./Routes/userRoute"))
app.use("/api/dishes", require("./Routes/dishRoute"))

//connect to server locally on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at ${port}`)
})

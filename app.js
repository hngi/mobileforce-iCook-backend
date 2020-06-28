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

const DB =  process.env.MONGODB_URI_COMPASS || process.env.MONGODB_URI_CLOUD
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful');
  }).catch(err => {
    console.log("Unable to connect to database:",err)
  })

//api routes
app.use("/api/v1/users", require("./v1/Routes/userRoute"))
app.use("/api/v1/dishes", require("./v1/Routes/dishRoute"))
app.use("/api/v1/authenticate", require("./v1/Routes/authRoute"))

//connect to server locally on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at ${port}`)
  
})

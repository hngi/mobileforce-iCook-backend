const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();

app.use(bodyParser.json());

const authRoute = require('../mobileforce-iCook-backend/Routes/authRoute');


//Routes

//home route
app.get('/api/v1', (req, res) => {
    res.status(200).json({status: "success", message: "Welcome to iCook app"});
});
//auth route
app.use('/api/v1', authRoute);

//connect to mongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://GoZaddy:iCookPass123@cluster0-zogx0.gcp.mongodb.net/iChop?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    console.log("Database connected");
});



//connect to server locally on port 3000
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Server listening at ${port}`);

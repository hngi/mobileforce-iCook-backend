const express = require("express");
require('dotenv').config()
require('./Database/database');

//const bodyParser = require("body-parser");
const cors = require('cors')

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())


app.use("/api/v1/users", require("./v1/Routes/userRoute"))
app.use("/api/v1/dishes", require("./v1/Routes/dishRoute"))
app.use("/api/v1/authenticate", require("./v1/Routes/authRoute"))

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at ${port}`)
});

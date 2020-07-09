const express = require("express");
require('./Database/database');

// const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use("/api/v1/me", require("./v1/Routes/meRoute"));
app.use("/api/v1/users", require("./v1/Routes/userRoute"));
app.use("/api/v1/dishes", require("./v1/Routes/dishRoute"));
app.use("/api/v1/authenticate", require("./v1/Routes/authRoute"));
app.use("/api/v1/search", require("./v1/Routes/searchRoute"));

app.use((err, req, res, next) => {
  res.status(500).json({
    status: 'fail',
    error: err.message
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at ${port}`)
});

// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Timestamp API
app.get("/api/:date?", function (req, res) {
  var date;

  // No date provided -> current time
  if (!req.params.date) {
    date = new Date();
  } else {
    var dateString = req.params.date;

    // If the date is a Unix timestamp, convert it to a Number
    if (/^\d+$/.test(dateString)) {
      date = new Date(Number(dateString));
    } else {
      // Otherwise, parse it as a normal date string
      date = new Date(dateString);
    }

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return res.json({
        error: "Invalid Date"
      });
    }
  }

  // Return Unix timestamp and UTC date
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Your app is listening on port ' + listener.address().port
  );
});
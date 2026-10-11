// index.js
// where your node app starts

var express = require('express');
var app = express();

var cors = require('cors');

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static('public'));

// Home page
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Request Header Parser API
app.get("/api/whoami", function (req, res) {
  var ipaddress =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;

  if (ipaddress && ipaddress.includes(',')) {
    ipaddress = ipaddress.split(',')[0].trim();
  }

  res.json({
    ipaddress: ipaddress,
    language: req.headers['accept-language'],
    software: req.headers['user-agent']
  });
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Your app is listening on port ' + listener.address().port
  );
});
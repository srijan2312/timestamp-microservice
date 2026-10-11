// index.js
// where your node app starts

var express = require('express');
var app = express();

var cors = require('cors');

app.use(cors({ optionsSuccessStatus: 200 }));

// Parse URL-encoded POST data
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static('public'));

// Home page
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Store shortened URLs
var urls = [];
var nextId = 1;

// Create a short URL
app.post("/api/shorturl", function (req, res) {
  var originalUrl = req.body.url;

  try {
    var parsedUrl = new URL(originalUrl);

    // Only allow http and https URLs
    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      throw new Error();
    }

    var shortUrl = nextId++;

    urls.push({
      original_url: originalUrl,
      short_url: shortUrl
    });

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });

  } catch (error) {
    res.json({
      error: "invalid url"
    });
  }
});

// Redirect short URL to original URL
app.get("/api/shorturl/:short_url", function (req, res) {
  var shortUrl = Number(req.params.short_url);

  var url = urls.find(function (item) {
    return item.short_url === shortUrl;
  });

  if (!url) {
    return res.json({
      error: "No short URL found for the given input"
    });
  }

  res.redirect(url.original_url);
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Your app is listening on port ' + listener.address().port
  );
});
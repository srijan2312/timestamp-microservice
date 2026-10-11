'use strict';

require('dotenv').config();

var express = require('express');
var cors = require('cors');
var multer = require('multer');
var path = require('path');

var app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Configure Multer to process uploaded files in memory.
var upload = multer({
  storage: multer.memoryStorage()
});

// Homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
});

// File Metadata API
app.post('/api/fileanalyse', upload.single('upfile'), function (req, res) {
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});

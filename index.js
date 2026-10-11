require('dotenv').config();

var express = require('express');
var app = express();

var cors = require('cors');
var mongoose = require('mongoose');

app.use(cors({ optionsSuccessStatus: 200 }));

// Parse form data
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// User Schema
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

// Exercise Schema
var exerciseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

var User = mongoose.model('User', userSchema);
var Exercise = mongoose.model('Exercise', exerciseSchema);

// Home page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', async function (req, res) {
  try {
    var username = req.body.username;

    var newUser = new User({
      username: username
    });

    var data = await newUser.save();

    res.json({
      username: data.username,
      _id: data._id
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

// Get all users
app.get('/api/users', async function (req, res) {
  try {
    var users = await User.find({});

    res.json(
      users.map(function (user) {
        return {
          username: user.username,
          _id: user._id
        };
      })
    );
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

// Add an exercise for a user
app.post('/api/users/:_id/exercises', async function (req, res) {
  try {
    var userId = req.params._id;
    var description = req.body.description;
    var duration = Number(req.body.duration);

    var exerciseDate;

    if (req.body.date) {
      exerciseDate = new Date(req.body.date);
    } else {
      exerciseDate = new Date();
    }

    var user = await User.findById(userId);

    if (!user) {
      return res.json({
        error: 'User not found'
      });
    }

    var exercise = new Exercise({
      userId: user._id,
      description: description,
      duration: duration,
      date: exerciseDate
    });

    var savedExercise = await exercise.save();

    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
      _id: user._id
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

// Get exercise log for a user
app.get('/api/users/:_id/logs', async function (req, res) {
  try {
    var userId = req.params._id;

    var user = await User.findById(userId);

    if (!user) {
      return res.json({
        error: 'User not found'
      });
    }

    var query = {
      userId: user._id
    };

    // Date filtering
    if (req.query.from || req.query.to) {
      query.date = {};

      if (req.query.from) {
        query.date.$gte = new Date(req.query.from);
      }

      if (req.query.to) {
        var toDate = new Date(req.query.to);

        // Include the entire "to" day
        toDate.setDate(toDate.getDate() + 1);

        query.date.$lt = toDate;
      }
    }

    var exerciseQuery = Exercise.find(query).sort({ date: 1 });

    if (req.query.limit) {
      exerciseQuery = exerciseQuery.limit(Number(req.query.limit));
    }

    var exercises = await exerciseQuery.exec();

    var log = exercises.map(function (exercise) {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      };
    });

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

// Listen on port
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Your app is listening on port ' + listener.address().port
  );
});
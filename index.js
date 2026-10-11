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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
app.post('/api/users', function (req, res) {
  var username = req.body.username;

  var newUser = new User({
    username: username
  });

  newUser.save(function (err, data) {
    if (err) {
      return res.json({
        error: err.message
      });
    }

    res.json({
      username: data.username,
      _id: data._id
    });
  });
});

// Get all users
app.get('/api/users', function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      return res.json({
        error: err.message
      });
    }

    res.json(users.map(function (user) {
      return {
        username: user.username,
        _id: user._id
      };
    }));
  });
});

// Add an exercise for a user
app.post('/api/users/:_id/exercises', function (req, res) {
  var userId = req.params._id;
  var description = req.body.description;
  var duration = Number(req.body.duration);

  var exerciseDate;

  if (req.body.date) {
    exerciseDate = new Date(req.body.date);
  } else {
    exerciseDate = new Date();
  }

  User.findById(userId, function (err, user) {
    if (err || !user) {
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

    exercise.save(function (err, savedExercise) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      res.json({
        username: user.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date.toDateString(),
        _id: user._id
      });
    });
  });
});

// Get exercise log for a user
app.get('/api/users/:_id/logs', function (req, res) {
  var userId = req.params._id;

  User.findById(userId, function (err, user) {
    if (err || !user) {
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

    Exercise.find(query)
      .sort({ date: 1 })
      .limit(req.query.limit ? Number(req.query.limit) : 0)
      .exec(function (err, exercises) {
        if (err) {
          return res.json({
            error: err.message
          });
        }

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
      });
  });
});

// Listen on port
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Your app is listening on port ' + listener.address().port
  );
});
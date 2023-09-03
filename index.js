const express = require("express");
const app = express();
const cors = require("cors");
const parser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(
  parser.urlencoded({
    extended: true,
  }),
);

let users = [];

let exercises = [];

const checkId = (sentId) => {
  const findId = users.find((users) => {
    return users._id === sentId;
  });

  console.log(findId);

  return findId;
};

app.post("/api/users/:_id/exercises", (req, res) => {
  const description = req.body.description;
  const duration = req.body.duration;
  const date = new Date(req.body.date).toDateString();

  if (checkId(req.params._id)) {
    res.json({
      _id: req.params._id,
      description: description,
      duration: duration,
      date: date,
    });

    exercises.push({
      _id: req.params._id,
      description: description,
      duration: duration,
      date: date,
    });
    console.log(exercises);
  }
});

app.get("/api/users/:_id/logs", (req, res) => {
  const getUsrName = (input) => {
    const findUsr = users.find((users) => users._id === input);

    if (findUsr) {
      return findUsr.user;
    } else {
      console.log("No user with this ID");
    }
  };

  const getExercises = (_id, limit, from, to) => {
    const matchIdWithExercise = exercises
      .filter((exercises) => exercises._id === _id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const fromTo = matchIdWithExercise.filter((exercises) => {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return (
        new Date(exercises.date) >= fromDate &&
        new Date(exercises.date) <= toDate
      );
    });

    if (from && to) {
      if (limit) {
        const fromToSliced = fromTo.slice(0, limit);
        return fromToSliced;
      } else {
        return fromTo;
      }
    } else if (limit) {
      const limitSlice = matchIdWithExercise.slice(0, limit);
      console.log(limitSlice);
      return limitSlice;
    } else {
      return matchIdWithExercise;
    }
  };

  const countExercises = (_id, limit) => {
    let count = 0;
    if (limit) {
      count = limit;
    } else {
      exercises.forEach((exercise) => {
        if (exercise._id === _id) {
          count++;
        }
      });
    }

    return count;
  };

  const findUsrName = getUsrName(req.params._id);

  if (checkId(req.params._id)) {
    const from = req.query.from;
    const to = req.query.to;
    const limit = parseInt(req.query.limit);

    if (limit || (from && to)) {
      const findExercisesLimit = getExercises(req.params._id, limit, from, to);
      const countingToLimit = countExercises(req.params._id, limit);

      res.json({
        username: findUsrName,
        count: countingToLimit,
        _id: req.params._id,
        log: findExercisesLimit,
      });
    } else {
      const findExercises = getExercises(req.params._id);
      console.log(findExercises);
      const counting = countExercises(req.params._id);

      res.json({
        username: findUsrName,
        count: counting,
        _id: req.params._id,
        log: findExercises,
      });
    }
  }
});

app.post("/api/users", (req, res) => {
  const createUser = (username) => {
    const id = crypto.randomUUID();
    users.push({ user: username, _id: id });

    return id;
  };

  const id = createUser(req.body.username);

  res.json({
    username: req.body.username,
    _id: id,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

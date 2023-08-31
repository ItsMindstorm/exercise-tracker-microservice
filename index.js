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

let users = [
  {
    user: "ItsMindstorm",
    _id: "bda96a28-b13d-41c7-bf52-91b63eba4850",
  },
];

let exercises = [
  {
    _id: "",
    description: "testdata",
    duration: 60,
    date: "",
  },
];

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

  const getExercises = (_id) => {
    const matchIdWithExercise = exercises.filter((exercises) => {
      return exercises._id === _id;
    });

    return matchIdWithExercise;
  };

  const countExercises = (_id) => {
    let count = 0;
    exercises.forEach((exercise) => {
      if (exercise._id === _id) {
        count++;
      }
    });

    return count;
  };

  const findUsrName = getUsrName(req.params._id);
  const findExercises = getExercises(req.params._id);
  const counting = countExercises(req.params._id);

  if (checkId(req.params._id)) {
    res.json({
      username: findUsrName,
      count: counting,
      _id: req.params._id,
      log: findExercises,
    });
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

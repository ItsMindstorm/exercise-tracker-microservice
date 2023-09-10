const express = require("express");
const app = express();
const cors = require("cors");
const parser = require("body-parser");
const { MongoClient } = require("mongodb")
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));

const client = new MongoClient(process.env.DB_URL)
const db = client.db("exercise-tracker")
const users = db.collection("users")
const exercises = db.collection("exercises")

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

app.use(
	parser.urlencoded({
		extended: true,
	}),
);

app.post("/api/users/:_id/exercises", async (req, res) => {
	const description = req.body.description;
	const duration = parseInt(req.body.duration);
	const date = new Date(req.body.date).toDateString();

	if (users.findOne({ id: req.params._id })) {
		await exercises.insertOne({
			id: req.params._id,
			description: description,
			duration: duration,
			date: date,
			hiddenDate: new Date(req.body.date)
		});

		res.json({
			_id: req.params._id,
			description: description,
			duration: duration,
			date: date,
		});
	}
});

app.get("/api/users/:_id/logs", async (req, res) => {
	const limit = parseInt(req.query.limit)
	const from = req.query.from ? new Date(req.query.from) : null
	const to = req.query.to ? new Date(req.query.to) : null
	console.log(new Date(from))
	console.log(new Date(to))

	if (await users.findOne({ id: req.params._id })) {
		const query = {
			hiddenDate: {
				$lte: to,
				$gte: from
			},
			id: req.params._id
		}

		const sort = {
			hiddenDate: 1
		}

		const projection = {
			_id: 0, id: 0, hiddenDate: 0

		}
		const log = exercises.find(query).project(projection).limit(limit).sort(sort)
		const allExercises = await log.toArray()

		const count = limit ? limit : await exercises.countDocuments({ id: req.params._id })

		res.json({
			_id: req.params._id,
			count: count,
			log: allExercises,
		})
	} else {
		res.json({
			error: "user not found"
		})
	}
});

app.post("/api/users", (req, res) => {
	const username = req.body.username;

	const id = crypto.randomUUID();
	users.insertOne({ user: username, id: id });

	res.json({
		username: username,
		_id: id,
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});

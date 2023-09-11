const express = require("express")
const app = express()
const cors = require("cors")

const parser = require("body-parser")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config();

app.use(cors());
app.use(express.static("public"))

mongoose.connect(process.env.DB_URL_ALTERNATE)

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	}
}, { collection: "users" })

const exerciseSchema = new mongoose.Schema({
	username: {
		type: String,
		require: true
	},
	description: {
		type: String,
		require: true
	},
	duration: {
		type: Number,
		require: true
	},
	date: {
		type: Date,
		require: false
	}
}, { collection: "exercises" })

const User = mongoose.model("User", userSchema)
const Exercise = mongoose.model("Exercise", exerciseSchema)

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

app.use(
	parser.urlencoded({
		extended: true,
	}),
);

app.post("/api/users", (req, res) => {
	let username = req.body.username
	let user = new User({
		username: username
	})

	user.save()
	res.json(user)
})

app.get("/api/users", async (req, res) => {
	const userFind = await User.find({}, { __v: 0 })
	res.json(userFind)
})

app.post("/api/users/:_id/exercises", async (req, res) => {
	let userId = req.params._id
	console.log(userId)
	await User.findById(userId).then(users => {
		let username = users.username

		let exercise = new Exercise({
			username: username,
			description: req.body.description,
			duration: req.body.duration,
			date: req.body.date === undefined ? "" : new Date(req.body.date).toDateString()
		});
		exercise.save()
		res.json(exercise)
	})
})

app.get("/api/users/:_id/logs", async (req, res) => {
	let userId = req.params._id
	let from = req.query.from ? new Date(req.query.from).toDateString() : undefined
	let to = req.query.to ? new Date(req.query.to).toDateString() : undefined
	let limit = req.query.limit
	console.log(limit)

	const username = await User.findById(userId).then(users => {
		return users.username
	})

	const query = from === undefined && to === undefined ? {
		username: username
	} : {
		date: {
			$lte: to,
			$gte: from
		},
		username: username
	}

	await Exercise.find(query, { __v: 0, }).sort({ date: 1 }).then(exercises => {
		if (limit) {
			exercises = exercises.slice(0, limit)
		}

		let log = exercises.map(exercise => {
			return {
				description: exercise.description,
				duration: exercise.duration,
				date: exercise.date.toDateString()
			}
		})

		res.json({
			username: username,
			count: exercises.length,
			_id: userId,
			log: log
		})

	})
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});

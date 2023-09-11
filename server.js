const express = require("express")
const app = express()
const cors = require("cors")

const parser = require("body-parser")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config();

app.use(cors());
app.use(express.static("public"))

mongoose.connect(process.env.DB_URL)

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
		let date = (!req.body.date) ? new Date().toDateString() : new Date(req.body.date).toDateString()
		console.log(date)

		if (date == "Invalid Date") {
			res.json({
				error: "Invalid Date"
			})
		}

		if (isNaN(parseFloat(req.body.duration))) {
			res.json({
				error: "Duration needs to be a number"
			})
		};


		let exercise = new Exercise({
			username: username,
			description: req.body.description,
			duration: req.body.duration,
			date: date
		});
		exercise.save()
		res.json({
			username: username,
			description: req.body.description,
			duration: parseFloat(req.body.duration),
			date: date,
			_id: userId
		})
	}).catch(err => {
		if (err) {
			res.json({
				error: "Wrong ID"
			})
		}
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
	}).catch(err => {
		if (err) {
			res.json({
				error: "No exercises under this ID"
			})
		}
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

	}).catch(err => {
		if (err) {
			res.json({
				error: "No exercises under this user"
			})
		}
	})
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});

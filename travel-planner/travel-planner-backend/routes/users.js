const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const userModel = require("./../models/users");
const Parse = require("parse/node");

router.use(bodyParser.json());

router.post("/register", async (req, res) => {
	let infoUser = req.body;

	try {
		userModel.signUp(infoUser.username, infoUser.email, infoUser.password);

		res.status(200).send({
			loginMessage: "",
			registerMessage: `Account created! Username: ${infoUser.username} Please check ${infoUser.email} to verify.`,
			typeStatus: "success",
			infoUser: infoUser,
		});
	} catch (error) {
		res.status(409).send({
			loginMessage: "",
			registerMessage: error.message,
			typeStatus: "danger",
			infoUser: infoUser,
		});
	}
});

router.post("/login", async (req, res) => {
	let infoUser = req.body;

	try {
		let sessionToken = (
			await userModel.logIn(infoUser.username, infoUser.password)
		).sessionToken;

		res.status(200).send({
			loginMessage: `${infoUser.username} has been logged in!`,
			registerMessage: "",
			typeStatus: "success",
			infoUser: infoUser,
			sessionToken: sessionToken,
		});
	} catch (error) {
		res.status(409).send({
			loginMessage: error.message,
			registerMessage: "",
			typeStatus: "danger",
			infoUser: infoUser,
		});
	}
});

router.post("/logout", async (req, res) => {
	let sessionToken = req.body.sessionToken;
	await userModel.logOut(sessionToken);
});

router.post("/getPreferences", async (req, res) => {
	const sessionToken = req.body.sessionToken;

	try {
		let query = new Parse.Query("_Session");
		query.equalTo("sessionToken", sessionToken);
		query.first().then((session) => {
			if (session) {
				const user = session.get("user");
				if (user) {
					user.fetch().then((user) => {
						user
							.get("Preferences")
							.fetch()
							.then((userPreferences) => {
								res.status(200).send({ userPreferences: userPreferences });
							});
					});
				} else {
					res.status(400).send({ message: "ERROR: no user found" });
				}
			} else {
				res.status(400).send({ message: "ERROR: no session token" });
			}
		});
	} catch (error) {
		res
			.status(400)
			.send({ message: "ERROR when getting user preferences.", error: error });
	}
});

router.post("/savePreferences", async (req, res) => {
	const userPreferences = req.body.userPreferences;

	const fields = [
		"MaxDuration",
		"MinWalkability",
		"TempRange",
		"HumidityMax",
		"WindMax",
		"PreferDaylight",
		"PreferWalk",
		"Weight",
	];

	const query = new Parse.Query("Preferences");
	query.equalTo("objectId", userPreferences.objectId);
	query.first().then((preferences) => {
		fields.forEach((field) => {
			preferences.set(field, userPreferences[field]);
		});

		preferences
			.save()
			.then(() => {
				res
					.status(200)
					.send({ message: "New user preferences successfully saved." });
			})
			.catch((error) => {
				res.status(400).send({
					message: "ERROR: user preferences failed to save.",
					error: error,
				});
			});
	});
});

module.exports = router;

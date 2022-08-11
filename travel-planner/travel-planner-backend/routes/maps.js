const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
const Parse = require("parse/node");
const axios = require("axios");
const { query } = require("express");

// TO-DO: create delete pin endpoint

router.post("/createMapDirections", async (req, res) => {
	const type = req.body.type;
	const origin = req.body.origin;
	const destination = req.body.destination;
	const distance = req.body.distance;
	const duration = req.body.duration;
	const directionsArr = req.body.directions;
	const reason = req.body.reason;

	// Save in the database
	const Directions = Parse.Object.extend("Directions");
	const Maps = Parse.Object.extend("Maps");

	try {
		const direction = new Directions();
		const mapPointer = new Maps().set("objectId", req.body.mapId);

		direction.set("Origin", origin);
		direction.set("Destination", destination);
		direction.set("TravelMode", type);
		direction.set("Duration", duration);
		direction.set("Distance", distance);
		direction.set("Directions", directionsArr);
		direction.set("Map", mapPointer);
		direction.set("Reason", reason);

		direction.save().then(() => {
			res.status(200).send({ direction: direction });
		});
	} catch (error) {
		res.status(400).send({ message: error, type: "Error" });
	}
});

router.post("/getAllSavedDirections", async (req, res) => {
	const Maps = Parse.Object.extend("Maps");
	const mapPointer = new Maps().set("objectId", req.body.mapId);

	let query = new Parse.Query("Directions");
	query.equalTo("Map", mapPointer);
	query
		.find()
		.then(function (directions) {
			res.status(200).send(directions);
		})
		.catch((error) => {
			res.status(400).send({
				message: error,
			});
		});
});

router.post("/newMap", async (req, res) => {
	try {
		let title = req.body.title;
		let center = req.body.center;
		let sessionToken = req.body.sessionToken;

		// Pass in center and get lat and lng here:
		const lat = 30;
		const lng = 0;

		const Maps = Parse.Object.extend("Maps");

		const map = new Maps();

		// Get user given the session token
		let query = new Parse.Query("_Session");
		query.equalTo("sessionToken", sessionToken);
		query.first().then(function (session) {
			if (session) {
				const user = session.get("user");
				if (user) {
					console.log("user: ", user);
					map.set("User", user);
					map.set("MapName", title);
					map.set(
						"Center",
						new Parse.GeoPoint({ latitude: lat, longitude: lng })
					);
					map.set("Archived", false);

					map.save().then((newMap) => {
						res.status(200).send(newMap);
					});
				} else {
					res.status(400).send({ message: "ERROR: no user found." });
				}
			} else {
				res.status(400).send({
					typeStatus: "danger",
					message: "ERROR: No session found for that token.",
				});
			}
		});
	} catch (error) {
		res.status(400).send({ typeStatus: "danger", message: error });
	}
});

router.post("/getUserMaps", async (req, res) => {
	const isArchived = req.body.isArchived;

	// fetch the user
	let query = new Parse.Query("_Session");
	query.equalTo("sessionToken", req.body.sessionToken);
	query.first().then(function (session) {
		if (session) {
			const user = session.get("user");

			// find all the maps that belong to the user
			query = new Parse.Query("Maps");
			query.equalTo("User", user);
			query
				.find()
				.then(function (maps) {
					for (let i = maps.length - 1; i >= 0; i--) {
						if (maps[i].get("Archived") != isArchived) {
							maps.splice(i, 1);
						}
					}

					res.status(200).send(maps);
				})
				.catch((error) => {
					res.status(400).send({
						typeStatus: "danger",
						message: "ERROR: Query failed to get maps given user.",
						error: error,
					});
				});
		} else {
			res.status(400).send({
				typeStatus: "danger",
				message: "ERROR: Invalid session token in getUserMaps!",
			});
		}
	});
});

router.post("/createNewMarker", async (req, res) => {
	const mapId = req.body.mapId; // Maps object
	const location = req.body.location; // {lat: , lng:}
	const address = req.body.address;

	try {
		const Markers = Parse.Object.extend("Markers");
		const Notes = Parse.Object.extend("Notes");
		const Maps = Parse.Object.extend("Maps");

		const mapPointer = new Maps().set("objectId", mapId);

		const marker = new Markers();

		marker.set("Map", mapPointer);
		marker.set("Note", new Notes());
		marker.set(
			"Location",
			new Parse.GeoPoint({ latitude: location.lat, longitude: location.lng })
		);
		marker.set("Address", address);

		marker.save().then((newMarker) => {
			// return the created marker so it can be added to the map
			res.status(200).send({ marker: newMarker });
		});
	} catch (error) {
		res.status(400).send({ message: error });
	}
});

router.post("/getMarkers", async (req, res) => {
	// get the marker array from the map
	try {
		const mapId = req.body.mapId;

		const Maps = Parse.Object.extend("Maps");
		const mapPointer = new Maps().set("objectId", mapId);

		let query = new Parse.Query("Markers");
		query.equalTo("Map", mapPointer);
		query.find().then((markers) => {
			res.status(200).send({ markers: markers });
		});
	} catch (error) {
		res.status(400).send({ message: error });
	}
});

router.post("/updateNote", async (req, res) => {
	// Update the name and content of the map marker
	try {
		const markerId = req.body.markerId;
		const newName = req.body.name;
		const newContent = req.body.content;

		const Markers = Parse.Object.extend("Markers");
		const marker = new Markers().set("objectId", markerId);

		marker.set("Name", newName);
		marker.set("Content", newContent);
		marker.save().then((updatedMarker) => {
			res.status(200).send({ marker: updatedMarker });
		});
	} catch (error) {
		res.status(400).send({ message: error });
	}
});

router.post("/getAddress", async (req, res) => {
	// Using this api: https://positionstack.com/

	const API_KEY = process.env.POSITION_STACK_API_KEY;

	const params = {
		access_key: API_KEY,
		query: req.body.address,
		limit: 1,
		output: "json",
	};

	axios
		.get("http://api.positionstack.com/v1/forward", { params })
		.then((response) => {
			const results = response.data.data[0];
			res.status(200).send({
				address: results.label,
				coordinates: { lat: results.latitude, lng: results.longitude },
			});
		})
		.catch((error) => {
			res.status(500).send({ message: error });
		});
});

router.post("/archiveMap", async (req, res) => {
	const mapId = req.body.mapId;

	const query = new Parse.Query("Maps");
	query.equalTo("objectId", mapId);
	query.first().then((map) => {
		map.set("Archived", true);
		map
			.save()
			.then(() => {
				res.status(200).send({ message: "Trip successfully archived." });
			})
			.catch((error) => {
				res.status(400).send({ message: "ERROR when archiving trip." });
			});
	});
});

module.exports = router;

const Parse = require("parse/node");
const axios = require("axios");

class Maps {
	static async createNewMap(title, center, sessionToken) {
		const Maps = Parse.Object.extend("Maps");
		const Timelines = Parse.Object.extend("Timelines");

		const map = new Maps();

		let query = new Parse.Query("_Session");
		query.equalTo("sessionToken", sessionToken);
		query.first().then(function (session) {
			if (session) {
				const user = session.get("user");
				map.set("User", user);
			} else {
				throw "ERROR: Invalid session token!";
			}
		});

		map.set("MapName", title);
		map.set(
			"Center",
			new Parse.GeoPoint({ latitude: center.lat, longitude: center.lng })
		);

		map.set("Timeline", new Timelines());

		map.save().then((newMap) => {
			return newMap;
		});
	}

	static async getUserMaps(sessionToken) {
		let query = new Parse.Query("_Session");
		query.equalTo("sessionToken", sessionToken);
		query.first().then(function (session) {
			if (session) {
				const user = session.get("user");

				query = new Parse.Query("Maps");
				query.equalTo("User", user);
				query
					.find()
					.then(function (maps) {
						console.log(maps);
						return maps;
					})
					.catch((error) => {
						console.log("Confused? ", error);
					});
			} else {
				throw "ERROR: Invalid session token when get user maps!";
			}
		});
	}

	static async getAddress(address) {
		// Using this api: https://positionstack.com/
		// I can specify a region (this would already be provided if the user wants recommendations)

		// STRETCH: can we confirm the user typed in a valid address first before doing anything?
		// Potentially with this api: https://www.smarty.com/products/apis/international-street-api

		const API_KEY = process.env.POSITION_STACK_API_KEY;

		const params = {
			access_key: API_KEY,
			query: address,
			limit: 1,
			output: 'json'
		}

		axios.get('http://api.positionstack.com/v1/forward', { params })
			.then(response => {
				console.log("response: ", response.data.data[0])
				return response.data.data[0]
			})
			.catch ((error) => {
				throw error
			})

	}
}

module.exports = Maps;

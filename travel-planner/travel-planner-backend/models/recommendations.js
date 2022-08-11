const Parse = require("parse/node");
const axios = require("axios");
require("dotenv").config();

class Recommendations {
	static async getRecommendation(
		userPreferences,
		walkingDuration,
		drivingDuration,
		location
	) {
		// duration is in seconds. Take in user preference in minutes, then convert to seconds
		const maxDuration = userPreferences.get("MaxDuration") * 60;

		if (walkingDuration.value > maxDuration) {
			return {
				type: "DRIVING",
				reason:
					"The walking duration is " +
					walkingDuration.text +
					" which exceeds " +
					maxDuration.toString() +
					" mins.",
			};
		}

		// TODO: Add walkability here.

		// Get weather information
		const weatherResult = await this.getWeatherData(location);
		const tempRange = userPreferences.get("TempRange");

		var reason = [];

		if (
			!(
				weatherResult.feels_like >= tempRange.min &&
				weatherResult.feels_like <= tempRange.max
			)
		) {
			reason.push(
				"The temperature feels like " +
					weatherResult.feels_like.toString() +
					" degrees Fahrenheit which is outside your preferred temperature range."
			);
		}

		const humidityMax = userPreferences.get("HumidityMax");
		if (weatherResult.humidity > humidityMax) {
			reason.push(
				"The humidity (" + weatherResult.humidity.toString() + "%) is too high."
			);
		}

		const windMax = userPreferences.get("WindMax");

		if (weatherResult.wind > windMax) {
			reason.push(
				"It is too windy with a speed of " +
					weatherResult.wind.toString() +
					" mph."
			);
		}

		// TODO: add preferDaylight.
		// clouds will be taken into consideration when calculating sunlight

		if (reason.length === 0) {
			// Set the default points.
			var points = userPreferences.get("PreferWalk") ? 0.5 : 0;
			let weight = userPreferences.get("Weight");

			// Recalculate the weights so it's out of 1.
			let total = 0;
			Object.keys(weight).forEach((key) => {
				total += weight[key];
			});

			Object.keys(weight).forEach((key) => {
				weight[key] /= total;
			});

			// Consider how close the temperature is to ideal (or the center of the user's tempRange)
			// 1 - abs( distance from the mean ) / ( total range )
			let idealTemp = (tempRange.min + tempRange.max) / 2;
			let range = tempRange.max - tempRange.min;
			points +=
				(1 - Math.abs(weatherResult.feels_like - idealTemp) / range) *
				weight.temp;

			// Consider how walking duration varies from driving duration
			points +=
				(drivingDuration.value / walkingDuration.value) * weight.duration;

			// Consider how bad the wind is compared to the max
			// windMax - curWind / windMax
			points += 2 * ((windMax - weatherResult.wind) / windMax) * weight.wind;

			// Consider how high the humidity is in the same way
			points +=
				2 *
				((humidityMax - weatherResult.humidity) / humidityMax) *
				weight.humidity;

			if (points >= 1) {
				return {
					type: "WALKING",
					reason:
						"The weather is nice and driving will include lots of traffic.",
				};
			} else {
				return {
					type: "DRIVING",
					reason:
						"Although walking is very doable, it may be better to drive given your personal preferences and the difference in duration between driving and walking this route.",
				};
			}
		} else {
			return {
				type: "DRIVING",
				reason: reason.join("\n"),
			};
		}
	}

	static async getWeatherData(location) {
		const API_KEY = process.env.OPEN_WEATHER_API_KEY;

		const params = {
			lat: location.lat,
			lon: location.lng,
			appid: API_KEY,
			units: "imperial",
		};

		try {
			const response = await axios.get(
				"https://api.openweathermap.org/data/2.5/weather",
				{ params }
			);

			const results = response.data;

			return {
				temp: {
					current: results.main.temp,
					min: results.main.temp_min,
					max: results.main.temp_max,
				}, // degrees F
				feels_like: results.main.feels_like,
				humidity: results.main.humidity,
				wind: results.wind.speed, // mph
				clouds: results.clouds.all, // %
				daylight: {
					sunrise: results.sys.sunrise,
					sunset: results.sys.sunset,
					timezone: results.timezone,
				}, //unix utc time (need to convert the user's travel time to this and see if it's in the range)
				// use this api: https://unixtime.co.za/
				// GET request url: https://showcase.api.linx.twenty57.net/UnixTime/tounixtimestamp?datetime=2022/07/27 14:16:00
				description: {
					text: results.weather[0].description,
					icon: results.weather[0].icon,
				},
			};
		} catch (error) {
			console.log("ERROR: in backend while fetching weather data: ", error);
		}

		// Note: I can also display weather for the next 5 days, but let's not do that for now. (I can even get weather icons!)
		// https://openweathermap.org/weather-conditions#How-to-get-icon-URL
	}
}

module.exports = Recommendations;

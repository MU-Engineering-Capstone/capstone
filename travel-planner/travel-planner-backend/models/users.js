const Parse = require("parse/node");

class Users {
	static async logIn(username, password) {
		let user = await Parse.User.logIn(username, password);

		return { sessionToken: await user.getSessionToken() };
	}

	static async logOut(sessionToken) {
		let query = new Parse.Query("_Session");

		/* Get all sessions with the session token (there should only be one) */
		query.equalTo("sessionToken", sessionToken);

		query.first({ useMasterKey: true }).then(function (user) {
			if (user) {
				/* Remove the session from the table. */
				user
					.destroy({ useMasterKey: true })
					.then(function (res) {
						console.log("Successfully destroyed session!");
					})
					.catch(function (error) {
						console.log(error);
						return null;
					});
			} else {
				console.log("Nothing found? ...");
				return null;
			}
		});
	}

	static async signUp(username, email, password) {
		let user = new Parse.User();
		const Preferences = Parse.Object.extend("Preferences");

		user.set("username", username);
		user.set("email", email);
		user.set("password", password);
		user.set("Preferences", new Preferences());

		let newUser = await user.signUp();
		await this.logOut(newUser.getSessionToken());
	}
}

module.exports = Users;

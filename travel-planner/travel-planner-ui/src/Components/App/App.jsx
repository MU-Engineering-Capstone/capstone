import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "../Navbar/Navbar";
import Plan from "../Plan/Plan";
import Login from "../Login/Login";
import SignUp from "../SignUp/SignUp";
import Overview from "../Overview/Overview";
import History from "../History/History";
import { UserContext } from "../../UserContext";

export const PORT = 3001;

export default function App() {
	const { sessionToken } = React.useContext(UserContext);

	return (
		<div className="app">
			<BrowserRouter>
				{/* We only show the navbar options if there is a user logged in. */}
				{/* Create an overview page later under the login so new users can see what they can do with the website. */}
				<Navbar />
				<div className="body">
					<Routes>
						{!sessionToken ? (
							<>
								<Route path="/signUp" element={<SignUp />} />
								<Route path="*" element={<Login />} />
							</>
						) : (
							<>
								<Route path="/" element={<Overview />} />
								<Route path="/plan" element={<Plan />} />
								<Route path="/history" element={<History />} />
							</>
						)}
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

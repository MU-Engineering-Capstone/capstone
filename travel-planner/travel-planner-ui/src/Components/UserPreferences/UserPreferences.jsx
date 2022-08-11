import "./UserPreferences.css";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { PORT } from "./../App/App";
import { UserContext } from "../../UserContext";
import Loading from "../Loading/Loading";
import { DualSlider, NormSlider, WeightSlider } from "../Slider/Slider";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

export default function UserPreferences() {
	const [expanded, setExpanded] = useState(false);
	const [preferences, setPreferences] = useState(null);
	const { sessionToken } = useContext(UserContext);
	const [isCustomize, setIsCustomize] = useState(false);

	useEffect(() => {
		const fetchPreferences = async () => {
			const res = await axios.post(
				`http://localhost:${PORT}/users/getPreferences`,
				{
					sessionToken: sessionToken,
				}
			);

			setPreferences(res.data.userPreferences);
		};
		fetchPreferences();
	}, []);

	const savePreferences = async () => {
		const res = await axios.post(
			`http://localhost:${PORT}/users/savePreferences`,
			{
				userPreferences: preferences,
			}
		);
	};

	if (!preferences) {
		return <Loading />;
	}

	return (
		<div id="user-preferences-page">
			<h1>User Preferences</h1>
			<div className="preferences-body">
				<div className="preferences-weights">
					<h3>Weight Settings</h3>
					<WeightSlider
						name="Duration"
						value={preferences.Weight.duration}
						setValue={(value) => {
							setPreferences((prev) => ({
								...prev,
								Weight: { ...prev.Weight, duration: value },
							}));
						}}
					/>
					<WeightSlider
						name="Walkability"
						value={preferences.Weight.walkability}
						setValue={(value) => {
							setPreferences((prev) => ({
								...prev,
								Weight: { ...prev.Weight, walkability: value },
							}));
						}}
					/>
					<WeightSlider
						name="Temperature"
						value={preferences.Weight.temp}
						setValue={(value) => {
							setPreferences((prev) => ({
								...prev,
								Weight: { ...prev.Weight, temp: value },
							}));
						}}
					/>
					<WeightSlider
						name="Humidity"
						value={preferences.Weight.humidity}
						setValue={(value) => {
							setPreferences((prev) => ({
								...prev,
								Weight: { ...prev.Weight, humidity: value },
							}));
						}}
					/>
					<WeightSlider
						name="Wind Speed"
						value={preferences.Weight.wind}
						setValue={(value) => {
							setPreferences((prev) => ({
								...prev,
								Weight: { ...prev.Weight, wind: value },
							}));
						}}
					/>
				</div>
				<div className="preferences-percentages">
					<h3 onDoubleClick={() => setIsCustomize((prev) => !prev)}>
						Customize preferences
					</h3>
					{isCustomize && (
						<>
							{" "}
							<NormSlider
								id="duration-preferences-slider"
								name="Max walking time"
								range={{ min: "1", max: "180" }}
								value={preferences.MaxDuration}
								setValue={(value) => {
									setPreferences((prev) => ({
										...prev,
										MaxDuration: value,
									}));
								}}
								unit="minutes"
							/>
							<NormSlider
								id="walkability-preferences-slider"
								name="Minimum walkability score"
								range={{ min: "0", max: "100" }}
								value={preferences.MinWalkability}
								setValue={(value) => {
									setPreferences((prev) => ({
										...prev,
										MinWalkability: value,
									}));
								}}
								unit=""
							/>
							<DualSlider
								setValue={(value) => {
									setPreferences((prev) => ({
										...prev,
										TempRange: { min: value[0], max: value[1] },
									}));
								}}
								value={[preferences.TempRange.min, preferences.TempRange.max]}
								min={0}
								max={115}
								name="Temperature range"
							/>
							<NormSlider
								id="humidity-preference-slider"
								name="Max humidity"
								range={{ min: "1", max: "100" }}
								unit={"%"}
								value={preferences.HumidityMax}
								setValue={(value) => {
									setPreferences((prev) => ({
										...prev,
										HumidityMax: value,
									}));
								}}
							/>
							<NormSlider
								id="wind-preference-slider"
								name="Max wind speed"
								range={{ min: "0", max: "40" }}
								unit="mph"
								value={preferences.WindMax}
								setValue={(value) => {
									setPreferences((prev) => ({
										...prev,
										WindMax: value,
									}));
								}}
							/>
							<ToggleSwitch name="Prefer daylight?" />
							<ToggleSwitch name="Prefer walking?" />
						</>
					)}
				</div>
			</div>
			<span>
				<button
					className="save-preferences-button"
					onClick={() => savePreferences()}
				>
					Save
				</button>
			</span>
		</div>
	);
}

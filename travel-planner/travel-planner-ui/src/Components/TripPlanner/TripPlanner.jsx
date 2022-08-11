import "./TripPlanner.css";

import Notes from "../Notes/Notes";
import Timeline from "../Timeline/Timeline";
import Maps from "../Maps/Maps";
import SelectDirections from "../SelectDirections/SelectDirections";
import Banner from "../Banner/Banner";
import axios from "axios";
import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../../UserContext";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { PORT } from "./../App/App";

const API_KEY = "AIzaSyDUuAbmaWWY2Lk6iKlktVEPRAIrTI0__eg";

export default function Plan({ tripDetails }) {
	const [directionsMode, setDirectionsMode] = useState(false);
	const [directionsResults, setDirectionsResults] = useState(null);
	const [walkingResults, setWalkingResults] = useState(null);
	const [drivingResults, setDrivingResults] = useState(null);
	const previousVals = useRef({ walkingResults, drivingResults });
	const [directionsPoint, setDirectionsPoint] = useState({
		origin: "",
		destination: "",
	});
	const [directionMarkers, setDirectionMarkers] = useState([]);
	const { sessionToken } = useContext(UserContext);
	const [markers, setMarkers] = useState(null);
	const [updateMarkers, setUpdateMarkers] = useState(false);
	const [timelineItems, setTimelineItems] = useState(null);
	const [timeline, setTimeline] = useState(null);
	const [timelineMarkers, setTimelineMarkers] = useState(null);
	const [isGetTimelineDirections, setIsGetTimelineDirections] = useState(false);
	const [timelineDirections, setTimelineDirections] = useState(null);
	const [directions, setDirections] = useState([]);

	// get the markers
	useEffect(() => {
		if (tripDetails) {
			const fetchMarkers = async () => {
				try {
					const res = await axios.post(
						`http://localhost:${PORT}/maps/getMarkers`,
						{
							mapId: tripDetails.objectId,
						}
					);
					setMarkers(res.data.markers);
					setUpdateMarkers(false);
				} catch (error) {
					console.log("Error fetching markers in UI: ", error);
				}
			};

			fetchMarkers();
		}
	}, [tripDetails, updateMarkers]);

	useEffect(() => {
		// fetch directions for the mapId

		if (tripDetails) {
			const fetchSavedDirections = async () => {
				const res = await axios.post(
					`http://localhost:${PORT}/maps/getAllSavedDirections`,
					{
						mapId: tripDetails.objectId,
					}
				);

				setDirections(res.data);
			};

			fetchSavedDirections().catch(console.error);
		}
	}, [tripDetails]);

	useEffect(() => {
		const fetchRecommendations = async () => {
			if (
				previousVals.current.drivingResults != drivingResults &&
				previousVals.current.walkingResults != walkingResults
			) {
				previousVals.current = { walkingResults, drivingResults };
				if (walkingResults === "") {
					setDirectionsResults({
						result: drivingResults,
						type: "DRIVING",
						reason: "The distance is beyond walking capabilities.",
					});
					return;
				}
				if (walkingResults && drivingResults) {
					const result = await axios.post(
						`http://localhost:${PORT}/recommendations`,
						{
							location: directionMarkers[0],
							walkingDuration: walkingResults.duration,
							drivingDuration: drivingResults.duration,
							sessionToken: sessionToken,
						}
					);

					if (result.data.type === "DRIVING") {
						setDirectionsResults({
							result: drivingResults,
							type: "DRIVING",
							reason: result.data.reason,
						});
					} else if (result.data.type === "WALKING") {
						setDirectionsResults({
							result: walkingResults,
							type: "WALKING",
							reason: result.data.reason,
						});
					} else {
						console.log(
							"ERROR: invalid travel mode specified: ",
							result.data.type
						);
					}
				}
			}
		};
		fetchRecommendations();
	}, [walkingResults, drivingResults]);

	const getDirections = async () => {
		var directions = [];
		let newEle = document.createElement("div");

		directionsResults.result.steps.forEach((step) => {
			newEle.innerHTML = step.instructions;

			directions.push(newEle.innerText);
		});

		const res = await axios.post(
			`http://localhost:${PORT}/maps/createMapDirections`,
			{
				type: directionsResults.type,
				duration: directionsResults.result.duration,
				distance: directionsResults.result.distance,
				directions: directions,
				origin: {
					name: directionsPoint.origin,
					address: directionsResults.result.start_address,
					coordinate: directionMarkers[0],
				},
				destination: {
					name: directionsPoint.destination,
					address: directionsResults.result.end_address,
					coordinate: directionMarkers[1],
				},
				mapId: tripDetails.objectId,
				reason: directionsResults.reason,
			}
		);

		setDirections((prev) => [...prev, res.data.direction]);
		setDirectionsResults(null);
		setDrivingResults(null);
		setWalkingResults(null);
		setDirectionsPoint({ origin: "", destination: "" });
	};

	const [curNote, setCurNote] = useState({
		title: "Note",
		text: "",
		markerId: null,
	});

	const archiveTrip = async () => {
		axios.post(`http://localhost:${PORT}/maps/archiveMap`, {
			mapId: tripDetails.objectId,
		});
	};

	const render = () => {
		return <h1>Not working</h1>;
	};

	return (
		<div className="trip-plan-page">
			<Banner
				text={tripDetails.MapName}
				imgSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dHJvcGljYWwlMjBiZWFjaHxlbnwwfHwwfHw%3D&w=1000&q=80"
			/>
			<div className="main-page">
				<div className="left-app">
					<Wrapper apiKey={API_KEY} render={render}>
						<div id="map">
							<Maps
								setCurNote={setCurNote}
								trip={tripDetails}
								directionsMode={directionsMode}
								directionMarkers={directionMarkers}
								setDirectionMarkers={setDirectionMarkers}
								setDrivingResults={setDrivingResults}
								setWalkingResults={setWalkingResults}
								displayedMarkers={markers}
								setUpdate={setUpdateMarkers}
								setTimelineItems={setTimelineItems}
								timeline={timeline}
								setTimelineMarkers={setTimelineMarkers}
								timelineMarkers={timelineMarkers}
								isGetTimelineDirections={isGetTimelineDirections}
								setIsGetTimelineDirections={setIsGetTimelineDirections}
								setTimelineDirections={setTimelineDirections}
							/>
						</div>
					</Wrapper>
					<div className="map-settings-panel">
						<div className="previous-directions-container">
							<button
								className="directions-mode-button"
								onClick={() => {
									setDirectionsMode(directionsMode ? false : true);
								}}
							>
								<span>Directions Mode</span>{" "}
								<span
									className={
										directionsMode
											? "directions-mode-toggle directions-mode-toggle-on"
											: "directions-mode-toggle"
									}
								>
									{directionsMode ? "ON" : "OFF"}
								</span>
							</button>
							{directionsResults ? (
								<div className="save-directions-box">
									<input
										placeholder="Origin"
										value={directionsPoint.origin}
										onChange={(event) => {
											const value = event.currentTarget.value;
											setDirectionsPoint((prev) => ({
												...prev,
												origin: value,
											}));
										}}
									/>
									<input
										placeholder="Destination"
										value={directionsPoint.destination}
										onChange={(event) => {
											const value = event.currentTarget.value;
											setDirectionsPoint((prev) => ({
												...prev,
												destination: value,
											}));
										}}
									/>
									<button onClick={getDirections}>Save directions</button>
								</div>
							) : null}
						</div>
						<div className="archive-button" onClick={() => archiveTrip()}>
							<p>Archive</p>
							<i className="fa-solid fa-box-archive"></i>
						</div>
					</div>
					<SelectDirections directions={directions} />
				</div>
				<div className="right-app">
					<Notes curNote={curNote} />
					<Timeline
						mapId={tripDetails.objectId}
						setMarkers={setMarkers}
						timelineItems={timelineItems}
						setTimelineItems={setTimelineItems}
						timeline={timeline}
						setTimeline={setTimeline}
						timelineMarkers={timelineMarkers}
						setTimelineMarkers={setTimelineMarkers}
						getTimelineDirections={setIsGetTimelineDirections}
						timelineDirections={timelineDirections}
					/>
				</div>
				<div className="directions-content"></div>
			</div>
		</div>
	);
}

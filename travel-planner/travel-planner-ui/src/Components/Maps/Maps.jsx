import "./Maps.css";
import Marker from "../Marker/Marker";
import { PORT } from "./../App/App";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Maps({
	setCurNote,
	trip,
	directionsMode,
	setDrivingResults,
	setWalkingResults,
	directionMarkers,
	setDirectionMarkers,
	displayedMarkers,
	setUpdate,
	setTimelineItems,
	timeline,
	setTimelineMarkers,
	timelineMarkers,
	isGetTimelineDirections,
	setIsGetTimelineDirections,
	setTimelineDirections,
}) {
	const ref = useRef(null);
	const [map, setMap] = useState();
	const [address, setAddress] = useState("");
	const [allMapMarkers, setAllMapMarkers] = useState([]);
	const [directionsRenderer, setDirectionsRenderer] = useState(
		new google.maps.DirectionsRenderer()
	);

	const mapInit = () => {
		useEffect(() => {
			if (ref.current && !map) {
				setMap(
					new window.google.maps.Map(ref.current, {
						center: { lat: trip.Center.latitude, lng: trip.Center.longitude }, // position by default (shows the center of the map) 30, 0
						zoom: 12,
						disableDoubleClickZoom: true,
					})
				);
			}
		}, [ref, map]);

		const image =
			"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"; // test image of a flag so we can see where the pin is!

		useEffect(() => {
			if (map) {
				let mapClickerListener = google.maps.event.addListener(
					map,
					"click",
					(mapsMouseEvent) => {
						if (directionsMode) {
							setDirectionMarkers((prev) => [
								...prev,
								{
									lat: mapsMouseEvent.latLng.lat(),
									lng: mapsMouseEvent.latLng.lng(),
								},
							]);
						}
					}
				);

				if (!directionsMode) {
					setDirectionMarkers([]);

					directionsRenderer.setMap(null);
				}

				return () => {
					google.maps.event.removeListener(mapClickerListener);
				};
			}
		}, [directionsMode]);

		useEffect(() => {
			// This section displays the directions.
			if (directionMarkers.length == 2) {
				var directionsService = new google.maps.DirectionsService();

				var request = {
					origin: directionMarkers[0],
					destination: directionMarkers[1],
					travelMode: "DRIVING",
				};

				directionsService.route(request, (result, status) => {
					// send the request to get the directions
					if (status === "OK") {
						// Draw the directions on the map
						directionsRenderer.setDirections(result);

						const routeResult = result.routes[0].legs[0];
						setDrivingResults(routeResult);
						// 3. If distance < 2 miles... reroute with travelMode: 'WALKING' and then run the algorithm to see what's a better transportation option.
						if (routeResult.distance.value <= 3220) {
							// distance.value is always in meters (2 miles ~ 3220 meters)
							request.travelMode = "WALKING";

							directionsService.route(request, (walkResult, walkStatus) => {
								if (walkStatus === "OK") {
									setWalkingResults(walkResult.routes[0].legs[0]);
								} else {
									setWalkingResults("");
								}
							});
						} else {
							setWalkingResults("");
						}
					} else {
						alert("No routes possible. Please try a different location.");
					}
				});

				directionsRenderer.setMap(map);
			}
		}, [directionMarkers]);

		useEffect(() => {
			// Update what makers are shown

			if (displayedMarkers) {
				// if the current markers to be displayed matches
				allMapMarkers.forEach((marker) => {
					for (let i = 0; i < displayedMarkers.length; i++) {
						if (marker.objectId === displayedMarkers[i].objectId) {
							marker.setMap(map);
							break;
						} else if (marker.map) {
							marker.setMap(null);
						}
					}
				});
			} else if (allMapMarkers.length > 0) {
				// this means the markers have already been fetched and no filters are set.
				allMapMarkers.forEach((marker) => {
					marker.setMap(map);
				});
			}
		}, [displayedMarkers]);

		useEffect(() => {
			if (isGetTimelineDirections) {
				// get the directions for all the markers and render them on the map
				let directionsService = new google.maps.DirectionsService();
				let waypoints = [];

				// get all waypoints (timeline stops)
				timelineMarkers
					.slice(1, timelineMarkers.length - 1)
					.forEach((marker) => {
						waypoints.push({
							location: {
								lat: marker.Location.latitude,
								lng: marker.Location.longitude,
							},
							stopover: true,
						});
					});

				const request = {
					origin: {
						lat: timelineMarkers[0].Location.latitude,
						lng: timelineMarkers[0].Location.longitude,
					},
					destination: {
						lat: timelineMarkers[timelineMarkers.length - 1].Location.latitude,
						lng: timelineMarkers[timelineMarkers.length - 1].Location.longitude,
					},
					travelMode: "DRIVING",
					waypoints: waypoints,
				};

				directionsService.route(request, (result, status) => {
					if (status === "OK") {
						directionsRenderer.setDirections(result);
						directionsRenderer.setMap(map);
						setTimelineDirections(result.routes[0]);
					}
				});
				setIsGetTimelineDirections(false);
			}
		}, [isGetTimelineDirections]);

		return (
			<div
				id="displayed-map"
				ref={ref}
				style={{ flexGrow: "1", height: "100%" }}
			>
				{displayedMarkers &&
					displayedMarkers.map((marker) => (
						<Marker
							position={{
								lat: marker.Location.latitude,
								lng: marker.Location.longitude,
							}}
							title={marker.Name}
							icon={image}
							map={map}
							key={marker.objectId}
							objectId={marker.objectId}
							address={marker.Address}
							content={marker.Content}
							setCurNote={setCurNote}
							directionsMode={directionsMode}
							directionMarkers={directionMarkers}
							setDirectionMarkers={setDirectionMarkers}
							setAllMapMarkers={setAllMapMarkers}
							setTimelineItems={setTimelineItems}
							timeline={timeline}
							setTimelineMarkers={setTimelineMarkers}
						/>
					))}
			</div>
		);
	};

	const addNewMarker = async () => {
		// we really will need to get error checking

		// 1. reformat address so it can be passed to the api
		// Don't think this api needs it
		// 2. user axios post request address: address
		// Can we combine this into one post request please?
		const addressRes = await axios.post(
			`http://localhost:${PORT}/maps/getAddress`,
			{
				address: address,
			}
		);
		const location = addressRes.data.coordinates;
		const reformattedAddress = addressRes.data.address;

		// 3. call addMarker
		await axios.post(`http://localhost:${PORT}/maps/createNewMarker`, {
			mapId: trip.objectId,
			location: location,
			address: reformattedAddress,
		});
		// 4. update setMarker
		// 5. marker should be added to the map without rerendering
		setUpdate(true);

		return null;
	};

	return (
		<div className="maps-container">
			<div className="maps-search">
				<input
					onChange={(event) => setAddress(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							addNewMarker();
						}
					}}
					value={address}
					placeholder="Search"
				></input>
			</div>

			{mapInit()}
		</div>
	);
}

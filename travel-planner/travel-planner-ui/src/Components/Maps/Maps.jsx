import "./Maps.css";
import Marker from "../Marker/Marker";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Maps({
	setCurNote,
	trip,
	PORT,
	directionsMode,
	setDirectionsResults,
	directionMarkers,
	setDirectionMarkers,
}) {
	const ref = useRef(null);
	const [map, setMap] = useState();
	const [markers, setMarkers] = useState(null);
	const [address, setAddress] = useState("");
	const [update, setUpdate] = useState(false);
	const [directionsRenderer, setDirectionsRenderer] = useState(
		new google.maps.DirectionsRenderer()
	);

	const mapInit = () => {
		useEffect(() => {
			console.log("Map rerendered!");
			if (ref.current && !map) {
				setMap(
					new window.google.maps.Map(ref.current, {
						center: { lat: trip.Center.latitude, lng: trip.Center.longitude }, // position by default (shows the center of the map) 30, 0
						zoom: 3,
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
						// map.panTo(event.latLng)

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

		// get the markers
		useEffect(async () => {
			try {
				const res = await axios.post(
					`http://localhost:${PORT}/maps/getMarkers`,
					{
						mapId: trip.objectId,
					}
				);
				setMarkers(res.data.markers);
				setUpdate(false);
			} catch (error) {
				console.log("Error fetching markers in UI: ", error);
			}
		}, [update]);

		useEffect(() => {
			// This section displays the directions.
			if (directionMarkers.length == 2) {
				var directionsService = new google.maps.DirectionsService();
				// var directionsRenderer = new google.maps.DirectionsRenderer();

				var request = {
					origin: directionMarkers[0],
					destination: directionMarkers[1],
					travelMode: "DRIVING",
				};

				directionsService.route(request, (result, status) => {
					// send the request to get the directions
					console.log("Request: ", request);
					if (status === "OK") {
						console.log("Result: ", result);
						// Draw the directions on the map
						directionsRenderer.setDirections(result);

						// Save this in a state variable to display the html instructions, distance, and duration
						setDirectionsResults(result);
						// 3. If distance < 3 miles... reroute with travelMode: 'WALKING' and then run the algorithm to see what's a better transportation option.
						// Then compare with Driving stuff. Right now we can just go with driving.
					}
				});

				directionsRenderer.setMap(map);
			}
		}, [directionMarkers]);

		return (
			<div
				id="displayed-map"
				ref={ref}
				style={{ flexGrow: "1", height: "100%" }}
			>
				{markers &&
					markers.map((marker) => (
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
							PORT={PORT}
							setCurNote={setCurNote}
							directionsMode={directionsMode}
							directionMarkers={directionMarkers}
							setDirectionMarkers={setDirectionMarkers}
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

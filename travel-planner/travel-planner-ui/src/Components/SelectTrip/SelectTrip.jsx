import "./SelectTrip.css";
import { PORT } from "./../App/App";
import { UserContext } from "../../UserContext";
import Loading from "../Loading/Loading";
import Banner from "../Banner/Banner";
import { useEffect, useContext, useState } from "react";
import axios from "axios";

export default function SelectTrip({
	setTripDetails,
	isArchived,
	title,
	onEnter,
}) {
	const { sessionToken } = useContext(UserContext);
	const [trips, setTrips] = useState({
		term: "",
		filteredTrips: [],
		allTrips: null,
	});

	// Get archived trips from database
	useEffect(async () => {
		const res = await axios.post(`http://localhost:${PORT}/maps/getUserMaps`, {
			sessionToken: sessionToken,
			isArchived: isArchived,
		});

		setTrips((prev) => ({
			...prev,
			allTrips: res.data,
			filteredTrips: res.data,
		}));
	}, []);

	if (!trips.allTrips) {
		return <Loading />;
	}

	const onClickTripName = (event) => {
		const tripId = event.currentTarget.getAttribute("data-objectid");

		trips.allTrips.forEach((trip) => {
			if (trip.objectId === tripId) {
				setTripDetails(trip);
			}
		});
	};

	const updateFilteredTrips = (newSearchTerm) => {
		let filteredTrips = [];

		if (newSearchTerm !== "") {
			trips.allTrips.forEach((trip) => {
				if (trip.MapName.toLowerCase().includes(newSearchTerm.toLowerCase())) {
					filteredTrips.push(trip);
				}
			});
		} else {
			filteredTrips = trips.allTrips;
		}

		setTrips((prev) => ({
			...prev,
			term: newSearchTerm,
			filteredTrips: filteredTrips,
		}));
	};

	return (
		<div className="select-trip-page">
			<div className="select-trip-page-top">
				<h1>{title}</h1>
				<div className="trip-search">
					<input
						onChange={(event) => updateFilteredTrips(event.target.value)}
						onKeyDown={
							onEnter
								? (event) => {
										if (event.key === "Enter") {
											onEnter(trips.term);
										}
								  }
								: null
						}
						value={trips.term}
						placeholder="Search..."
					></input>
				</div>
			</div>
			{trips.allTrips.length === 0 && <h2>No trips found.</h2>}

			{trips.filteredTrips.map((trip) => (
				<div
					key={trip.mapName}
					data-objectid={trip.objectId}
					onClick={onClickTripName}
					className="trip-option"
				>
					<Banner
						text={trip.MapName}
						cursorStyle={"pointer"}
						imgSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dHJvcGljYWwlMjBiZWFjaHxlbnwwfHwwfHw%3D&w=1000&q=80"
					/>
				</div>
			))}
		</div>
	);
}

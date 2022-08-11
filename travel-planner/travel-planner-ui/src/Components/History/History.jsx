import "./History.css";
import TripPlanner from "./../TripPlanner/TripPlanner";
import SelectTrip from "../SelectTrip/SelectTrip";
import { useState } from "react";

export default function History(props) {
	const [tripDetails, setTripDetails] = useState(null);

	return (
		<div className="history-page">
			{tripDetails ? (
				<TripPlanner tripDetails={tripDetails} />
			) : (
				<SelectTrip
					setTripDetails={setTripDetails}
					isArchived={true}
					title="Archived Trips"
				/>
			)}
		</div>
	);
}

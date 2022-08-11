import "./Plan.css";
import SelectTrip from "../SelectTrip/SelectTrip";
import CreateTrip from "../CreateTrip/CreateTrip";
import TripPlanner from "../TripPlanner/TripPlanner";
import { useState } from "react";

export default function Plan() {
	const [tripDetails, setTripDetails] = useState(null);
	const [newTripTitle, setNewTripTitle] = useState("");

	return (
		<div className="plan-page">
			{!tripDetails ? (
				<>
					{newTripTitle != "" && (
						<CreateTrip
							tripTitle={newTripTitle}
							setFinalTripDetails={setTripDetails}
						/>
					)}

					<SelectTrip
						setTripDetails={setTripDetails}
						isArchived={false}
						title="Current Trips"
						onEnter={(searchTerm) => setNewTripTitle(searchTerm)}
					/>
				</>
			) : (
				<TripPlanner tripDetails={tripDetails} />
			)}
		</div>
	);
}

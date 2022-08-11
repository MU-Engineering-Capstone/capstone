import "./TimelineItem.css";
import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import Draggable from "react-draggable";
import { PORT } from "./../../App/App";

export default function TimelineItem(props) {
	const [duration, setDuration] = useState(5);
	const [startTime, setStartTime] = useState(props.startTime);
	const [endTime, setEndTime] = useState(props.endTime);

	useEffect(() => {
		updateDuration();
	}, []);

	const saveTimesInDatabase = () => {
		updateDuration();
		axios.post(`http://localhost:${PORT}/timelines/saveEvent`, {
			startTime: startTime,
			endTime: endTime,
			itemId: props.objectId,
		});
	};

	const updateDuration = () => {
		const start = moment(
			String(startTime.hour) + ":" + String(startTime.min),
			"hh:mm"
		);
		const end = moment(
			String(endTime.hour) + ":" + String(endTime.min),
			"hh:mm"
		);
		const timeDiff = Math.abs(start.diff(end, "minutes"));

		setDuration(timeDiff);
	};

	const formatMinutes = (minutes) => {
		const hour = Math.floor(minutes / 60);
		const min = minutes % 60;

		return String(hour) + " hour(s) " + String(min) + " minutes";
	};

	return (
		<Draggable axis="y" bounds="parent">
			{/* 24 hours = 1440 minutes */}
			<div className="timeline-item" style={{ flex: (duration / 1440) * 2 }}>
				<div className="timeline-item-top">
					<h3 className="timeline-item-title">{props.name}</h3>
					<i
						className="fa-solid fa-trash-can"
						onClick={() => props.deleteItem(props.objectId)}
					></i>
				</div>
				<div className="timeline-item-duration-container">
					<p className="timeline-item-duration">{formatMinutes(duration)}</p>
					<div className="timeline-item-time-container">
						<input
							className="timeline-item-start-hour"
							value={startTime.hour}
							onChange={(event) =>
								setStartTime({
									hour: event.currentTarget.value,
									min: startTime.min,
								})
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") saveTimesInDatabase();
							}}
						></input>
						<p> : </p>
						<input
							className="timeline-item-start-minutes"
							value={startTime.min}
							onChange={(event) =>
								setStartTime({
									hour: startTime.hour,
									min: event.currentTarget.value,
								})
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") saveTimesInDatabase();
							}}
						></input>
						<p>
							<b> - </b>
						</p>
						<input
							className="timeline-item-end-hour"
							value={endTime.hour}
							onChange={(event) =>
								setEndTime({
									hour: event.currentTarget.value,
									min: endTime.min,
								})
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") saveTimesInDatabase();
							}}
						></input>
						<p> : </p>
						<input
							className="timeline-item-end-minutes"
							value={endTime.min}
							onChange={(event) =>
								setEndTime({
									hour: endTime.hour,
									min: event.currentTarget.value,
								})
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") saveTimesInDatabase();
							}}
						></input>
					</div>
				</div>
			</div>
		</Draggable>
	);
}

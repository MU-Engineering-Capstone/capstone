import "./Timeline.css";
import TimelineItem from "./TimelineItem/TimelineItem";
import Loading from "../Loading/Loading";
import SelectTimelineBubble from "./SelectTimeline/SelectTimeline";
import Directions from "./Directions/Directions";
import { useState, useEffect, useRef } from "react";
import ReactToPrint from "react-to-print";
import axios from "axios";
import { PORT } from "./../App/App";

export default function Timeline(props) {
	const [possibleTimelines, setPossibleTimelines] = useState(null);
	const [isExpanded, setIsExpanded] = useState(false);
	let componentRef = useRef();

	const deleteItem = async (itemToDeleteId) => {
		//remove on backend
		const res = await axios.post(
			`http://localhost:${PORT}/timelines/deleteEvent`,
			{
				itemId: itemToDeleteId,
			}
		);

		// remove on front-end
		if (res.status === 200) {
			props.setTimelineItems((prev) =>
				prev.filter((item) => {
					return item.objectId !== itemToDeleteId;
				})
			);
		}
	};

	useEffect(() => {
		if (props.timeline) {
			const fetchTimeline = async () => {
				const res = await axios.post(
					`http://localhost:${PORT}/timelines/getTimelineDetails`,
					{
						timelineId: props.timeline.objectId,
					}
				);
				props.setTimelineItems(res.data.timelineItems);

				// get all the markers associated with those items
				props.setTimelineMarkers(res.data.markers);
			};

			fetchTimeline();
		}
	}, [props.timeline]);

	useEffect(() => {
		const fetchAssociatedTimelines = async () => {
			const res = await axios.post(
				`http://localhost:${PORT}/timelines/getAssociatedTimelines`,
				{
					mapId: props.mapId,
				}
			);
			setPossibleTimelines(res.data.timelines);
		};

		fetchAssociatedTimelines();
	}, []);

	if (!possibleTimelines) {
		return <Loading />;
	}

	let i = -1; // use this to increment the index of directions array when rendering.

	return (
		<div
			className="timeline-container"
			style={{
				height: isExpanded ? "84vh" : "6vh",
				overflowY: isExpanded ? "scroll" : "hidden",
			}}
		>
			<h2
				onDoubleClick={() => {
					setIsExpanded((prev) => !prev);
				}}
			>
				Timeline
			</h2>
			{isExpanded && (
				<>
					<SelectTimelineBubble
						timelines={possibleTimelines}
						setTimeline={props.setTimeline}
						timelineMarkers={props.timelineMarkers}
						setDisplayedMarkers={props.setMarkers}
						mapId={props.mapId}
						setPossibleTimelines={setPossibleTimelines}
					/>
					<hr></hr>
				</>
			)}
			{props.timelineItems && (
				<>
					<div
						className="printable-timeline"
						ref={(ele) => (componentRef = ele)}
					>
						<p>{props.timeline.Date}</p>
						<div className="timeline-markers">
							{props.timelineItems.map((item) => {
								i++;
								return (
									<>
										<TimelineItem
											name={item.Name}
											startTime={item.StartTime}
											endTime={item.EndTime}
											objectId={item.objectId}
											key={item.objectId}
											deleteItem={deleteItem}
										/>
										{props.timelineDirections &&
											i <= props.timelineDirections.legs.length - 1 && (
												<Directions
													directions={props.timelineDirections.legs[i]}
													key={item.objectId}
												/>
											)}
									</>
								);
							})}
						</div>
					</div>
					<div className="timeline-buttons">
						<button onClick={() => props.getTimelineDirections(true)}>
							Get directions
						</button>
						<ReactToPrint
							trigger={() => <button>Print</button>}
							content={() => componentRef}
						/>
					</div>
				</>
			)}
		</div>
	);
}

import "./Marker.css";
import { useEffect } from "react";
import { render } from "react-dom";
import Content from "./Content";

export default function Marker(props) {
	class InfoWindow extends google.maps.OverlayView {
		constructor(position) {
			super();

			this.position = position;
			this.new = true;

			const content = (
				<Content
					infoWindow={this}
					markerId={props.objectId}
					title={props.title}
					address={props.address}
					noteContent={props.content}
					PORT={props.PORT}
					setCurNote={props.setCurNote}
				/>
			);

			// Create the little arrow beneath the content.
			const bubbleAnchor = <div className="popup-bubble-anchor">{content}</div>;

			// Hold the content in a HTML node container to work with the Google Maps Javascript API
			this.containerDiv = document.createElement("div");
			this.containerDiv.classList.add("popup-container");
			this.containerDiv.style.display = "none";

			render(bubbleAnchor, this.containerDiv);
		}

		onAdd() {
			// This function is automatically called when the popup is added to the map
			if (this.new) {
				this.new = false;
			} else {
				this.getPanes().floatPane.appendChild(this.containerDiv);
			}
		}

		onRemove(newThis = this) {
			// Automatically called when popup is removed from the map

			if (newThis.containerDiv.parentElement) {
				newThis.containerDiv.parentElement.removeChild(newThis.containerDiv);
			}
		}

		draw() {
			// Called each frame when the popup needs to draw itself

			const newDivPosition = this.getProjection().fromLatLngToDivPixel(
				this.position
			);

			// Hide the popup when it is out of view
			const display =
				Math.abs(newDivPosition.x) < 4000 && Math.abs(newDivPosition.y) < 4000
					? "block"
					: "none";

			if (display === "block") {
				this.containerDiv.style.left = newDivPosition.x + "px";
				this.containerDiv.style.top = newDivPosition.y + "px";
			}

			if (this.containerDiv.style.display !== display) {
				this.containerDiv.style.display = display;
			}
		}
	}

	useEffect(() => {
		const marker = new google.maps.Marker(props);

		const popup = new InfoWindow(props.position);
		popup.setMap(props.map);
		popup.onRemove();

		marker.addListener("click", () => {
			popup.onAdd();
		});

		return () => {
			marker.setMap(null);
		};
	}, []);

	return null;
}

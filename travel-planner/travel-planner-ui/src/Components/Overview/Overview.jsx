import "./Overview.css";
import UserPreferences from "../UserPreferences/UserPreferences";
import Banner from "../Banner/Banner";

export default function Overview() {
	return (
		<div className="overview">
			<Banner
				text="Welcome!"
				imgSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dHJvcGljYWwlMjBiZWFjaHxlbnwwfHwwfHw%3D&w=1000&q=80"
			/>
			<UserPreferences />
		</div>
	);
}

import Form from "react-bootstrap/Form";
import { forwardRef, Children, useState } from "react";

const CustomMenu = forwardRef(
	(
		{ children, style, className, "aria-labelledby": labeledBy, onKeyDown },
		ref
	) => {
		const [value, setValue] = useState("");

		return (
			<div
				ref={ref}
				style={style}
				className={className}
				aria-labelledby={labeledBy}
			>
				<Form.Control
					autoFocus
					className="mx-3 my-2 w-auto"
					placeholder="Type to filter..."
					onChange={(e) => setValue(e.target.value)}
					value={value}
					onKeyDown={onKeyDown ? onKeyDown : null}
				/>
				<ul className="list-unstyled">
					{Children.toArray(children).filter(
						(child) =>
							!value ||
							child.props.children.toLowerCase().includes(value.toLowerCase())
					)}
				</ul>
			</div>
		);
	}
);

export default CustomMenu;

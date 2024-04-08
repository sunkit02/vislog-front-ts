import type { Accessor, JSXElement } from "solid-js";

/**
 * Curved arrow for nodes in a `DoubleCoursesList`
 */
function DoubleListCurvedArrow(props: {
	id: string;
	x1: number;
	y1: number;
	curveStartX: number;
	curveStartY: number;
	x2: number;
	y2: number;
	strokeWidth?: number;
	showCurveLines?: boolean;
	highlight?: Accessor<boolean>;
	doubleListSide: "left" | "right";
}): JSXElement {
	const mid = {
		x: props.curveStartX,
		y: props.y2,
	};

	const curveDemoLines = (
		<>
			<line
				x1={props.curveStartX}
				y1={props.curveStartY}
				x2={mid.x}
				y2={mid.y}
				stroke="blue"
				stroke-dasharray="5,5"
			/>
			<circle cx={mid.x} cy={mid.y} r="2" fill="blue" />
			<line
				x1={mid.x}
				y1={mid.y}
				x2={props.x2}
				y2={props.y2}
				stroke="blue"
				stroke-dasharray="5,5"
			/>
		</>
	);

	// Height of the triangle acting as pointer at the end of the arrow
	// TODO: Make triangle point horizontally according to the `props.doubleListSide`
	const tipWidth = 8;
	const directives = `M ${props.x1} ${props.y1} L ${props.curveStartX} ${
		props.curveStartY
	}
Q ${mid.x} ${mid.y} ${
		props.x2 + (props.doubleListSide === "left" ? tipWidth : -tipWidth)
	} ${props.y2}`;

	const triangle = {
		p1: { x: props.x2, y: props.y2 },
		p2: {
			x: props.x2 + (props.doubleListSide === "left" ? tipWidth : -tipWidth),
			y: props.y2 - tipWidth / 2,
		},
		p3: {
			x: props.x2 + (props.doubleListSide === "left" ? tipWidth : -tipWidth),
			y: props.y2 + tipWidth / 2,
		},
	};

	const { p1, p2, p3 } = triangle;

	return (
		<>
			{props.showCurveLines === true ? curveDemoLines : null}
			<g
				id={props.id}
				class={`transition ${
					props?.highlight?.()
						? "fill-blue-500 stroke-blue-500"
						: "fill-black stroke-black"
				}`}
			>
				<path
					d={directives}
					fill="none"
					stroke-width={
						props.strokeWidth || 3 * (props?.highlight?.() ? 1.25 : 1)
					}
				/>
				<polygon
					points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
					stroke-width={props?.highlight?.() ? 2 : 1}
				/>
			</g>
			;
		</>
	);
}

export default DoubleListCurvedArrow;

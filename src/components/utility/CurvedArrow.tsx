import { JSXElement } from "solid-js";

function CurvedArrow(props: {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth?: number;
  showCurveLines?: boolean;
}): JSXElement {

  const mid = {
    x: (props.x1 + props.x2) / 2,
    y: (props.y1 + props.y2) / 2,
  };

  const controlPoint1 = {
    x: props.x1,
    y: mid.y,
  };

  const controlPoint2 = {
    x: (mid.x + props.x2) / 2,
    y: props.y2,
  };

  // Height of the triangle acting as pointer at the end of the arrow
  const tipHeight = 8;
  const directives = `M ${props.x1} ${props.y1} Q ${controlPoint1.x} ${controlPoint1.y}, ${mid.x} ${mid.y} T ${props.x2} ${props.y2 - tipHeight}`;

  const curveDemoLines = (
    <>
      <line
        x1={props.x1}
        y1={props.y1}
        x2={controlPoint1.x}
        y2={controlPoint1.y}
        stroke="blue"
        stroke-dasharray="5,5"
      />
      <circle cx={controlPoint1.x} cy={controlPoint1.y} r="2" fill="blue" />
      <line
        x1={controlPoint1.x}
        y1={controlPoint1.y}
        x2={mid.x}
        y2={mid.y}
        stroke="blue"
        stroke-dasharray="5,5"
      />
      <line
        x1={mid.x}
        y1={mid.y}
        x2={controlPoint2.x}
        y2={controlPoint2.y}
        stroke="blue"
        stroke-dasharray="5,5"
      />
      <circle cx={controlPoint2.x} cy={controlPoint2.y} r="2" fill="blue" />
      <line
        x1={controlPoint2.x}
        y1={controlPoint2.y}
        x2={props.x2}
        y2={props.y2}
        stroke="blue"
        stroke-dasharray="5,5"
      />
    </>
  );

  const triangle = {
    p1: {x: props.x2, y: props.y2},
    p2: {x: props.x2 - tipHeight / 2, y: props.y2 - tipHeight},
    p3: {x: props.x2 + tipHeight / 2, y: props.y2 - tipHeight},
  }

  const {p1, p2, p3} = triangle;

  return (
    <>
      {props.showCurveLines === true ? curveDemoLines : null}
      <path
        id={props.id}
        style={{
          transition: "0.25s",
        }}
        class="normal-arrow"
        d={directives}
        fill="none"
        stroke="black"
        stroke-width={props.strokeWidth || 3}
      />
      <polygon
        points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
        fill="black"
        stroke="black"
        stroke-width={1}
      />
      ;
    </>
  );
}

export default CurvedArrow;

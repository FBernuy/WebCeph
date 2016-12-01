import * as React from 'react';

import { pure } from 'recompose';

import uniqueId from 'lodash/uniqueId';
import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';

import {
  Rect,
  isPointInSegment,
  getIntersectionPoint,
  isPointCloserTo,
  isPointWithinRect,
  getSlope,
  calculateAngleBetweenTwoVectors,
} from 'utils/math';

export interface AngleProps {
  boundingRect: Rect;
  vectors: [GeometricalVector, GeometricalVector];
  extendedProps: React.SVGAttributes<SVGLineElement>;
  segmentProps: React.SVGAttributes<SVGLineElement>;
  parallelProps: React.SVGAttributes<SVGLineElement>;
  rest?: React.SVGAttributes<SVGLineElement>;
}

const Angle = pure((props: AngleProps) => {
  const {
    boundingRect,
    vectors,
    segmentProps,
    parallelProps,
    extendedProps,
    rest,
  } = props;
  const [vector1, vector2] = vectors;
  const intersection = getIntersectionPoint(vector1, vector2);
  if (intersection === undefined) {
    // console.info('The two vectors are parallel. No extension.');
    return <g/>;
  }
  const angle1 = Math.atan2(vector1.y2 - vector1.y1, vector1.x2 - vector1.x1);
  const angle2 = angle1 + calculateAngleBetweenTwoVectors(vector1, vector2);

  const Arc = ({ vector1, vector2 }: { vector1: GeometricalVector, vector2: GeometricalVector }) => {
    const i = getIntersectionPoint(vector1, vector2);
    if (i !== undefined) {
      const { x, y } = i;
      const point1 = { x: vector1.x1, y: vector1.y1 };
      const point2 = { x: vector1.x2, y: vector1.y2 };
      const point3 = { x: vector2.x1, y: vector2.y1 };
      const point4 = { x: vector2.x2, y: vector2.y2 };
      const [p1, p2] = reject([
        point1, point2, point3, point4,
      ], p => isEqual(p, i));
      const uid = uniqueId('angle_clip_path_');
      const triangle = {
        points: [p1, i, p2].map(({ x, y }) => `${x},${y}`).join(' '),
      };
      return (
        <g>
          <clipPath id={uid}>
            <polygon {...triangle}/>
          </clipPath>
          <circle {...segmentProps} fill="none" clipPath={`url(#${uid})`} cx={x} cy={y} r={45} />
        </g>
      );
    }
    return <g/>;
  };

  const inSegment1 = isPointInSegment(intersection, vector1);
  const inSegment2 = isPointInSegment(intersection, vector2);
  if (inSegment1 && inSegment2) {
    // console.info('Intersection point belongs to both vectors, no need for extension.');
    return (
      <g>
        <line {...segmentProps} {...rest} {...vector1} />
        <line {...segmentProps} {...rest} {...vector2} />
        <Arc vector1={vector1} vector2={vector2} />
      </g>
    );
  }

  const extendedVector2 = {
    x1: vector2.x1 === intersection.x ? vector2.x2 : vector2.x1,
    y1: vector2.y1 === intersection.y ? vector2.y2 : vector2.y1,
    x2: intersection.x,
    y2: intersection.y,
  };
  if (inSegment1) {
    // console.info('Intersection point belongs to vector 1, extending vector 2...');
    return (
      <g>
        <line {...segmentProps} {...rest} {...vector1} />
        <line {...extendedProps} {...rest} {...extendedVector2} />
        <line {...segmentProps} {...rest} {...vector2} />
        <Arc vector1={vector1} vector2={vector2} />
      </g>
    );
  }

  const extendedVector1 = {
    x1: vector1.x1 === intersection.x ? vector1.x2 : vector1.x1,
    y1: vector1.y1 === intersection.y ? vector1.y2 : vector1.y1,
    x2: intersection.x,
    y2: intersection.y,
  };
  if (inSegment2) {
    // console.info('Intersection point belongs to vector 2, extending vector 1...');
    return (
      <g>
        <line {...extendedProps} {...rest} {...extendedVector1} />
        <line {...segmentProps} {...rest} {...vector1} />
        <line {...segmentProps} {...rest} {...vector2} />
        <Arc vector1={vector1} vector2={vector2} />
      </g>
    );
  } else if (isPointWithinRect(intersection, boundingRect)) {
    // console.info('Intersection point is within boundaries, extending vectors...');
    return (
      <g>
        <line {...extendedProps} {...rest} {...extendedVector1} />
        <line {...segmentProps} {...rest} {...vector1} />
        <line {...extendedProps} {...rest} {...extendedVector2} />
        <line {...segmentProps} {...rest} {...vector2} />
        <Arc vector1={vector1} vector2={vector2} />
      </g>
    );
  } else if (isPointCloserTo(intersection, vector1, vector2)) {
    // @TODO: create parallel to vector 2
    return <g />;
  } else {
    // console.info('Creating parallel to vector 1');
    const slope = getSlope(vector1);
    const { x1, x2, y1 } = vector2;
    const intercept = y1 - (slope * x1);
    const getY = (x: number) => (slope * x) + intercept;
    const parallel1 = {
      x1,
      y1,
      x2,
      y2: getY(x2),
    };
    return (
      <g>
        <line {...segmentProps} {...rest} {...vector1} />
        <line {...parallelProps} {...rest} {...parallel1} />
        <line {...segmentProps} {...rest} {...vector2} />
        <Arc vector1={parallel1} vector2={vector2} />
      </g>
    );
  }
});

export default Angle;

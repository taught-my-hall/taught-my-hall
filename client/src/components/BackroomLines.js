import React from 'react';
import { Dimensions } from 'react-native';
import { Line, Text as SvgText, Polygon, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const floorHeight = 0.7;
const ceilHeight = 0.15;
const leftCorner = 0.25;
const rightCorner = 0.75;
const doorWidth = 0.15;
const doorHeight = 0.4;

const floorColor = '#403524ff';

export default function BackroomLines({ i, p, total, title }) {
  const isFirst = p === 0;
  const isLast = p === total - 1;

  return (
    <>
      {isFirst ? (
        <>
          <Polygon
            points={`${width * (i + leftCorner)},${height * floorHeight} 
            ${width * (i + 0.51)},${height * floorHeight} 
            ${width * (i + 0.51)},${height} 
            ${width * i},${height}`}
            fill={floorColor}
          ></Polygon>
          <Line
            x1={width * (i + leftCorner)}
            y1={height * floorHeight}
            x2={width * (i + 0.5)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * i}
            y1={height}
            x2={width * (i + leftCorner)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + leftCorner)}
            y1={height * ceilHeight}
            x2={width * (i + leftCorner)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * i}
            y1={0}
            x2={width * (i + leftCorner)}
            y2={height * ceilHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + leftCorner)}
            y1={height * ceilHeight}
            x2={width * (i + 0.5)}
            y2={height * ceilHeight}
            stroke="white"
            strokeWidth={2}
          />
        </>
      ) : (
        <>
          <Polygon
            points={`${width * i},${height * floorHeight} 
            ${width * (i + 0.51)},${height * floorHeight} 
            ${width * (i + 0.51)},${height} 
            ${width * i},${height}`}
            fill={floorColor}
          ></Polygon>
          <Line
            x1={width * i}
            y1={height * floorHeight}
            x2={width * (i + 0.5)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * i}
            y1={height * ceilHeight}
            x2={width * (i + 0.5)}
            y2={height * ceilHeight}
            stroke="white"
            strokeWidth={2}
          />
        </>
      )}
      {isLast ? (
        <>
          <Polygon
            points={`${width * (i + 0.5)},${height * floorHeight} 
            ${width * (i + rightCorner)},${height * floorHeight} 
            ${width * (i + 1)},${height} 
            ${width * (i + 0.5)},${height}`}
            fill={floorColor}
          ></Polygon>
          <Line
            x1={width * (i + 0.5)}
            y1={height * floorHeight}
            x2={width * (i + rightCorner)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + rightCorner)}
            y1={height * floorHeight}
            x2={width * (i + 1)}
            y2={height}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + rightCorner)}
            y1={height * ceilHeight}
            x2={width * (i + rightCorner)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + 0.5)}
            y1={height * ceilHeight}
            x2={width * (i + rightCorner)}
            y2={height * ceilHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + rightCorner)}
            y1={height * ceilHeight}
            x2={width * (i + 1)}
            y2={0}
            stroke="white"
            strokeWidth={2}
          />
        </>
      ) : (
        <>
          <Polygon
            points={`${width * (i + 0.5)},${height * floorHeight} 
            ${width * (i + 1)},${height * floorHeight} 
            ${width * (i + 1)},${height} 
            ${width * (i + 0.5)},${height}`}
            fill={floorColor}
          ></Polygon>
          <Line
            x1={width * (i + 0.5)}
            y1={height * floorHeight}
            x2={width * (i + 1)}
            y2={height * floorHeight}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            x1={width * (i + 0.5)}
            y1={height * ceilHeight}
            x2={width * (i + 1)}
            y2={height * ceilHeight}
            stroke="white"
            strokeWidth={2}
          />
        </>
      )}
      <Line
        x1={width * (i + 0.5 - doorWidth / 2)}
        y1={height * (floorHeight - doorHeight)}
        x2={width * (i + 0.5 - doorWidth / 2)}
        y2={height * floorHeight}
        stroke="white"
        strokeWidth={2}
      />
      <Line
        x1={width * (i + 0.5 + doorWidth / 2)}
        y1={height * (floorHeight - doorHeight)}
        x2={width * (i + 0.5 + doorWidth / 2)}
        y2={height * floorHeight}
        stroke="white"
        strokeWidth={2}
      />
      <Line
        x1={width * (i + 0.5 - doorWidth / 2)}
        y1={height * (floorHeight - doorHeight)}
        x2={width * (i + 0.5 + doorWidth / 2)}
        y2={height * (floorHeight - doorHeight)}
        stroke="white"
        strokeWidth={2}
      />
      <SvgText
        x={width * (i + 0.5)}
        y={height * 0.35}
        fontSize={24}
        fill={'white'}
        textAnchor="middle"
        fontFamily="Arial"
      >
        {title}
      </SvgText>
      <Circle cx={width * (i + 0.55)} cy={height * 0.5} r={5} fill="white" />
    </>
  );
}

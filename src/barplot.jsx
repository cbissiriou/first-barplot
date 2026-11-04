import * as d3 from "d3";
import { useRef, useState } from "react";

const WIDTH = 500;
const HEIGHT = 400;
const MARGIN = { top: 20, right: 40, bottom: 30, left: 90 };

const defaultData = [
  { country: "United States", students: 68 },
  { country: "France", students: 21 },
  { country: "United Kingdom", students: 21 },
  { country: "Germany", students: 20 },
  { country: "Switzerland", students: 13 },
  { country: "Spain", students: 10 },
  { country: "Netherlands", students: 9 },
  { country: "India", students: 9 },
  { country: "Singapore", students: 8 },
  { country: "Ireland", students: 8 },
  { country: "Sweden", students: 7 },
  { country: "Australia", students: 7 },
  { country: "Canada", students: 6 },
  { country: "Finland", students: 5 },
  { country: "Mexico", students: 4 },
  { country: "Brazil", students: 4 },
  { country: "Saudi Arabia", students: 3 },
  { country: "Romania", students: 3 },
  { country: "Philippines", students: 3 },
  { country: "New Zealand", students: 3 },
];

export default function Barplot({ data = defaultData } = {}) {

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    // Y axis: one band per country
    const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.country))
        .range([0, innerHeight])
        .padding(0.2);
    
    // X axis: number of students
    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.students) ?? 0])
        .nice()
        .range([0, innerWidth]);
    
    const ticks = xScale.ticks(5);

    // Hover state: hovered datum + mouse position relative to the SVG
    const svgRef = useRef(null);
    const [hover, setHover] = useState(null); // { d, x, y }
    const total = d3.sum(data, (d) => d.students);
    
    const handleMove = (e, d) => {
        const box = svgRef.current.getBoundingClientRect();
        setHover({ d, x: e.clientX - box.left, y: e.clientY - box.top });
    };


    return (
        <svg
            ref={svgRef}
            width={WIDTH}
            height={HEIGHT}
            role="img"
            aria-label="Students by country"
            onMouseLeave={() => setHover(null)}
        >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                {/* Vertical gridlines + X tick labels */}
                {ticks.map((t) => (
                <g key={t} transform={`translate(${xScale(t)},0)`}>
                    <line y2={innerHeight} stroke="#e5e5e5" />
                    <text y={innerHeight + 18} textAnchor="middle" fontSize={11} fill="#666">
                    {t}
                    </text>
                </g>
                ))}
    
                {/* Bars + labels */}
                {data.map((d) => {
                const y = yScale(d.country);
                const barWidth = xScale(d.students);
                return (
                    <g key={d.country}>
                        <rect
                            x={0}
                            y={y}
                            width={barWidth}
                            height={yScale.bandwidth()}
                            fill="#2a6f97"
                            opacity={hover && hover.d.country !== d.country ? 0.5 : 1}
                            onMouseEnter={(e) => handleMove(e, d)}
                            onMouseMove={(e) => handleMove(e, d)}
                        />
                    {/* Country label (left of the bar) */}
                        <text
                            x={-8}
                            y={y + yScale.bandwidth() / 2}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fontSize={12}
                            fill="#222"
                        >
                            {d.country}
                        </text>
                    {/* Value label (right of the bar) */}
                        <text
                            x={barWidth + 6}
                            y={y + yScale.bandwidth() / 2}
                            dominantBaseline="middle"
                            fontSize={12}
                            fill="#222"
                        >
                            {d.students}
                        </text>
                    </g>
                );
                })}
    
                {/* Y axis line */}
                <line y2={innerHeight} stroke="#999" />
            </g>
             {/* Tooltip (flips to the left of the cursor near the right edge) */}
            {hover && (
                <g
                transform={`translate(${
                    hover.x + 12 + 150 > WIDTH ? hover.x - 162 : hover.x + 12
                },${Math.max(hover.y - 58, 0)})`}
                pointerEvents="none"
                >
                <rect width={150} height={52} rx={4} fill="#fff" stroke="#999" />
                <text x={8} y={18} fontSize={12} fontWeight="bold" fill="#222">
                    {hover.d.country}
                </text>
                <text x={8} y={32} fontSize={11} fill="#444">
                    {hover.d.students} students
                </text>
                <text x={8} y={45} fontSize={11} fill="#444">
                    {total > 0 ? ((hover.d.students / total) * 100).toFixed(1) : "0.0"}% of total
                </text>
                </g>
            )}
        </svg>

    );
};
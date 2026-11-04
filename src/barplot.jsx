import * as d3 from "d3";
import { useRef, useState } from "react";

const WIDTH = 600;
const HEIGHT = 400;
const MARGIN = { top: 20, right: 40, bottom: 30, left: 90 };

const defaultData = [
  { country: "United States",region: "North America", students: 68 },
  { country: "France",region: "Europe", students: 21 },
  { country: "United Kingdom",region: "Europe", students: 21 },
  { country: "Germany",region: "Europe", students: 20 },
  { country: "Switzerland",region: "Europe", students: 13 },
  { country: "Spain",region: "Europe", students: 10 },
  { country: "Netherlands",region: "Europe", students: 9 },
  { country: "India",region: "Asia", students: 9 },
  { country: "Singapore",region: "Asia", students: 8 },
  { country: "Ireland",region: "Europe", students: 8 },
  { country: "Sweden",region: "Europe", students: 7 },
  { country: "Australia",region: "Oceania", students: 7 },
  { country: "Canada",region: "North America", students: 6 },
  { country: "Finland",region: "Europe", students: 5 },
  { country: "Mexico",region: "North America", students: 4 },
  { country: "Brazil",region: "South America", students: 4 },
  { country: "Saudi Arabia",region: "Asia", students: 3 },
  { country: "Romania",region: "Europe", students: 3 },
  { country: "Philippines",region: "Asia", students: 3 },
  { country: "New Zealand",region: "Oceania", students: 3 },
  { country: "Morocco",region: "Africa", students: 7 },
  { country: "South Africa",region: "Africa", students: 10 },
];
const PALETTE = ["#2a6f97", "#c4693d", "#4c956c", "#8e5ea2", "#b8a33a", "#7a7a7a"];

export default function Barplot({ data = defaultData } = {}) {

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    // Regions, color per region, and the active filter
    const regions = [...new Set(data.map((d) => d.region))].sort();
    const colorOf = (r) => PALETTE[regions.indexOf(r) % PALETTE.length];
    const [selectedRegion, setSelectedRegion] = useState("All");

    
  // Grouped by region (alphabetical), then by students desc inside each group
    const visibleData = data
        .filter((d) => selectedRegion === "All" || d.region === selectedRegion)
        .sort((a, b) => a.region.localeCompare(b.region) || b.students - a.students);

    // Y axis: one band per country
    const yScale = d3
        .scaleBand()
        .domain(visibleData.map((d) => d.country))
        .range([0, innerHeight])
        .padding(0.2);
    
    // X axis: number of students
    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(visibleData, (d) => d.students) ?? 0])
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
        <div style={{ width: WIDTH }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {["All", ...regions].map((r) => {
            const active = selectedRegion === r;
            return (
                <button
                key={r}
                type="button"
                aria-pressed={active}
                onClick={() => {
                    setSelectedRegion(r);
                    setHover(null);
                }}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                    borderRadius: 14,
                    border: `1px solid ${active ? "#222" : "#ccc"}`,
                    background: active ? "#222" : "#fff",
                    color: active ? "#fff" : "#222",
                }}
                >
                {r !== "All" && (
                    <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: colorOf(r),
                    }}
                    />
                )}
                {r}
                </button>
            );
            })}
        </div>
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
                {visibleData.map((d) => {
                const y = yScale(d.country);
                const barWidth = xScale(d.students);
                return (
                    <g key={d.country}>
                        <rect
                            x={0}
                            y={y}
                            width={barWidth}
                            height={yScale.bandwidth()}
                            fill={colorOf(d.region)}
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
                },${Math.max(hover.y - 72, 0)})`}
                pointerEvents="none"
                >
                <rect width={150} height={66} rx={4} fill="#fff" stroke="#999" />
                <text x={8} y={18} fontSize={12} fontWeight="bold" fill="#222">
                    {hover.d.country}
                </text>
                 <text x={8} y={32} fontSize={11} fill={colorOf(hover.d.region)}>
                    {hover.d.region}
                </text>
                <text x={8} y={46} fontSize={11} fill="#444">
                    {hover.d.students} students
                </text>
                <text x={8} y={59} fontSize={11} fill="#444">
                    {total > 0 ? ((hover.d.students / total) * 100).toFixed(1) : "0.0"}% of total
                </text>
                </g>
            )}
        </svg>
        </div>

    );
};
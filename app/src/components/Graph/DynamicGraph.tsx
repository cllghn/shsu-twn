import React, { useRef, useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';
import Tooltip from '@mui/material/Tooltip';
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import { Box } from '@mui/material';

// Define the types for the props
interface DynamicGraphProps {
    data: {
        elements: {
            nodes: { data: { id: string, unified_name: string, [key: string]: any } }[]; // Add any dynamic data
            edges: { data: { source: string, target: string, id: string, [key: string]: any } }[];
        };
    };
    selected: string;
}

// cytoscape.use(fcose);

cytoscape.use(dagre);

// Function to determine color based on preliminary_type
const getNodeColor = (type: string) => {
    const colorMap: Record<string, string> = {
        "water source": "#5e4fa2", // Blue
        "water system": "#9e0142", // Green
    };
    return colorMap[type] || "#808080"; // Default to gray if type is unknown
};


const DynamicGraph: React.FC<DynamicGraphProps> = ({ data, selected }) => {
    const cyRef = useRef<cytoscape.Core | null>(null); // Store Cytoscape instance
    const { nodes, edges } = data.elements;
    const formattedElements = [
        ...nodes.map((node) => ({
            data: {
                id: node.data.id,
                label: node.data.unified_name,
                preliminary_type: node.data.preliminary_type,
            },
        })),
        ...edges.map((edge) => ({
            data: {
                id: edge.data.id,
                source: edge.data.source,
                target: edge.data.target,
            },
        })),
    ];

    const layout = {
        // name: "fcose",
        name: "dagre",
        fit: true,
        animate: false,
        padding: 20,
    };

    const [showLabels, setShowLabels] = useState(true);
    const handleLabelToggle = () => {
        setShowLabels((prev) => !prev);
        if (cyRef.current) {
            cyRef.current.style()
                .selector("node")
                .style({ label: !showLabels ? "data(label)" : "" })
                .update();
        }
    };
    useEffect(() => {
        const cy = cyRef.current;

        if (cy) {
            cy.style()
                .selector("node")
                .style({ label: showLabels ? "data(label)" : "" })
                .update();
        }
    }, [showLabels]);

    const handleZoomToFit = () => {
        cyRef.current?.fit();
    };

    // Function supporting the screenshot feature
    const getScreenshot = () => {
        const cy = cyRef.current;
        if (cy) {
            const base64URI = cy.png();
            const link = document.createElement('a');
            link.href = base64URI;
            link.download = 'screenshot.png';
            link.click();
        }
    };
    return (
        <div className='min-h-screen relative'>
            <Box className="absolute top-[1em] right-3 z-10 bg-blue-500 bg-opacity-20 rounded p-2 shadow-md">
                <span className="text-sm">
                    <ArrowBackIcon sx={{ fontSize: 'small' }} /> Water Flow
                </span>
                <br />
                <span className="text-sm">
                    <CircleIcon sx={{ fontSize: 'small', fill: "#5e4fa2" }} /> Water Source
                </span>
                <br />
                <span className="text-sm">
                    <CircleIcon sx={{ fontSize: 'small', fill: "#9e0142" }} /> Water System
                </span>
            </Box>
            <Tooltip title="Fit to Screen" arrow placement="left">
                <button
                    onClick={handleZoomToFit}
                    className="absolute top-[1em] left-3 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                    id='fit-screen-btn'
                >
                    <CenterFocusWeakIcon />
                </button>
            </Tooltip>
            <Tooltip title="Toggle Node Labels" arrow placement="left">
                <button
                    onClick={handleLabelToggle}
                    className="absolute top-[5em] left-3 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                    id="toggle-labels-btn"
                >
                    <TextFieldsIcon />
                </button>
            </Tooltip>
            <Tooltip title="Take Screenshot" arrow placement="left">
                <button
                    onClick={getScreenshot}
                    className="absolute top-[9em] left-3 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                    id='screenshot-btn'
                >
                    <CameraAltIcon />
                </button>
            </Tooltip>

            <CytoscapeComponent
                key={JSON.stringify(data)} // Forces a full re-render when data changes
                elements={formattedElements} // Pass the formatted elements directly
                id="cy-graph"
                style={{ width: "100%", height: "100vh" }} // Define size for the graph
                layout={layout} // Apply the layout configuration
                cy={(cy) => (cyRef.current = cy)} // Store Cytoscape instance
                stylesheet={[
                    {
                        selector: "node",
                        style: {
                            "background-color": (ele) => getNodeColor(ele.data("preliminary_type")),
                            "label": "data(label)",
                            "text-valign": "center",
                            "color": "#fff",
                            "text-outline-color": "#000",
                            "text-outline-width": 2,
                            "font-size": "12px",
                        },
                    },
                    {
                        selector: "edge",
                        style: {
                            "width": 2,
                            width: "1px",
                            "line-color": "#ccc",
                            "target-arrow-shape": "chevron",
                            "target-arrow-color": "#ccc",
                        },
                    },
                ]}
            />
        </div>
    );
};

export default DynamicGraph;
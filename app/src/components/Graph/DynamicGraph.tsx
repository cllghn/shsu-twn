import React, { useRef, useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
// import dagre from 'cytoscape-dagre';
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

// Define tooltip state interface
interface TooltipState {
    show: boolean;
    x: number;
    y: number;
    content: {
        id: string;
        name: string;
        type: string;
        [key: string]: any;
    };
}

cytoscape.use(fcose);

// cytoscape.use(dagre);

// Function to determine color based on preliminary_type
const getNodeColor = (type: string) => {
    const colorMap: Record<string, string> = {
        "water source": "#01161E", // Dark Blue
        "water system": "#53899D", // Light Blue
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
                ...node.data, // Spread other properties if needed
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
        name: "fcose",
        // name: "dagre",
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

    // Tooltip state 
    const [tooltip, setTooltip] = useState<TooltipState>({
        show: false,
        x: 0,
        y: 0,
        content: {
            id: '',
            name: '',
            type: ''
        }
    });

    useEffect(() => {
        const cy = cyRef.current;

        if (cy) {
            cy.style()
                .selector("node")
                .style({ label: showLabels ? "data(label)" : "" })
                .update();
                
            // Add event listeners for tooltips
            cy.on('mouseover', 'node', (event) => {
                const node = event.target;
                const position = event.renderedPosition || event.position;
                
                // Get node data for the tooltip
                setTooltip({
                    show: true,
                    x: position.x,
                    y: position.y,
                    content: {
                        id: node.data('id'),
                        name: node.data('unified_name'),
                        type: node.data('preliminary_type'),
                        // Add any other properties you want to show
                    }
                });
            });
            
            cy.on('mouseout', 'node', () => {
                setTooltip(prev => ({ ...prev, show: false }));
            });
            
            // Update tooltip position when dragging or moving the graph
            cy.on('drag', () => {
                if (tooltip.show) {
                    setTooltip(prev => ({ ...prev, show: false }));
                }
            });
            
            // Clean up event listeners on unmount
            return () => {
                cy.removeListener('mouseover');
                cy.removeListener('mouseout');
                cy.removeListener('drag');
            };
        }
    }, [showLabels, tooltip.show]);

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
            <Box className="absolute top-[1em] right-3 z-10 bg-[#124559] bg-opacity-20 rounded p-2 shadow-lg border-[1px] border-[#124559]">
                <span className="text-sm">
                    <ArrowBackIcon sx={{ fontSize: 'small' }} /> Water Flow
                </span>
                <br />
                <span className="text-sm">
                    <CircleIcon sx={{ fontSize: 'small', fill: "#01161E" }} /> Water Source
                </span>
                <br />
                <span className="text-sm">
                    <CircleIcon sx={{ fontSize: 'small', fill: "#53899D" }} /> Water System
                </span>
            </Box>
            <Tooltip title="Fit to Screen" arrow placement="left">
                <button
                    onClick={handleZoomToFit}
                    className="absolute top-[1em] left-3 z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id='fit-screen-btn'
                >
                    <CenterFocusWeakIcon />
                </button>
            </Tooltip>
            <Tooltip title="Toggle Node Labels" arrow placement="left">
                <button
                    onClick={handleLabelToggle}
                    className="absolute top-[5em] left-3 z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id="toggle-labels-btn"
                >
                    <TextFieldsIcon />
                </button>
            </Tooltip>
            <Tooltip title="Take Screenshot" arrow placement="left">
                <button
                    onClick={getScreenshot}
                    className="absolute top-[9em] left-3 z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id='screenshot-btn'
                >
                    <CameraAltIcon />
                </button>
            </Tooltip>

            {/* Custom tooltip */}
            {tooltip.show && (
                <div 
                    className="absolute z-20 bg-white text-black p-3 rounded shadow-lg border border-[#124559]"
                    style={{
                        left: tooltip.x + 10, // Offset to not cover the node
                        top: tooltip.y + 10,
                        pointerEvents: 'none', // Makes the tooltip non-interactive
                    }}
                >
                    <h3 className="font-bold">{tooltip.content.name}</h3>
                    <p className="text-sm"><b>ID:</b> {tooltip.content.id}</p>
                    <p className="text-sm pt-2"><b>Type:</b> {tooltip.content.type.toUpperCase()}</p>
                    {/* ... */}
                </div>
            )}

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
                            "color": "#000",
                            "font-size": "6px",
                            "text-transform": "uppercase",
                            "text-wrap": "ellipsis",
                            "text-max-width": 60,
                            "height": 20,
                            "width": 20,
                        },
                    },
                    {
                        selector: "edge",
                        style: {
                            "width": 1,
                            "line-color": "#ccc",
                            "mid-target-arrow-shape": "vee",
                            "mid-target-arrow-color": "#ccc",
                        },
                    },
                ]}
            />
        </div>
    );
};

export default DynamicGraph;
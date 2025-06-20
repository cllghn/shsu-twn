import React, { useRef, useState, useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';
import Tooltip from '@mui/material/Tooltip';
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import SearchIcon from '@mui/icons-material/Search'
import SearchOffIcon from '@mui/icons-material/SearchOff';;
import cxtmenu from "cytoscape-cxtmenu";
import { useSearchParams, useRouter } from 'next/navigation';

// Search ingredients for the graph
import {
    TextField,
    Autocomplete,
    Paper,
    Typography,
    Chip,
    InputAdornment,
    IconButton
} from '@mui/material';

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

// Define tooltip state interface for nodes
interface NodeTooltipState {
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

// Define tooltip state interface for edges
interface EdgeTooltipState {
    show: boolean;
    x: number;
    y: number;
    content: {
        id: string;
        source: string;
        target: string;
        [key: string]: any;
    };
}

cytoscape.use(cola);
cytoscape.use(fcose);
cytoscape.use(cxtmenu);


// Function to determine color based on preliminary_type
const getNodeColor = (type: string) => {
    const colorMap: Record<string, string> = {
        "water source": "#01161E", // Dark Blue
        "water system": "#53899D", // Light Blue
    };
    return colorMap[type] || "#808080"; // Default to gray if type is unknown
};


const DynamicGraph: React.FC<DynamicGraphProps> = ({ data, selected }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const cyRef = useRef<cytoscape.Core | null>(null); // Store Cytoscape instance
    const { nodes, edges } = data.elements;
    const dynamicLayout = nodes.length < 20 ? "cola" : "fcose";

    // Calculate incoming and outgoing volumes for each node
    const nodeVolumes = useMemo(() => {
        const volumeData: NodeVolumeData = {};

        // Initialize all nodes with zero volumes
        nodes.forEach(node => {
            volumeData[node.data.id] = {
                incomingVolume: 0,
                outgoingVolume: 0
            };
        });

        // Calculate volumes from edges
        edges.forEach(edge => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const volume = parseFloat(edge.data.yearly_volume.replace(/,/g, '')) || 0;
            // Add to outgoing volume for source node
            if (volumeData[sourceId]) {
                volumeData[sourceId].outgoingVolume += volume;
            }
            // Add to incoming volume for target node
            if (volumeData[targetId]) {
                volumeData[targetId].incomingVolume += volume;
            }
        });

        return volumeData;
    }, [nodes, edges]);

    // Search term and selected node state -------------------------------------
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSearchNode, setSelectedSearchNode] = useState(null);
    const searchOptions = useMemo(() => {
        return nodes.map(node => ({
            id: node.data.id,
            label: node.data.unified_name,
            type: node.data.preliminary_type,
            volume: (nodeVolumes[node.data.id]?.incomingVolume || 0) + (nodeVolumes[node.data.id]?.outgoingVolume || 0)
        }));
    }, [nodes, nodeVolumes]);

    const formattedElements = useMemo(() => [
        ...nodes.map((node) => ({
            data: {
                id: node.data.id,
                label: node.data.unified_name,
                preliminary_type: node.data.preliminary_type,
                incomingVolume: nodeVolumes[node.data.id]?.incomingVolume || 0,
                outgoingVolume: nodeVolumes[node.data.id]?.outgoingVolume || 0,
                ...node.data, // Spread other properties if needed
            },
        })),
        ...edges.map((edge) => ({
            data: {
                id: edge.data.id,
                source: edge.data.source,
                target: edge.data.target,
                ...edge.data, // Spread other properties if needed
            },
        })),
    ], [nodes, edges]); // Only recalculate when nodes or edges change

    const layout = {
        name: dynamicLayout,
        fit: true,
        animate: false,
        padding: 20,
        randomize: false, // Prevent randomizing positions on re-layout
        nodeDimensionsIncludeLabels: true,
    };

    // Search logic useEffect---------------------------------------------------
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        if (selectedSearchNode) {
            const node = cy.getElementById(selectedSearchNode.id);
            if (node.length > 0) {

                node.addClass('search-highlighted');
                setTimeout(() => {
                    node.removeClass('search-highlighted');
                }, 1000); // Remove after 1 second

                // Center view on the node
                cy.animate({
                    center: { eles: node },
                    zoom: Math.max(cy.zoom(), 3)
                }, {
                    duration: 500
                });
            }
        }
    }, [selectedSearchNode]); //------------------------------------------------


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

    // Tooltip states using separate tooltip states for nodes and edges
    const [nodeTooltip, setNodeTooltip] = useState<NodeTooltipState>({
        show: false,
        x: 0,
        y: 0,
        content: {
            id: '',
            name: '',
            type: '',
            incomingVolume: 0,
            outgoingVolume: 0
        }
    });

    const [edgeTooltip, setEdgeTooltip] = useState<EdgeTooltipState>({
        show: false,
        x: 0,
        y: 0,
        content: {
            id: '',
            source: '',
            target: '',
            sourceName: '',
            targetName: ''
        }
    });

    const [allowZoom, setAllowZoom] = useState(false);
    const handleAllowZoom = () => {
        const newZoomState = !allowZoom;
        setAllowZoom(newZoomState);
        if (cyRef.current) {
            cyRef.current.userZoomingEnabled(newZoomState);

            // Set zoom limits when enabling zoom
            if (newZoomState) {
                cyRef.current.minZoom(0.5);
                cyRef.current.maxZoom(5);
            }
        }
    };

    useEffect(() => {
        const cy = cyRef.current;

        if (cy) {

            cy.userZoomingEnabled(allowZoom);
            cy.style()
                .selector("node")
                .style({ label: showLabels ? "data(label)" : "" })
                .update();

            // Function to reset all styles
            const resetStyles = () => {
                cy.elements().removeClass('highlighted');
                cy.elements().removeClass('faded');
            };

            // Add event listeners for tooltips
            const calculateNodeTooltipPosition = (renderedX, renderedY, tooltipWidth = 300, tooltipHeight = 200) => {
                const cy = cyRef.current;
                if (!cy) return { x: renderedX + 50, y: renderedY + 10 };

                // Get container dimensions
                const extent = cy.extent();
                const containerWidth = cy.width();
                const containerHeight = cy.height();
                const padding = 10;

                let x = renderedX + 50;
                let y = renderedY + 10;

                // Check if tooltip would overflow container
                if (x + tooltipWidth > containerWidth - padding) {
                    x = renderedX - tooltipWidth - padding;
                }

                if (y + tooltipHeight > containerHeight - padding) {
                    y = renderedY - tooltipHeight - padding;
                }

                if (x < padding) {
                    x = padding;
                }

                if (y < padding) {
                    y = padding;
                }

                return { x, y };
            };
            cy.on('mouseover', 'node', (event) => {
                resetStyles();
                const node = event.target;
                const neighborhood = node.neighborhood().add(node);

                neighborhood.addClass('highlighted');
                cy.elements().difference(neighborhood).addClass('faded');

                const position = event.renderedPosition || event.position;
                const tooltipPos = calculateNodeTooltipPosition(position.x, position.y);

                // Hide edge tooltip if it's showing
                setEdgeTooltip(prev => ({ ...prev, show: false }));

                // Format the volume numbers with commas and fixed decimal places
                const incomingVolume = node.data('incomingVolume') || 0;
                const outgoingVolume = node.data('outgoingVolume') || 0;

                // Get node data for the tooltip
                setNodeTooltip({
                    show: true,
                    x: tooltipPos.x,
                    y: tooltipPos.y,
                    content: {
                        id: node.data('id'),
                        name: node.data('unified_name'),
                        type: node.data('preliminary_type'),
                        incomingVolume: incomingVolume,
                        outgoingVolume: outgoingVolume
                    }
                });
            });

            cy.on('mouseout', 'node', () => {
                resetStyles();

                setNodeTooltip(prev => ({ ...prev, show: false }));

                // Remove highlight class from all nodes
            });

            const calculateEdgeTooltipPosition = (renderedX, renderedY, tooltipWidth = 300, tooltipHeight = 200) => {
                const cy = cyRef.current;
                if (!cy) return { x: renderedX + 50, y: renderedY + 10 };

                // Get container dimensions
                const extent = cy.extent();
                const containerWidth = cy.width();
                const containerHeight = cy.height();
                const padding = 10;

                let x = renderedX;
                let y = renderedY + 10;

                // Check if tooltip would overflow container
                if (x + tooltipWidth > containerWidth - padding) {
                    x = renderedX - tooltipWidth - padding;
                }

                if (y + tooltipHeight > containerHeight - padding) {
                    y = renderedY - tooltipHeight - padding;
                }

                if (x < padding) {
                    x = padding;
                }

                if (y < padding) {
                    y = padding;
                }

                return { x, y };
            };
            cy.on('mouseover', 'edge', (event) => {
                resetStyles();
                const edge = event.target;
                const connectedNodes = edge.connectedNodes();
                const elements = edge.add(connectedNodes);
                elements.addClass('highlighted');
                cy.elements().difference(elements).addClass('faded');

                const position = event.renderedPosition || {
                    x: (event.position || { x: 0 }).x,
                    y: (event.position || { y: 0 }).y
                };

                const tooltipPos = calculateEdgeTooltipPosition(position.x, position.y, 250, 150);

                // Hide node tooltip if it's showing
                setNodeTooltip(prev => ({ ...prev, show: false }));

                // Get source and target nodes for more context
                const sourceId = edge.data('source');
                const targetId = edge.data('target');
                const sourceNode = cy.getElementById(sourceId);
                const targetNode = cy.getElementById(targetId);

                setEdgeTooltip({
                    show: true,
                    x: tooltipPos.x,
                    y: tooltipPos.y,
                    content: {
                        id: edge.data('id'),
                        source: sourceId,
                        target: targetId,
                        sourceName: sourceNode.data('unified_name'),
                        targetName: targetNode.data('unified_name'),
                        year: edge.data('year'),
                        year_volume: edge.data('yearly_volume') + "gallons",
                        water_type: edge.data('water_type'),
                        purchase_self: edge.data('purchased_self'),
                    }
                });
            });

            cy.on('mouseout', 'edge', () => {
                setEdgeTooltip(prev => ({ ...prev, show: false }));
                resetStyles();
            });

            // Update tooltip position when dragging or moving the graph
            cy.on('drag', () => {
                if (nodeTooltip.show) {
                    setNodeTooltip(prev => ({ ...prev, show: false }));
                }
                if (edgeTooltip.show) {
                    setEdgeTooltip(prev => ({ ...prev, show: false }));
                }
                resetStyles();
            });

            cy.on('click', function (event) {
                if (event.target === cy) {
                    resetStyles();
                }
            });

            cy.cxtmenu({
                selector: 'node',
                commands: [
                    {
                        content: 'See node network',
                        select: (node) => {
                            const params = new URLSearchParams(searchParams.toString());
                            const nodeData = node.data();
                            const waterPath = nodeData.preliminary_type === "water source" ? "sources" : "systems";
                            const nodeName = waterPath === "sources" ? nodeData.unified_name : nodeData.unified_name.toUpperCase();
                            params.set('node', nodeName);
                            router.push(`/netexplorer/${waterPath}?${params.toString()}`);
                        },
                        openMenuEvents: 'cxttapstart taphold',
                        outsideMenuCancel: true
                    }
                ],


            });

            // Clean up event listeners on unmount
            return () => {
                cy.removeAllListeners();
            };
        }
    }, [showLabels, nodeTooltip.show, edgeTooltip.show, allowZoom]);

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

    const formatVolume = (volume: number): string => {
        return volume.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " gallons";
    };

    return (
        <div className='min-h-screen relative'>
            <Paper className="hidden sm:block absolute top-[1em] right-3 rounded p-2 shadow-lg border-[1px] border-[#124559] z-50">
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
                <br />
                <span className="text-sm">
                    <CircleIcon sx={{ fontSize: 'small', stroke: "#6F5A4C", strokeWidth: 3, fill: "transparent" }} /> Selected Node
                </span>
            </Paper>
            <Paper className="block sm:hidden absolute bottom-[1em] right-3 rounded p-2 shadow-lg border-[1px] border-[#124559] z-50">
                <div className="flex flex-row items-center gap-4 text-sm">
                    <span className="text-sm text-center">
                        <ArrowBackIcon sx={{ fontSize: 'small' }} /><br /> Water Flow
                    </span>
                    <span className="text-sm text-center">
                        <CircleIcon sx={{ fontSize: 'small', fill: "#01161E" }} /><br /> Water Source
                    </span>
                    <span className="text-sm text-center">
                        <CircleIcon sx={{ fontSize: 'small', fill: "" }} /><br /> Water System
                    </span>
                    <span className="text-sm text-center">
                        <CircleIcon sx={{ fontSize: 'small', stroke: "#6F5A4C", strokeWidth: 3, fill: "transparent" }} /><br /> Selected Node
                    </span>
                </div>
            </Paper>
            <Tooltip title="Fit to Screen" arrow placement="top">
                <button
                    onClick={handleZoomToFit}
                    className="absolute top-[1em] left-3 z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id='fit-screen-btn'
                >
                    <CenterFocusWeakIcon />
                </button>
            </Tooltip>
            <Tooltip title={allowZoom ? "Disable Zoom" : "Enable Zoom"} arrow placement="top">
                <button
                    onClick={handleAllowZoom}
                    className="absolute top-[1em] left-[5em] z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id='fit-screen-btn'
                >
                    {allowZoom ? <SearchOffIcon /> : <SearchIcon />}
                </button>
            </Tooltip>
            <Tooltip title="Toggle Node Labels" arrow placement="top">
                <button
                    onClick={handleLabelToggle}
                    className="absolute top-[5em] left-3 sm:top-[1em] sm:left-[9em] z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id="toggle-labels-btn"
                >
                    <TextFieldsIcon />
                </button>
            </Tooltip>
            <Tooltip title="Take Screenshot" arrow placement="top">
                <button
                    onClick={getScreenshot}
                    className="absolute hidden sm:block sm:top-[1em] sm:left-[13em] z-10 bg-[#124559] text-white p-2 rounded-full hover:bg-white hover:text-[#124559] hover:border-[#124559] hover:border-[1px] shadow-lg"
                    id='screenshot-btn'
                >
                    <CameraAltIcon />
                </button>
            </Tooltip>

            <Paper
                className="hidden sm:block absolute top-[5em] left-3 z-10 shadow-lg"
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #12455 9'
                }}
            >
                <Autocomplete
                    id="node-search"
                    options={searchOptions}
                    getOptionLabel={(option) => option.label}
                    style={{ width: 240 }}
                    value={selectedSearchNode}
                    onChange={(event, newValue) => {
                        setSelectedSearchNode(newValue);
                    }}
                    inputValue={searchTerm}
                    onInputChange={(event, newInputValue) => {
                        setSearchTerm(newInputValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search nodes..."
                            variant="outlined"
                            size="small"
                            slotProp={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#124559' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <>
                                        {selectedSearchNode && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedSearchNode(null);
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                </IconButton>
                                            </InputAdornment>
                                        )}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#124559',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#124559',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#124559',
                                    },
                                },
                            }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                    <Typography variant="body2" className="font-medium">
                                        {option.label}
                                    </Typography>
                                    <Chip
                                        label={option.type}
                                        size="small"
                                        sx={{
                                            backgroundColor: getNodeColor(option.type),
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </li>
                    )}
                    filterOptions={(options, { inputValue }) => {
                        // Custom filter for better search experience
                        const filtered = options.filter(option =>
                            option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                            option.type.toLowerCase().includes(inputValue.toLowerCase())
                        );
                        return filtered.slice(0, 10); // Limit results
                    }}
                    noOptionsText="No nodes found"
                    clearOnBlur={false}
                    clearOnEscape
                    autoComplete
                />
            </Paper>


            {/* Custom node tooltip */}
            {nodeTooltip.show && (
                <div
                    className="absolute z-20 bg-white text-black p-3 rounded shadow-lg border border-[#124559]"
                    style={{
                        left: nodeTooltip.x,
                        top: nodeTooltip.y,
                        pointerEvents: 'none',
                    }}
                >
                    <h3 className="font-bold">Node: {nodeTooltip.content.name}</h3>
                    <p className="text-sm"><b>ID:</b> {nodeTooltip.content.id}</p>
                    <p className="text-sm"><b>Type:</b> {nodeTooltip.content.type?.toUpperCase()}</p>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                        <p className='text-sm pb-1 font-bold'>Flow Visualized</p>
                        <p className="text-sm"><b>Incoming Volume:</b> {formatVolume(nodeTooltip.content.incomingVolume)}</p>
                        <p className="text-sm"><b>Outgoing Volume:</b> {formatVolume(nodeTooltip.content.outgoingVolume)}</p>
                        {/* <p className="text-sm"><b>Net Flow:</b> {formatVolume(nodeTooltip.content.incomingVolume - nodeTooltip.content.outgoingVolume)}</p> */}
                    </div>
                </div>
            )}

            {/* Edge tooltip */}
            {edgeTooltip.show && (
                <div
                    className="absolute z-20 bg-white text-black p-3 rounded shadow-lg border border-[#124559]"
                    style={{
                        left: edgeTooltip.x + 10,
                        top: edgeTooltip.y + 10,
                        pointerEvents: 'none',
                    }}
                >
                    <h3 className="font-bold pb-2">Connection Details</h3>
                    <p className="text-sm"><b>From:</b> {edgeTooltip.content.sourceName}</p>
                    <p className="text-sm"><b>To:</b> {edgeTooltip.content.targetName}</p>
                    <p className="text-sm"><b>Year:</b> {edgeTooltip.content.year}</p>
                    <p className="text-sm"><b>Volume:</b> {edgeTooltip.content.year_volume}</p>
                    <p className="text-sm"><b>Water Type:</b> {edgeTooltip.content.water_type}</p>
                    <p className="text-sm"><b>Supply Method:</b> {edgeTooltip.content.purchase_self}</p>
                </div>
            )}

            <CytoscapeComponent
                key={JSON.stringify(data)} // Forces a full re-render when data changes
                elements={formattedElements} // Pass the formatted elements directly
                id="cy-graph"
                style={{ width: "100%", height: "100vh", zIndex: 1 }} // Define size for the graph
                layout={layout} // Apply the layout configuration
                cy={(cy) => (cyRef.current = cy)} // Store Cytoscape instance
                stylesheet={[
                    {
                        selector: "node",
                        style: {
                            "background-color": (ele) => getNodeColor(ele.data("preliminary_type")),
                            "border-color": "#6F5A4C",
                            "border-width": (ele: cytoscape.SingularElementArgument) => ele.data("id") === selected ? 1 : 0,
                            "label": "data(label)",
                            "color": "#000",
                            "font-size": "4px",
                            "text-transform": "uppercase",
                            "text-wrap": "ellipsis",
                            "text-max-width": 55,
                            "height": 10,
                            "width": 10,
                            "transition-property": "opacity",
                            "transition-duration": "0.2s",
                        },
                    },
                    {
                        selector: "edge",
                        style: {
                            "width": 1,
                            "line-color": "#ccc",
                            "mid-target-arrow-shape": "vee",
                            "mid-target-arrow-color": "#ccc",
                            "curve-style": "bezier",
                            "transition-property": "opacity",
                            "transition-duration": "0.2s",
                        },
                    },
                    {
                        selector: "node.highlighted",
                        style: {
                            "opacity": 1,
                        },
                    },
                    {
                        selector: "edge.highlighted",
                        style: {
                            "opacity": 1,
                        },
                    },
                    {
                        selector: ".faded",
                        style: {
                            "opacity": 0.2
                        }
                    },
                    {
                        selector: "node.search-highlighted",
                        style: {
                            "border-width": 2,
                            "border-color": "#ff6b6b",
                            "border-style": "solid",
                            "transition-property": "border-width, border-color",
                            "transition-duration": "4s",
                            "transition-timing-function": "ease-in-out"
                        }
                    }
                ]}
            />
        </div>
    );
};

export default DynamicGraph;
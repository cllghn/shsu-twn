"use client";

import React, { useState, useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import graphData from "./network-data.json";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import ConstructionIcon from '@mui/icons-material/Construction';
import InfoIcon from '@mui/icons-material/Info';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Tooltip from '@mui/material/Tooltip';
import cytoscape from "cytoscape";
import cxtmenu from "cytoscape-cxtmenu";
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import { NodeSingular as CSNodeSingular } from "cytoscape";
import NodeInfoModal from "../modals/NodeInfoModal";
import GraphConfigModal from "../modals/GraphConfigModal";
import GraphInfoModal from "../modals/GraphInfoModal";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';

// import { SelectChangeEvent } from '@mui/material/Select';

// Initialize Cytoscape extensions
cytoscape.use(cxtmenu);
cytoscape.use(cola);
cytoscape.use(dagre);

// Type Definitions
interface NodeData {
    id: string;
    name: string;
    county: string;
    population: number;
}

interface EdgeData {
    source: string;
    target: string;
    type: string;
    population: number;
    availability: string;
    id: number;
}

interface GraphData {
    elements: {
        nodes: { data: NodeData }[];
        edges: { data: EdgeData }[];
    };
}

// Main Graph Component
const Graph: React.FC = () => {
    const [graphState, setGraphState] = useState<GraphData>(graphData as GraphData);
    const [connectedNodesCount, setConnectedNodesCount] = useState(0);
    const [nodesCount, setNodesCount] = useState(0);
    const [edgesCount, setEdgesCount] = useState(0);
    const cyRef = useRef<any>(null);


    // Function to open modal with node data
    const [nodeSizeOption, setNodeSizeOption] = useState<string>("Constant");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
    const openNodeModal = (nodeData: NodeData) => {
        setSelectedNode(nodeData);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedNode(null);
    };

    // Open the information drawer
    const [graphInfoModalOpen, setGraphInfoModalOpen] = React.useState(false);
    const toggleInfoDrawer = (newOpen: boolean) => () => {
        setGraphInfoModalOpen(newOpen);
    };

    // States for the graph configuration modal
    const [graphConfigModalOpen, setGraphConfigModalOpen] = React.useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setGraphConfigModalOpen(newOpen);
    };
    const [layout, setLayout] = useState({ name: "cola", fit: true });
    const handleLayoutChange = (newLayout: string) => {
        setLayout({ name: newLayout, fit: true });
    };
    const [showLabels, setShowLabels] = useState(true);
    const handleLabelToggle = (show: boolean) => {
        setShowLabels(show);
        cyRef.current?.style()
            .selector("node")
            .style({ label: show ? "data(name)" : "" })
            .update(); // Update Cytoscape style
    };
    const [showEdgeLabels, setShowEdgeLabels] = useState(false);
    const handleEdgeLabelToggle = (show: boolean) => {
        setShowEdgeLabels(show);
        cyRef.current?.style()
            .selector("edge")
            .style({ label: show ? "data(type)" : "" })
            .update(); // Update Cytoscape
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

    // Synchronize graph state with Cytoscape
    const syncGraphStateWithCy = (cy: any) => {
        const updatedNodes = cy.nodes().map((node: any) => ({ data: node.data() }));
        const updatedEdges = cy.edges().map((edge: any) => ({ data: edge.data() }));

        setGraphState({
            elements: {
                nodes: updatedNodes,
                edges: updatedEdges,
            },
        });
    };

    // Delete a node and update state
    const deleteNode = (nodeId: string) => {
        const updatedNodes = graphState.elements.nodes.filter((node) => node.data.id !== nodeId);
        const updatedEdges = graphState.elements.edges.filter(
            (edge) => edge.data.source !== nodeId && edge.data.target !== nodeId
        );

        setGraphState({
            elements: {
                nodes: updatedNodes,
                edges: updatedEdges,
            },
        });
    };

    // Initialize Cytoscape context menu
    useEffect(() => {
        const cy = cyRef.current;

        if (cy) {
            cy.cxtmenu({
                selector: "node",
                commands: [
                    {
                        content: "Delete",
                        select: (node: CSNodeSingular) => deleteNode(node.id()),
                    },
                    {
                        content: "Info",
                        select: (node: CSNodeSingular) => openNodeModal(node.data()),
                    },
                    {
                        content: "See Ego",
                        select: (node: CSNodeSingular) => deleteNode(node.id()),
                        enabled: false,
                    }
                ],
                fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
                activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
                activePadding: 20, // additional size in pixels for the active command
                indicatorSize: 24, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size, 
                separatorWidth: 3, // the empty spacing in pixels between successive commands
                spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
                adaptativeNodeSpotlightRadius: true, // specify whether the spotlight radius should adapt to the node size
                minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
                maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
                openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
                itemColor: 'white', // the colour of text in the command's content
                itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
                zIndex: 9999, // the z-index of the ui div
                atMouse: false, // draw menu at mouse position
                outsideMenuCancel: false
            });

            cy.on("remove", () => syncGraphStateWithCy(cy));
        }
    }, []);

    // Update connected nodes count
    useEffect(() => {
        const nodeIds = new Set<string>();
        graphState.elements.edges.forEach((edge) => {
            nodeIds.add(edge.data.source);
            nodeIds.add(edge.data.target);
        });
        setConnectedNodesCount(nodeIds.size);
    }, [graphState]);

    // Update nodes and edges count
    useEffect(() => {
        setNodesCount(graphState.elements.nodes.length);
        setEdgesCount(graphState.elements.edges.length);
    }, [graphState]);

    const edgeStyles = {
        selector: "edge",
        style: {
            "line-color": "#708090",
            label: showEdgeLabels ? "data(type)" : "",
            "font-size": "5px",
            "text-rotation": "autorotate",
            "color": "#000",
            "opacity": 0.7,
            // "text-background-color": "#fff",
            // "text-background-opacity": 0.5,
            // "text-background-padding": "2px",
            width: "1px",
            "target-arrow-color": "#708090",
            "target-arrow-shape": "chevron",
            "curve-style": "bezier",
        },
    }

    // Calculate node styles using PageRank or Degree
    const calculateNodeStyles = (elements: GraphData["elements"], sizeOption: string) => {
        let sizeByNodeId: Record<string, number> = {};

        if (sizeOption === "OutDegree") {
            elements.nodes.forEach((node) => {
                const outDegree = elements.edges.filter(
                    (edge) => edge.data.source === node.data.id
                ).length;
                sizeByNodeId[node.data.id] = outDegree;
            });
        } else if (sizeOption === "InDegree") {
            elements.nodes.forEach((node) => {
                const inDegree = elements.edges.filter(
                    (edge) => edge.data.target === node.data.id
                ).length;
                sizeByNodeId[node.data.id] = inDegree;
            });
        }

        const maxMetric = Math.max(...Object.values(sizeByNodeId), 1); // Avoid division by zero
        return elements.nodes.map((node) => {
            const metric = sizeByNodeId[node.data.id] || 0;
            const size = sizeOption === "Constant" ? 20 : 20 + (metric / maxMetric) * 10;

            return {
                selector: `node[id="${node.data.id}"]`,
                style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    label: showLabels ? "data(name)" : "",
                    "background-color": "#0074D9",
                    "text-valign": "center",
                    "text-halign": "center",
                    color: "#000",
                    "font-size": "5px",
                },
            };
        });
    };

    const nodeStyles = calculateNodeStyles(graphState.elements, nodeSizeOption);

    useEffect(() => {
        const cy = cyRef.current;
        if (cy) {
            const nodeStylesJson = calculateNodeStyles(graphState.elements, nodeSizeOption);
            cy.style()
                .fromJson([...nodeStylesJson, edgeStyles]) // Combine with existing edge styles
                .update();
        }
    }, [nodeSizeOption, graphState.elements]);

    const handleZoomToFit = () => {
        cyRef.current?.fit();
    };

    const style = [
        ...nodeStyles,
        edgeStyles
    ];

    return (
        <div className="h-full w-full relative">
            {/* Graph-level metrics */}
            <div className="absolute bottom-0 right-2 z-10 bg-white shadow-md p-2 rounded">
                <h2 className="pb-2 text-md">Icons Key</h2>
                <span className="text-sm">
                    <ArrowBackIcon sx={{ fontSize: 'small' }} /> Water Sale
                </span>
                <br />
                <span className="text-sm">
                    <CircleIcon sx={{ fontSize: 'small' }} /> Water System
                </span>
                <h2 className="py-2 text-md">Graph Statistics</h2>
                <span className="text-sm">Nodes: {nodesCount}</span>
                <br />
                <span className="text-sm">Edges: {edgesCount}</span>
                <br />
                <span className="text-sm">Connected Nodes: {connectedNodesCount}</span>
            </div>
            {/* Info Modal */}
            <Tooltip title="Project Information" arrow placement="right">
                <button
                    onClick={toggleInfoDrawer(true)}
                    className="absolute top-0 left-2 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                >
                    <InfoIcon />
                </button>
            </Tooltip>
            <GraphInfoModal
                open={graphInfoModalOpen}
                onClose={toggleInfoDrawer(false)}
            />
            {/* Graph Config Modal */}
            <Tooltip title="Configure Graph" arrow placement="left">
                <button
                    onClick={toggleDrawer(true)}
                    className="absolute top-0 right-2 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                >
                    <ConstructionIcon />
                </button>
            </Tooltip>
            <GraphConfigModal
                open={graphConfigModalOpen}
                onClose={toggleDrawer(false)}
                onLayoutChange={handleLayoutChange}
                defaultShowLabels={showLabels}
                onLabelToggle={handleLabelToggle}
                defaultShowEdgeLabels={showEdgeLabels}
                onEdgeLabelToggle={handleEdgeLabelToggle}
                nodeSizeOption={nodeSizeOption}
                onNodeSizeOptionChange={(option) => setNodeSizeOption(option)}
            />
            {/* Autozoom button */}
            <Tooltip title="Fit to Screen" arrow placement="left">
                <button
                    onClick={handleZoomToFit}
                    className="absolute top-14 right-2 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                >
                    <CenterFocusWeakIcon />
                </button>
            </Tooltip>
            {/* Autozoom button */}
            <Tooltip title="Take Screenshot" arrow placement="left">
                <button
                    onClick={getScreenshot}
                    className="absolute top-28 right-2 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md"
                >
                    <CameraAltIcon />
                </button>
            </Tooltip>
            {/* Node Info Modal */}
            <NodeInfoModal open={modalOpen} nodeData={selectedNode} onClose={closeModal} />
            {/* Cytoscape Graph */}
            <CytoscapeComponent
                elements={CytoscapeComponent.normalizeElements(graphState.elements)}
                layout={layout}
                className="w-full h-full"
                stylesheet={style}
                cy={(cy) => {
                    cyRef.current = cy;
                }}
            />
        </div >
    );
};

export default Graph;

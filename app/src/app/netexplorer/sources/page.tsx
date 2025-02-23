"use client"
import { useState } from "react";
import React from 'react';
import graphData from '@/data/network-data.json';
import metadata from '@/data/network-meta-data.json';
import { Menu, MenuItem, Button, Paper, Typography } from "@mui/material";
import { ChevronDown } from "lucide-react";
import DynamicGraph from "@/components/Graph/DynamicGraph";

const SourcesPage: React.FC = () => {
    const nodeKeys = Object.keys(metadata.sources.kvs);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState("select a source"); // Default text
    const [filteredNode, setFilteredNode] = useState(null); // New state for filtered node
    const [filteredData, setFilteredData] = useState(null); // New state for filtered data
    const open = Boolean(anchorEl);

    const menuItems = nodeKeys

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (item) => {
        if (item) setSelectedItem(item); // Update button text on selection
        setAnchorEl(null);
    };

    const handleGo = () => {
        const selected = menuItems.find((item) => item === selectedItem);

        const filterDataBySource = (selected) => {
            // Filter edges where the source matches the provided sourceId
            const sourceEdges = graphData.elements.edges.filter(edge => edge.data.source === selected);
            const uniqueTargets = Array.from(new Set([...sourceEdges.map(edge => edge.data.target), selected]));
            const filteredEdges = graphData.elements.edges.filter(edge => uniqueTargets.includes(edge.data.source));
            const uniqueNodes = Array.from(new Set([selected, uniqueTargets,
                ...filteredEdges.map(edge => edge.data.target)]));
            const filteredNodes = graphData.elements.nodes.filter(node => uniqueNodes.includes(node.data.id));

            const filteredElements = {
                elements: {
                    nodes: filteredNodes,
                    edges: filteredEdges
                }
            };
            // Return only the filtered edges (not affecting nodes)
            return filteredElements;
        };

        const data = filterDataBySource(selected);
        setFilteredData(data);
        setFilteredNode(selected);
    };

    return (
        <>
            <main className='container flex flex-col md:flex-row w-full mt-16 mb-28 mx-auto px-18 space-x-4 '>
                <div className="md:w-1/4">
                    <Paper elevation={2} className="p-6">
                        <Typography variant="h4" className="pb-4">Explore How Data Flows from Water Sources</Typography>
                        <Typography variant="body1" className="pb-4">Water sources include surface water and ground water from which water flows into the system.</Typography>
                        <br />
                        <Typography variant="body2" className="mb-4">Begin by selecting a source by name.</Typography>
                        <Button
                            variant="text"
                            onClick={handleClick}
                            className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                            id="dropdown-button"
                        >
                            {selectedItem} <ChevronDown size={18} className="ml-1" />
                        </Button>

                        {/* Go Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="contained"
                                onClick={handleGo}
                                disabled={selectedItem === "select a source"} // Disable if default is selected
                                className="bg-blue-600 text-white normal-case shadow-none hover:bg-blue-700"
                            >
                                Go &rarr;
                            </Button>
                        </div>


                        {/* Dropdown Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => handleClose()}
                        >
                            {menuItems.map((item) => (
                                <MenuItem key={item} onClick={() => handleClose(item)}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Paper>
                </div>

                <div className="md:w-3/4">
                    <Paper className="min-h-screen" elevation={2}>
                        {filteredData ? (
                            <DynamicGraph data={filteredData} selected={filteredNode} />
                        ) : (
                            <p className="p-4">Select a source and click "Go" to explore data.</p>
                        )}
                    </Paper>

                </div>
            </main>
        </>
    );
}

export default SourcesPage;
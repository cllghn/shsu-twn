"use client"
import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import React from 'react';
import graphData from '@/data/network-data.json';
import metadata from '@/data/network-meta-data.json';
import { Menu, MenuItem, Button, Paper, Typography, Tabs, Tab, Box } from "@mui/material";
import { ChevronDown } from "lucide-react";
import DynamicGraph from "@/components/Graph/DynamicGraph";
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import InsightsIcon from '@mui/icons-material/Insights';
import ArticleIcon from '@mui/icons-material/Article';
import NodeVolumeScoreCards from "@/components/Scorecards/NodeVolumeScoreCards";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Tooltip from '@mui/material/Tooltip';

import Glossary from "@/components/Glossary/Glossary";
import { scrollToRef } from "@/utils/scrollHelpers";

// Loading component for Suspense fallback
const LoadingFallback = () => (
    <div className="flex justify-center items-center p-8">
        <p>Loading...</p>
    </div>
);

// Main component wrapped with Suspense
const SourcesPage: React.FC = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SourcesPageContent />
        </Suspense>
    );
};

const SourcesPageContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const graphContainerRef = useRef<HTMLDivElement>(null);

    const nodeKeys = Object.keys(metadata.sources.kvs);
    const menuItems = nodeKeys.sort((a, b) => a.localeCompare(b));

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState("select a source"); // Default text
    const [filteredNode, setFilteredNode] = useState(null); // New state for filtered node
    const [filteredData, setFilteredData] = useState(null); // New state for filtered data
    const [triggerUpdate, setTriggerUpdate] = useState(false); // Track when to update the graph
    const open = Boolean(anchorEl);

    function toTitleCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/(^|[\/\-\s])([a-z])/g, (_, sep, char) => sep + char.toUpperCase());
    }

    // Memoize filterDataBySource function to prevent unnecessary recalculations
    const filterDataBySource = useCallback((selected: string) => {
        if (!selected || selected === "select a source") return null;

        // Filter edges where the source matches the provided sourceId
        const titleSelected = toTitleCase(selected);
        const sourceEdges = graphData.elements.edges.filter(edge => edge.data.source === titleSelected);
        const uniqueTargets = Array.from(new Set([...sourceEdges.map(edge => edge.data.target), titleSelected]));
        const filteredEdges = graphData.elements.edges.filter(edge => uniqueTargets.includes(edge.data.source));
        const uniqueNodes = Array.from(new Set([titleSelected, ...uniqueTargets,
            ...filteredEdges.map(edge => edge.data.target)])).filter(Boolean);
        const filteredNodes = graphData.elements.nodes.filter(node => uniqueNodes.includes(node.data.id));

        return {
            elements: {
                nodes: filteredNodes,
                edges: filteredEdges
            }
        };
    }, []);

    // Process URL parameters on component mount
    useEffect(() => {
        if (!searchParams) return;

        const nodeParam = searchParams.get('node');
        if (nodeParam && menuItems.includes(nodeParam)) {
            setSelectedItem(nodeParam);
            const data = filterDataBySource(nodeParam);
            if (data) {
                setFilteredData(data);
                setFilteredNode(nodeParam);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (item) => {
        if (item) setSelectedItem(item); // Update button text on selection
        setAnchorEl(null);
    };

    // Handle the Go button click
    const handleGo = () => {
        if (selectedItem === "select a source") return;

        const data = filterDataBySource(selectedItem);

        if (data) {
            // Update the URL with the selected node
            const params = new URLSearchParams(searchParams.toString());
            params.set('node', selectedItem);
            router.push(`?${params.toString()}`);

            // Update state
            setFilteredData(data);
            setFilteredNode(selectedItem);
            setTriggerUpdate(!triggerUpdate); // Toggle to force graph update
            scrollToRef(graphContainerRef);
        }
    };


    // TabPanel component and support functions
    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`tabpanel-${index}`}
                aria-labelledby={`tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    }
    const [activeTab, setActiveTab] = React.useState(0);
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <>
            <main className='container flex flex-col w-full mt-16 m-28 mx-auto px-24 pt-14 space-y-4'>
                <div>
                    <Paper elevation={2} className="p-6">
                        <Typography variant="h4" className="pb-4">Explore How Data Flows from <Tooltip title="Water sources include surface water and ground water from which water flows into the system." arrow><span className="border-b-2 border-dotted border-[#124559]">Water Sources</span></Tooltip></Typography>
                        <div className="flex flex-col flex-wrap">
                            <Typography variant="body1" className="mb-4">Begin by selecting a source by name. If you don't know which water source to begin with, take a look at this <Link href="/faq?expand=waterSource" className="aPlus mt-3">list of resources.</Link></Typography>
                            <div className="flex flex-row">
                                <Button
                                    variant="text"
                                    onClick={handleClick}
                                    className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                                    id="dropdown-button"
                                >
                                    {selectedItem} <ChevronDown size={18} className="ml-1" />
                                </Button>

                                {/* Go Button */}
                                <div className="flex justify-center pt-4 ml-10">
                                    <Button
                                        variant="outlined"
                                        onClick={handleGo}
                                        disabled={selectedItem === "select a source"}
                                        sx={{
                                            color: '#ffffff',
                                            backgroundColor: '#124559',
                                            borderColor: '#ffffff',
                                            borderRadius: '5px',
                                            '&:hover': {
                                                backgroundColor: '#ffffff',
                                                borderColor: '#124559',
                                                color: '#124559',
                                            },
                                            '&:disabled': {
                                                backgroundColor: 'transparent',
                                                borderColor: '#949494',
                                                color: '#949494',
                                                cursor: 'not-allowed',
                                            },
                                        }}
                                    >
                                        Go &rarr;
                                    </Button>
                                </div>
                            </div>

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

                <div>
                    <Paper className="min-h-screen" elevation={2}>
                        {filteredData ? (
                            <Box sx={{ width: '100%' }}>
                                <div className="py-4 px-6 font-medium text-sm justify-center flex items-center bg-[#124559] text-white">
                                    <InfoIcon />
                                    <div className="px-2" >
                                        The graph below shows how water flows out of the selected water source. It also includes the outputs from any systems directly connected to it, showing where water goes two steps away. Inputs into the water source are not shown because they are not available in the data.
                                    </div>
                                    <InfoIcon />
                                </div>
                
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <div ref={graphContainerRef} className="scroll-mt-24">
<Tabs
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        aria-label="data visualization tabs"
                                    >
                                        <Tab label="Graph View" icon={<ShareIcon />} iconPosition="start" />
                                        <Tab label="Insights" icon={<InsightsIcon />} iconPosition="start" />
                                        <Tab label="Glossary" icon={<ArticleIcon />} iconPosition="start" />
                                    </Tabs>
                                    </div>
                                    
                                </Box>

                                <TabPanel value={activeTab} index={0}>

                                        <DynamicGraph
                                            data={filteredData}
                                            selected={toTitleCase(filteredNode)}
                                        />

                                </TabPanel>


                                <TabPanel value={activeTab} index={1}>
                                    <div className="flex justify-between items-center">
                                        <Typography variant="h5">{<div className="text-semibold">{toTitleCase(filteredNode)} Water Flow Insights</div>}</Typography>
                                    </div>
                                    <div className="flex pt-4 justify-center items-center">
                                        <NodeVolumeScoreCards
                                            data={filteredData}
                                            selected={toTitleCase(filteredNode)}
                                            nodeType="source"
                                        />
                                    </div>

                                </TabPanel>

                                <TabPanel value={activeTab} index={2}>
                                    <div className="flex justify-between items-center">
                                        <Typography variant="h5">{<div className="text-semibold">Glossary of Terms</div>}</Typography>
                                    </div>
                                    <Glossary />
                                </TabPanel>
                            </Box>
                        ) : (
                            <div className="flex py-8 justify-center text-lg items-center">
                                <InfoIcon />
                                <p className="px-2"> Select a source and click "Go " to explore data.</p>
                                <InfoIcon />
                            </div>
                        )}
                    </Paper>

                </div>
            </main>
        </>
    );
}

export default SourcesPage;
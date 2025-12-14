"use client"
import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import React from 'react';
import graphData from '@/data/network-data.json';
import metadata from '@/data/network-meta-data.json';
import { Menu, MenuItem, Button, Paper, Typography, Tabs, Tab, Box, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from "@mui/material";
import { ChevronDown } from "lucide-react";
import DynamicGraph from "@/components/Graph/DynamicGraph";
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import InsightsIcon from '@mui/icons-material/Insights';
import ArticleIcon from '@mui/icons-material/Article';
import NodeVolumeScoreCards from "@/components/Scorecards/NodeVolumeScoreCards";
import { useSearchParams, useRouter } from 'next/navigation';
import Glossary from "@/components/Glossary/Glossary";
import Link from "next/link";
import Tooltip from '@mui/material/Tooltip';
import { scrollToRef } from "@/utils/scrollHelpers";

// Loading component for Suspense fallback
const LoadingFallback = () => (
    <div className="flex justify-center items-center p-8">
        <p>Loading...</p>
    </div>
);

// Main component wrapped with Suspense
const SystemsPage: React.FC = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SystemsPageContent />
        </Suspense>
    );
};

const SystemsPageContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const graphContainerRef = useRef<HTMLDivElement>(null);

    // Use keys instead of values
    const nodeKeys = Object.keys(metadata.systems.kvs);
    const menuItems = nodeKeys.sort((a, b) => {
        const nameA = metadata.systems.kvs[a];
        const nameB = metadata.systems.kvs[b];
        return nameA.localeCompare(nameB);
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState("select a system");
    const [filteredNode, setFilteredNode] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [triggerUpdate, setTriggerUpdate] = useState(false);
    const [searchMode, setSearchMode] = useState<'name' | 'tbd'>('name');
    const open = Boolean(anchorEl);

    function toTitleCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/(^|[\/\-\s])([a-z])/g, (_, sep, char) => sep + char.toUpperCase());
    }

    const filterDataBySource = useCallback((selectedKey: string) => {
        if (!selectedKey || selectedKey === "select a system") return null;

        const matchedKey = selectedKey;

        const waterInputs = graphData.elements.edges
            .filter(edge => edge.data.target === matchedKey);

        const waterOutputs = graphData.elements.edges
            .filter(edge => edge.data.source === matchedKey);

        const edgeIds = Array
            .from(new Set([...waterOutputs.map(edge => edge.data.id),
            ...waterInputs.map(edge => edge.data.id)]
            ));

        const filteredEdges = graphData.elements.edges.filter(edge => edgeIds.includes(edge.data.id));
        const nodeIds = Array
            .from(new Set([...waterOutputs.map(edge => edge.data.target),
            ...waterInputs.map(edge => edge.data.source),
                matchedKey]
            ));
        const filteredNodes = graphData.elements.nodes
            .filter(node => nodeIds.includes(node.data.id));

        return {
            elements: {
                nodes: filteredNodes,
                edges: filteredEdges
            }
        };
    }, []);

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
        if (item) setSelectedItem(item);
        setAnchorEl(null);
    };

    const handleGo = () => {
        if (selectedItem === "select a system") return;

        const data = filterDataBySource(selectedItem);

        if (data) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('node', selectedItem);
            router.push(`?${params.toString()}`);

            setFilteredData(data);
            setFilteredNode(selectedItem);
            setTriggerUpdate(!triggerUpdate);
            scrollToRef(graphContainerRef);
            
        }
    };

    const handleSearchModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchMode(event.target.value as 'name' | 'tbd');
    };

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
                        <Typography variant="h4" className="pb-4">Explore How Data Flows through <Tooltip title="Water systems are the nodes involved in the sale and distribution in the network." arrow><span className="border-b-2 border-dotted border-[#124559]">Water Systems</span></Tooltip></Typography>
                        <Box>
                            {/* Radio buttons for search mode */}
                            <FormControl component="fieldset" className="mb-4">
                                <FormLabel component="legend">Search mode:</FormLabel>
                                <RadioGroup
                                    row
                                    value={searchMode}
                                    onChange={handleSearchModeChange}
                                >
                                    <FormControlLabel value="name" control={<Radio />} label="By Name" />
                                    <FormControlLabel value="tbd" control={<Radio />} label="By Geography" />
                                </RadioGroup>
                            </FormControl>

                            <div className="flex flex-col flex-wrap">


                                {searchMode === 'name' && (

                                    <div className="flex flex-col">
                                        <Typography variant="body1" className="mb-4">Begin by selecting a system by name. If you don't know which water system to begin with, take a look at this <Link href="/faq?expand=waterSource" className="aPlus mt-3">list of resources.</Link></Typography>
                                        <div className="flex flex-row space-x-2 items-center">
                                            <Button
                                                variant="text"
                                                onClick={handleClick}
                                                className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                                                id="dropdown-button"
                                            >
                                                {selectedItem === "select a system"
                                                    ? selectedItem
                                                    : metadata.systems.kvs[selectedItem]
                                                } <ChevronDown size={18} className="ml-1" />
                                            </Button>

                                            <div className="flex justify-start pt-4">
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleGo}
                                                    disabled={selectedItem === "select a system"}
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
                                )}
                            </div>
                        </Box>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => handleClose()}
                        >
                            {menuItems.map((key) => (
                                <MenuItem key={key} onClick={() => handleClose(key)}>
                                    {metadata.systems.kvs[key]}
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
                                        <div className="px-2">
                                            The graph below shows how water flows into and out of the selected water system. It only includes the connections directly linked to that system.
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
                                        selected={filteredNode}
                                    />
                                </TabPanel>

                                <TabPanel value={activeTab} index={1}>
                                    <div className="flex justify-between items-center">
                                        <Typography variant="h6">
                                            <div className="text-semibold">
                                                {toTitleCase(metadata.systems.kvs[filteredNode])} Water Flow Insights
                                            </div>
                                        </Typography>
                                    </div>
                                    <div className="flex pt-4 justify-center items-center">
                                        <NodeVolumeScoreCards
                                            data={filteredData}
                                            selected={filteredNode}
                                            nodeType="systems"
                                        />
                                    </div>
                                </TabPanel>

                                <TabPanel value={activeTab} index={2}>
                                    <div className="flex justify-between items-center">
                                        <Typography variant="h5"><div className="text-semibold">Glossary of Terms</div></Typography>
                                    </div>
                                    <Glossary />
                                </TabPanel>
                            </Box>
                        ) : (
                            <div className="flex py-8 justify-center text-lg items-center">
                                <InfoIcon />
                                <p className="px-2"> Select a system and click "Go " to explore data.</p>
                                <InfoIcon />
                            </div>
                        )}
                    </Paper>

                </div>
            </main>
        </>
    );
}

export default SystemsPage;

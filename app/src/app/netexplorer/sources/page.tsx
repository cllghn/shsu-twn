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
import SignpostIcon from '@mui/icons-material/Signpost';

import Glossary from "@/components/Glossary/Glossary";
import { scrollToRef } from "@/utils/scrollHelpers";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from '@mui/icons-material/Search';

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

    // State for text search
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSources, setFilteredSources] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isValidSelection, setIsValidSelection] = useState(false);

    const graphContainerRef = useRef<HTMLDivElement>(null);

    const [sourceTour, setSourceTour] = useState<any>(null);
    useEffect(() => {
        import("@/components/Guide/sourceGuide").then((module) => {
            setSourceTour(module.sourceTour);
        });
    }, []);

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
        // const titleSelected = selected; //toTitleCase(selected); <- This was 
        // removed because it failed to capitalize after the ( character
        const sourceEdges = graphData.elements.edges.filter(edge => edge.data.source === selected);
        const uniqueTargets = Array.from(new Set([...sourceEdges.map(edge => edge.data.target), selected]));
        const filteredEdges = graphData.elements.edges.filter(edge => uniqueTargets.includes(edge.data.source));
        const uniqueNodes = Array.from(new Set([selected, ...uniqueTargets,
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
            setSearchTerm(nodeParam);
            setIsValidSelection(true);
            const data = filterDataBySource(nodeParam);
            if (data) {
                setFilteredData(data);
                setFilteredNode(nodeParam);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleClose = (item) => {
        if (item) setSelectedItem(item); // Update button text on selection
        setAnchorEl(null);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedIndex(-1);
        setIsValidSelection(false);
        setSelectedItem("select a source");

        if (value.trim() === "") {
            setFilteredSources([]);
            setShowDropdown(false);
        } else {
            const filtered = menuItems.filter(source =>
                source.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSources(filtered);
            setShowDropdown(true);
        }
    };

    const handleSelectOption = (source) => {
        setSearchTerm(source);
        setSelectedItem(source);
        setShowDropdown(false);
        setSelectedIndex(-1);
        setIsValidSelection(true);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || filteredSources.length === 0) {
            if (e.key === 'Enter' && isValidSelection) {
                handleGo();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSources.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectOption(filteredSources[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Handle the Go button click
    const handleGo = () => {
        if (selectedItem === "select a source") return;

        const data = filterDataBySource(selectedItem);

        if (data) {
            // Update the URL with the selected node
            const params = new URLSearchParams(searchParams.toString());
            params.set('node', selectedItem);
            router.replace(`?${params.toString()}`, { scroll: false });

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
                        <div className="flex justify-between">
                            <Typography variant="h4" className="pb-4">Explore How Data Flows from <Tooltip title="Water sources include surface water and ground water from which water flows into the system." arrow><span className="border-b-2 border-dotted border-[#124559]">Water Sources</span></Tooltip></Typography>
                            <Button
                                variant="outlined"
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
                                onClick={() => sourceTour.start()}>
                                <SignpostIcon sx={{ mr: 1 }} />
                                Tour
                            </Button>

                        </div>
                        <div className="flex flex-col flex-wrap" id="search-mode-box">
                            <Typography variant="body1" className="mb-4">Begin by selecting a source by name. If you don't know which water source to begin with, take a look at this <Link href="/faq?expand=waterSource" className="aPlus mt-3">list of resources.</Link></Typography>
                            <div className="flex flex-row space-x-2 items-center pt-5">
                                <div className="flex-grow relative" style={{ maxWidth: '500px' }}>
                                    <TextField
                                        variant="outlined"
                                        placeholder="Search for water sources..."
                                        fullWidth
                                        size="small"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyDown}
                                        id="dropdown-button"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#ffffff',
                                                '&:hover fieldset': {
                                                    borderColor: '#124559',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#124559',
                                                },
                                            },
                                        }}
                                    />
                                    {/* Dropdown */}
                                    {showDropdown && filteredSources.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                            {filteredSources.slice(0, 10).map((source, index) => (
                                                <div
                                                    key={source}
                                                    className={`px-4 py-2 cursor-pointer transition-colors ${index === selectedIndex
                                                        ? 'bg-[#124559] text-white'
                                                        : 'hover:bg-gray-100'
                                                        }`}
                                                    onClick={() => handleSelectOption(source)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                >
                                                    <span className="font-medium">{source}</span>
                                                </div>
                                            ))}
                                            {filteredSources.length > 10 && (
                                                <div className="px-4 py-2 text-gray-500 text-sm italic">
                                                    ... and {filteredSources.length - 10} more results
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="outlined"
                                    onClick={handleGo}
                                    disabled={!isValidSelection}
                                    sx={{
                                        color: '#ffffff',
                                        backgroundColor: '#124559',
                                        borderColor: '#ffffff',
                                        borderRadius: '5px',
                                        minWidth: '80px',
                                        '&:hover': {
                                            backgroundColor: '#ffffff',
                                            borderColor: '#124559',
                                            color: '#124559',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#cccccc',
                                            color: '#666666',
                                        },
                                    }}
                                >
                                    Go &rarr;
                                </Button>
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
                </div >

                <div id='results-area'>
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
                                        <Typography variant="h5" className="py-3 text-center text-[#124559]">{filteredNode ? filteredNode : ''} Water Source Data Visualization</Typography>
                                        <Tabs
                                            value={activeTab}
                                            onChange={handleTabChange}
                                            aria-label="data visualization tabs"
                                            centered
                                        >
                                            <Tab label="Graph View" icon={<ShareIcon />} iconPosition="start"
                                                id="graph-area" />
                                            <Tab label="Insights" icon={<InsightsIcon />} iconPosition="start"
                                                id="insights-area" />
                                            <Tab label="Glossary" icon={<ArticleIcon />} iconPosition="start"
                                                id="glossary-area" />
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
            </main >
        </>
    );
}

export default SourcesPage;
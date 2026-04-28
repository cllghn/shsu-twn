"use client"
import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import React from 'react';
import graphData from '@/data/network-data.json';
import metadata from '@/data/network-meta-data.json';
import geoNodes from '@/data/geo-nodes.json';
import { Menu, MenuItem, Button, Paper, Typography, Tabs, Tab, Box, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from "@mui/material";
import { ChevronDown } from "lucide-react";
import DynamicGraph from "@/components/Graph/DynamicGraph";
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import InsightsIcon from '@mui/icons-material/Insights';
import ArticleIcon from '@mui/icons-material/Article';
import SignpostIcon from '@mui/icons-material/Signpost';
import SearchIcon from '@mui/icons-material/Search';
import NodeVolumeScoreCards from "@/components/Scorecards/NodeVolumeScoreCards";
import { useSearchParams, useRouter } from 'next/navigation';
import Glossary from "@/components/Glossary/Glossary";
import Link from "next/link";
import Tooltip from '@mui/material/Tooltip';
import { scrollToRef } from "@/utils/scrollHelpers";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

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

    // Add state for the tour
    const [systemTour, setSystemTour] = useState<any>(null);

    // Dynamically import the tour on client side only
    useEffect(() => {
        import("@/components/Guide/systemGuide").then((module) => {
            setSystemTour(module.systemTour);
        });
    }, []);

    // Use keys instead of values
    const nodeKeys = Object.keys(metadata.systems.kvs);
    const menuItems = nodeKeys.sort((a, b) => {
        const nameA = metadata.systems.kvs[a];
        const nameB = metadata.systems.kvs[b];
        return nameA.localeCompare(nameB);
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState("select a system");
    const [countyAnchorEl, setCountyAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCounty, setSelectedCounty] = useState("select a county");
    const [systemAnchorEl, setSystemAnchorEl] = useState<null | HTMLElement>(null);
    const [filteredNode, setFilteredNode] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [triggerUpdate, setTriggerUpdate] = useState(false);
    const [searchMode, setSearchMode] = useState<'name' | 'geo'>('name');

    // State for text search
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSystems, setFilteredSystems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isValidSelection, setIsValidSelection] = useState(false);

    const open = Boolean(anchorEl);
    const countyMenuOpen = Boolean(countyAnchorEl);
    const systemMenuOpen = Boolean(systemAnchorEl);

    function toTitleCase(str: string): string {
        if (!str) return '';
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
            setSearchTerm(metadata.systems.kvs[nodeParam]);
            setIsValidSelection(true);
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedIndex(-1);
        setIsValidSelection(false);
        setSelectedItem("select a system");

        if (value.trim() === "") {
            setFilteredSystems([]);
            setShowDropdown(false);
        } else {
            const filtered = menuItems.filter(key =>
                metadata.systems.kvs[key].toLowerCase().includes(value.toLowerCase())
            ).map(key => ({ key, name: metadata.systems.kvs[key] }));
            setFilteredSystems(filtered);
            setShowDropdown(true);
        }
    };

    const handleSelectOption = (item) => {
        setSearchTerm(item.name);
        setSelectedItem(item.key);
        setShowDropdown(false);
        setSelectedIndex(-1);
        setIsValidSelection(true);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || filteredSystems.length === 0) {
            if (e.key === 'Enter' && isValidSelection) {
                handleGo();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSystems.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectOption(filteredSystems[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleGo = () => {
        if (selectedItem === "select a system") return;

        const data = filterDataBySource(selectedItem);

        if (data) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('node', selectedItem);
            router.replace(`?${params.toString()}`, { scroll: false });

            setFilteredData(data);
            setFilteredNode(selectedItem);
            setTriggerUpdate(!triggerUpdate);
            scrollToRef(graphContainerRef);
        }
    };

    const countyMenuItems = Object.keys(geoNodes).sort((a, b) => a.localeCompare(b));

    const handleCountySelect = (county: string) => {
        setSelectedCounty(county);
        setCountyAnchorEl(null);
        setSelectedItem("select a system");
    };

    const handleSystemSelect = (systemId: string) => {
        setSelectedItem(systemId);
        setSystemAnchorEl(null);
    };

    const handleSearchModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchMode(event.target.value as 'name' | 'geo');

        // Reset selections when switching modes
        setSelectedItem("select a system");
        setSelectedCounty("select a county");
        setSearchTerm("");
        setFilteredSystems([]);
        setShowDropdown(false);
        setIsValidSelection(false);
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
                        <div className="flex justify-between">
                            <Typography variant="h4" className="pb-4">Explore How Data Flows through <Tooltip title="Water systems are the nodes involved in the sale and distribution in the network." arrow><span className="border-b-2 border-dotted border-[#124559]">Water Systems</span></Tooltip></Typography>
                            <Tooltip title="Start a guided tour of the water system visualizer" arrow>
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
                                    onClick={() => systemTour.start()}>
                                    <SignpostIcon sx={{ mr: 1 }} />
                                    Tour
                                </Button>
                            </Tooltip>
                        </div>
                        <Box id='search-mode-box'>
                            {/* Radio buttons for search mode */}
                            <FormControl component="fieldset" className="mb-4">
                                <FormLabel component="legend">Search mode:</FormLabel>
                                <RadioGroup
                                    row
                                    value={searchMode}
                                    onChange={handleSearchModeChange}
                                >
                                    <FormControlLabel value="name" control={<Radio />} label="By Name" />
                                    <FormControlLabel value="geo" control={<Radio />} label="By Geography" />
                                </RadioGroup>
                            </FormControl>

                            <div className="flex flex-col flex-wrap">
                                {searchMode === 'name' && (
                                    <div className="flex flex-col">
                                        <Typography variant="body1" className="mb-4">
                                            Begin by selecting a system by name. If you don't know which water system to begin with, take a look at this <Link href="/faq?expand=waterSource" className="aPlus">list of resources.</Link>
                                        </Typography>
                                        <div className="flex flex-row space-x-2 items-center pt-5">
                                            <div className="flex-grow relative" style={{ maxWidth: '500px' }}>
                                                <TextField
                                                    variant="outlined"
                                                    placeholder="Search for water systems..."
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
                                                {showDropdown && filteredSystems.length > 0 && (
                                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                                        {filteredSystems.slice(0, 10).map((item, index) => (
                                                            <div
                                                                key={item.key}
                                                                className={`px-4 py-2 cursor-pointer transition-colors ${index === selectedIndex
                                                                    ? 'bg-[#124559] text-white'
                                                                    : 'hover:bg-gray-100'
                                                                    }`}
                                                                onClick={() => handleSelectOption(item)}
                                                                onMouseEnter={() => setSelectedIndex(index)}
                                                            >
                                                                <span className="font-medium">{item.name}</span>
                                                            </div>
                                                        ))}
                                                        {filteredSystems.length > 10 && (
                                                            <div className="px-4 py-2 text-gray-500 text-sm italic">
                                                                ... and {filteredSystems.length - 10} more results
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="outlined"
                                                onClick={handleGo}
                                                id="go-button"
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
                                )}
                                {searchMode === 'geo' && (
                                    <div className="flex flex-col">
                                        <Typography variant="body1" className="mb-4">
                                            Select a county to view water systems within that geography.
                                        </Typography>
                                        <div className="flex flex-row space-x-2 items-center pt-5">
                                            {/* County Selection */}
                                            <Button
                                                variant="text"
                                                onClick={(e) => setCountyAnchorEl(e.currentTarget)}
                                                className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                                            >
                                                {selectedCounty} <ChevronDown size={18} className="ml-1" />
                                            </Button>

                                            {/* System Selection - only show after county selected */}
                                            {selectedCounty !== "select a county" && (
                                                <>
                                                    <Button
                                                        variant="text"
                                                        onClick={(e) => setSystemAnchorEl(e.currentTarget)}
                                                        className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                                                    >
                                                        {selectedItem === "select a system"
                                                            ? selectedItem
                                                            : metadata.systems.kvs[selectedItem]
                                                        } <ChevronDown size={18} className="ml-1" />
                                                    </Button>

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
                                                </>
                                            )}
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

                        <Menu
                            anchorEl={countyAnchorEl}
                            open={countyMenuOpen}
                            onClose={() => setCountyAnchorEl(null)}
                        >
                            {countyMenuItems.map((county) => (
                                <MenuItem key={county} onClick={() => handleCountySelect(county)}>
                                    {county}
                                </MenuItem>
                            ))}
                        </Menu>

                        <Menu
                            anchorEl={systemAnchorEl}
                            open={systemMenuOpen}
                            onClose={() => setSystemAnchorEl(null)}
                        >
                            {selectedCounty !== "select a county" &&
                                (geoNodes as Record<string, any[]>)[selectedCounty]?.map((systemsInCounty: object) => (
                                    console.log("Rendering system menu item for ID:", systemsInCounty.id),
                                    <MenuItem key={systemsInCounty.id} onClick={() => handleSystemSelect(systemsInCounty.id)}>
                                        {
                                            (metadata.systems.kvs as Record<string, string>)[systemsInCounty.id] || systemsInCounty.id
                                        }
                                    </MenuItem>
                                ))
                            }
                        </Menu>
                    </Paper>
                </div>

                <div id='results-area'>
                    <Paper className="min-h-screen" elevation={2}>
                        {filteredData ? (
                            <Box sx={{ width: '100%' }}>

                                <div className="py-4 px-6 font-medium text-sm justify-center flex items-center bg-[#124559] text-white">
                                    <InfoIcon />
                                    <div className="px-2">
                                        The graph below shows how water flows into and out of the selected water system. It only includes the connections directly linked to that system.
                                        <i className="font-semibold text-white">
                                            &nbsp;Results should be interpreted cautiously, as self-reported data may be incomplete or missing.
                                        </i>
                                    </div>
                                    <InfoIcon />
                                </div>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <div ref={graphContainerRef} className="scroll-mt-24">
                                        <Typography variant="h5" className="py-3 text-center text-[#124559]">{filteredNode ? toTitleCase(metadata.systems.kvs[filteredNode]) : ''} Water System Data Visualization</Typography>
                                        <Tabs
                                            value={activeTab}
                                            onChange={handleTabChange}
                                            aria-label="data visualization tabs"
                                            centered
                                        >
                                            <Tab label="Graph View" icon={<ShareIcon />} iconPosition="start" id="graph-area" />
                                            <Tab label="Insights" icon={<InsightsIcon />} iconPosition="start" id="insights-area" />
                                            <Tab label="Glossary" icon={<ArticleIcon />} iconPosition="start" id="glossary-area" />
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
                                                {filteredNode ? toTitleCase(metadata.systems.kvs[filteredNode]) : ''} Water Flow Insights
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
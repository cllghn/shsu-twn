import React, { useState } from "react";
import { Drawer, FormControlLabel, Switch } from "@mui/material";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';


interface GraphConfigModalProps {
    open: boolean;
    onClose: () => void;
    onLayoutChange: (layout: string) => void;
    defaultLayout?: string;
    defaultShowLabels?: boolean;
    onLabelToggle: (showLabels: boolean) => void;
    defaultShowEdgeLabels?: boolean;
    onEdgeLabelToggle: (showEdgeLabels: boolean) => void;
    nodeSizeOption: string;
    onNodeSizeOptionChange: (option: string) => void;
}

const GraphConfigModal: React.FC<GraphConfigModalProps> = ({
    open,
    onClose,
    onLayoutChange,
    defaultLayout = "cola",
    onLabelToggle,
    defaultShowLabels = true,
    defaultShowEdgeLabels = false,
    onEdgeLabelToggle,
    nodeSizeOption = "Constant",
    onNodeSizeOptionChange
}) => {
    const [selectedLayout, setSelectedLayout] = useState(defaultLayout);
    const [showLabels, setShowLabels] = useState(defaultShowLabels);
    const [showEdgeLabels, setEdgeShowLabels] = useState(defaultShowEdgeLabels);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        setSelectedLayout(value);
        onLayoutChange(value);
    };

    const handleLabelToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setShowLabels(isChecked);
        onLabelToggle(isChecked); // Notify parent
    };

    const handleEdgeLabelToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setEdgeShowLabels(isChecked);
        onEdgeLabelToggle(isChecked); // Notify parent
    };

    const handleDrawerClose = () => {
        onClose(); // Close the drawer
    };

    return (
        <Drawer open={open} onClose={handleDrawerClose} anchor="right">
            <div className="p-5 max-w-96">
                <h1 className="text-2xl pb-5">Graph Configuration</h1>
                <p>Below is a small set of options for modifying the graph's appearance, organized by the graph elements they control.</p>
                <Divider className="py-5">
                    <Chip label="Graph Options" size="small" />
                </Divider>
                <p className="pb-5">Select a layout for the graph:</p>
                <div>
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel id="layout-select-label">Layout</InputLabel>
                            <Select
                                labelId="layout-select-label"
                                id="layout-select"
                                value={selectedLayout}
                                label="Layout"
                                onChange={handleChange}
                            >
                                {/* <MenuItem value="cose">CoSE</MenuItem> */}
                                <MenuItem value="cola">Force-directed layout</MenuItem>
                                <MenuItem value="dagre">Hierarchical layout</MenuItem>
                                {/* Add more layout options here */}
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <Divider className="py-5">
                    <Chip label="Node Options" size="small" />
                </Divider>
                <div className="pb-5">
                    <FormControlLabel
                        control={
                            <Switch checked={showLabels} onChange={handleLabelToggle} />
                        }
                        label="Show Node Labels"
                    />
                </div>
                <p className="pb-5">Select how to size the nodes:</p>
                <div>
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel id="node-size-select-label"> Size</InputLabel>
                            <Select
                                labelId="node-size-select-label"
                                id="node-size-select"
                                value={nodeSizeOption}
                                onChange={(event) => onNodeSizeOptionChange(event.target.value as string)}
                            >
                                <MenuItem value="Constant">Constant</MenuItem>
                                <MenuItem value="OutDegree">Out Degree</MenuItem>
                                <MenuItem value="InDegree">In Degree</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <Divider className="py-5">
                    <Chip label="Edge Options" size="small" />
                </Divider>
                <div className="pb-5">
                    <FormControlLabel
                        control={
                            <Switch checked={showEdgeLabels} onChange={handleEdgeLabelToggle} />
                        }
                        label="Show Edge Labels"
                    />
                </div>
            </div>
        </Drawer>
    );
};

export default GraphConfigModal;

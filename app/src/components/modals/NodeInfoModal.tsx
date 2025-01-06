import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

interface NodeInfoModalProps {
    open: boolean;
    nodeData: {
        id: string;
        name: string;
        county: string;
        population: number;
    } | null;
    onClose: () => void;
}

const NodeInfoModal: React.FC<NodeInfoModalProps> = ({ open, nodeData, onClose }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    border: "2px solid #000",
                    boxShadow: 24,
                    p: 4,
                    zIndex: 100,
                }}
            >
                {nodeData ? (
                    <>
                        <h2 className="text-xl pb-5">Node Information</h2>
                        {nodeData.id !== nodeData.name && (
                            <p>
                                <strong>ID:</strong> {nodeData.id}
                            </p>
                        )}
                        <p>
                            <strong>Name:</strong> {nodeData.name}
                        </p>
                        {nodeData.county && (
                            <p>
                                <strong>County:</strong> {nodeData.county}
                            </p>
                        )}
                        {/* <p>
                            <strong>Population:</strong> {nodeData.population.toLocaleString()}
                        </p> */}
                    </>
                ) : (
                    <p>No node data available.</p>
                )}
            </Box>
        </Modal>
    );
};

export default NodeInfoModal;

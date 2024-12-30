
import React from "react";
import { Drawer } from "@mui/material";

interface GraphInfoModalProps {
    open: boolean;
    onClose: () => void;
}

const GraphInfoModal: React.FC<GraphInfoModalProps> = ({
    open,
    onClose
}) => {
    const handleClose = () => {
        onClose();
    };
    return (
        <Drawer open={open} onClose={handleClose} anchor="left">
            <div className="p-5 max-w-96">
                <h1 className="text-2xl pb-5">
                    Texas Water Network Visualizer
                </h1>
                <p>
                    This interactive network visualization displays historical water interdependencies between water systems within the state of Texas.
                </p>
                <br />
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus volutpat dapibus justo quis lobortis. Praesent sagittis dictum arcu, vitae pharetra nisl molestie nec. Integer lobortis laoreet quam, at vestibulum tellus fermentum ac. Suspendisse lorem urna, interdum non rhoncus quis, gravida ut leo. In semper eu sapien ut laoreet.
                </p>
                <h2 className="text-2xl py-5">
                    Data Sources
                </h2>
                <p>
                    The data for this project was provided by ...
                </p>
                <h2 className="text-2xl py-5">
                    Sponsors
                </h2>
                <p>
                    The project was funded by the Institute for Homeland Security at Sam Houston State University.
                </p>
                <div className="flex justify-center items-center">
                    <img src="shsu-ihs.jpg" className="w-1/2" />
                </div>
            </div>
        </Drawer >
    );
};

export default GraphInfoModal;

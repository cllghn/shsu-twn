import React from "react";
import Typography from "@mui/material/Typography";
import CircleIcon from '@mui/icons-material/Circle';

const Glossary: React.FC = () => {
    return (
        <div className="pt-4 px-10">
            <p>
                The graph on this page represents a set of relationships among water entities in Texas. To generate these data, we drew from water intake and sales data provided by the Texas Water Development Board (TWDB). This guide provides key terms and definitions to help you understand the network graph and what is depicted within it.
            </p>
            <div className="space-y-4">
                <Typography variant="h6" className="text-semibold py-4">
                    Graph Terminology
                </Typography>
                <p>
                    <b>Network: </b>A network graph is a visual representation of a set of entities and their relationships. In this case, the entities are water sources and systems, and the relationships are the flow of water between them.
                </p>
                <p>
                    <b>Nodes: </b>These are the entities or objects that form part of the network. In this case, we may have two different kinds of nodes: <CircleIcon sx={{ fontSize: 'small', fill: "#01161E" }} /> sources and <CircleIcon sx={{ fontSize: 'small', fill: "#53899D" }} /> systems. Water sources (e.g., aquifers, reservoirs, groundwater, etc.) represent bodies of water that supply the water used for residential, industrial, agricultural, and other purposes. On the other hand, water systems (e.g., cities, utility districts, etc.) represent the entities that use or distribute the water. In this dynamic visualization, properties about an nodes (e.g., name, water flow totals) can by accessed by hovering over it. Additionally, by clicking and holing on the node, you will be prompted to jump to the node's page, where you can find more information about it.
                </p>
                <p>
                    <b>Edges: </b>These represent the connections or pathways between nodes in the network. An edge shows how water flows from one node to another — for example, from a water source to an intermediary, or from one system to another. Edges in this graph have direction, depicted by an arrow. In this dynamic visualization, properties about an edge (e.g., volume, year of transaction, type, etc.) can by accessed by hovering over it.
                </p>
            </div>
            <div className="space-y-4">
                <Typography variant="h6" className="text-semibold py-4">
                    Water Flow Terminology
                </Typography>
                <p>
                    <b>Flow Type: </b>For this graph depiction, we pull water from sales and intake records. As such, if an edge type is listed as "Sale" it denotes that this data point was taken from the water sales data provided by TWDB. If the edge type is listed as "Intake" it denotes that this data point was taken from the water intake data.
                </p>
                <p>
                    <b>Volume: </b>All water volumes are recorded in gallons. When a value was not included on the underlying records, it is reported back with a dash. When adding up volumes, the graph will only sum up the values that are available. For example, if a node has 3 edges with volumes of 100, 200, and 300 gallons, the total volume for that node will be 600 gallons. However, if one of those edges is missing a volume value (e.g., 100, -, and 300), the total volume for that node will be 400 gallons. 
                </p>
                <p>
                    <b>Water Supply Method: This describes how a system obtains its water. The two main supply types are self-supply and purchased.</b> 
                </p>
                <p>
                    <b>Water Type: This indicates the general classification of a water source based on where the water originates. There are two main categories, groundwater and surface water. If left blank, the water type is either unknown or not specified.</b> 
                </p>
            </div>
        </div>
    );
}

export default Glossary;

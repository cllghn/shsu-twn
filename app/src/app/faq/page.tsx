"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Create a separate component that uses useSearchParams
const FAQContent = () => {
    const searchParams = useSearchParams();
    const expandWater = searchParams.get("expand") === "waterSource";
    const expandData = searchParams.get("expand") === "dataSource";
    const [expandedWater, setExpandedWater] = useState(false);
    const [expandedData, setExpandedData] = useState(false);

    useEffect(() => {
        if (expandWater) {
            setExpandedWater(true);
        }
    }, [expandWater]);

    useEffect(() => {
        if (expandData) {
            setExpandedData(true);
        }
    }, [expandData]);
    
    return (
        <>
            <main className='container flex flex-col w-full m-28 mx-auto px-24 pt-14 '>
                <h1 className='text-4xl font-bold text-left pb-10 animate-fadeIn'>Frequently Asked Questions</h1>
                <div className="animate-fadeInSlow">
                    <p>This page includes questions and answers to common questions about this website.</p>
                </div>
                <div className="w-full py-5 mx-auto animate-fadeInSlow">
                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">What is the Texas Water Network Explorer?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">
                                    The Texas Water Networks Explorer (TWNet) is a publicly accessible tool designed to enhance how policymakers and decision-makers analyze water data. It maps the interactions among water entities across Texas, illustrating how water is acquired, sold, and redistributed. Using data from the Texas Water Development Board's (TWDB) Water Use Survey, TWNet leverages network analysis methods and visualization techniques to transform a complex web of thousands of water users into clear, intuitive graphs and insights. These insights help policymakers quickly understand water distribution patterns, identify key stakeholders, and make informed decisions to improve water management.
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">How does the application provide value to policy-makers?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">    
                                This tool distills thousands of data points into intuitive visual analytics, simplifying how policymakers conceptualize water usage across Texas. Rather than simply asking, "How much water is used?" the tool broadens the scope to: "Who uses it, and who do they rely on? What kinds of uses interlink water users? And how much water is exchanged?" By applying a network-based approach, users can visualize and interpret the intricate relationships between water entities—such as water intake from sources, sales to industries and municipalities, and retail distribution to other systems. This framing enables policymakers to quickly identify strengths, dependencies and weaknesses within the network and better understand how water moves through the system. In turn, this expanded insight supports more data-driven decision-making in key areas, including developing system resilience strategies, risk management, infrastructure planning, and the development of policies and regulations governing water use.
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">How does the tool derive relationships from TWDB's data?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                TWNet makes use of data provided by the TWDB on Public Water System (PWS) intakes, sales, and retail water information. From the raw data, our tool converts complex water system data into an intuitive flow network visualization by mapping two critical types of water movement in Texas:
                                <ol className="pt-2 pl-2">
                                    <li><b>1. Water Sources to Systems:</b> These are derived from the records for water intake (self-supplied and purchased) for all Public Water Systems surveyed. This relation captures where water moves from a source (like an aquifer or surface water) to a water system. In turn, this shows where our water originates and which systems depend on each source.</li>
                                    <li><b>2. System-to-System Transfers:</b> These are derived from the records for water sales (wholesale to other PWS or industrial systems) reported by seller and buyer through the water use survey. This relationship captures where water moves between water systems in the network, revealing the interconnection between water systems across Texas.</li>
                                </ol>                   
                                <p className="pt-2">
                                For both types of relationships we also capture, when possible, water volumes being transferred in Texas. This allows us to quantify the strength of relationships. Taken as a whole, these relationships and volumes enable us to show how water moves from natural sources through various systems and ultimately to end users.
                                </p>
                                <p className="pt-2">
                                In addition to characteristics of each relationship, like water volume and frequency, the TWDB data is also used to extract contextual characteristics about the water entities in the network, enriching our understanding of each entity in the network by adding important information beyond just relationships. For example, water sources and water systems are geographically referenced. Similarly, when applicable, data on retail water connections and populations served are included to provide users with relevant data about public water systems in the network.
                                </p>
                                <p className="pt-2 pb-4">
                                In all, the tool leverages relational data to depict interdependencies and flows, while pairing this with contextual data. What emerges is a clear picture of Texas's water system, transforming thousands of data points into actionable insights to support water resource planning and policy-making.
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">What is a "network" in this context? </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">
                                   In this context, a network is a system of relationships between water entities in Texas. At a high level, those relationships represent the flow of water. Those can be further defined based on whether they connect a source-to-system (intake) or system-to-system (sales). 
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">Why do we need to visualize water systems as a network? </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                            Network visualizations are useful in exploratory data analysis. Have you ever heard the expression "a picture tells a thousand words?". Data visualization makes it easier to identify patterns, trends, and outliers in a dataset. For example: 
                            <ol className="pb-4 pt-2 pl-2">
                                <li>&bull; A network might center around a handful of nodes. A centralized network has advantages and disadvantages. For instance, a centralized network has clear hubs that can efficiently distribute resources. However, the downside is that if a central node fails, the entire system can become vulnerable to disruptions. On the other hand, a decentralized water network distributes control and flow across multiple nodes, increasing resilience to failures and making the system more adaptable to local needs. However, this can also introduce complexities in coordination and maintenance. Visualizing the data is the first step in identifying the advantages and disadvantages of a network.</li>
                                <li>&bull; A network visualization might highlight disconnection between components in the networks. For example, isolated nodes or clusters might indicate areas with limited access to water resources, inefficiencies in distribution, or vulnerabilities in the system. For instance, if a community's water supply relies on a single pipeline that is not well-connected to alternative sources, a failure in that pipeline could leave residents without water.</li>
                            </ol>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">What do the lines and dots in the visualization represent? </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">
                                    The lines are connections that represent the flow of water from one water entity to another. Those relationships connect a source-to-system (intake) or system-to-system (sales). The dots represent water entities, those can be water sources (e.g., aquifers or surface water) or water systems. 
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg"
                    expanded={expandedWater} 
                    onChange={() => setExpandedWater(!expandedWater)}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">What if I don't know which water system or source am I interested in?
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p>
                                    If you are unsure what water system or source you are interested in, then take a look at the list of resource below. These will allow you to enter an address or click on a map to find out where water comes from and/or who provides it.
                                </p>
                                <ol className="pt-2 pb-4 pl-2">
                                    <li>&bull; <a href = "https://www3.twdb.texas.gov/apps/WaterServiceBoundaries" target="_blank" className='aPlus'>This site will tell you where the water providers are.</a></li>
                                    <li>&bull; <a href = "https://www.waterdatafortexas.org/reservoirs/statewide" target="_blank" className='aPlus'>This page wil tell you where the reservoirs are located.</a></li>
                                    <li>&bull; <a href = "https://www.twdb.texas.gov/groundwater/aquifer/major.asp" target="_blank" className='aPlus'>This map will tell you about the Major aquifers.</a></li>
                                </ol>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg"
                    expanded={expandedData} 
                    onChange={() => setExpandedData(!expandedData)}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">Where does the data come from? </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">
                                    These data are provided by TWDB and collected through the annual Water Use Survey. 
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">What if I notice incorrect information about the network? </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">
                                    The data is not perfect, and Texas Water Foundation and the Texas Water Development Board would welcome flagging of any errors that are found.  If you find one, please email a description of it to Colin McDonald at Colin@texaswater.org.   These will then be cataloged and shared with the Texas Water Development Board to continuously improve this app and the Water Use Survey Data.
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">Why are some water systems missing from the network?
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <p className="pb-4">
                                    The Water Use Survey relies on self-reported data, which may be subject to biases such as estimation errors, underreporting, or inconsistencies in reporting methodologies. 
                                </p>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="overline">Limitations of the Tool and Data
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                While TWDB staff conducts data cleaning and validation to enhance accuracy, these processes cannot eliminate potential inaccuracies. Users should interpret the data with caution and consider supplementing it with additional sources or validation methods where precision is critical. 
                                <p className="pt-2">Data limitations can include but are not limited to the following:</p>
                                <ol className="pt-2 pb-4 pl-2">
                                    <li>&bull; Water loss volumes.</li>
                                    <li>&bull; Lack of knowledge on how to report data correctly.</li>
                                    <li>&bull; Water use estimates are created for small rural PWS that are not surveyed.</li>
                                    <li>&bull; Entities may not submit a survey every year.</li>
                                    <li>&bull; Volumes are self-reported and revised as additional or more accurate data becomes available.</li>
                                    <li>&bull; Volumes might not be consistent due to meter accuracy, water loss, or data errors.</li>
                                    <li>&bull; Data are estimated for surveys that are not returned using the previous year's data.</li>
                                    <li>&bull; Only data collected from community public water systems are included in this map along with   selected industrial facilities as their buyer.</li>
                                </ol>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </main>
        </>
    );
};

// Main component that wraps FAQContent in Suspense
const FAQ: React.FC = () => {
    return (
        <Suspense fallback={<div className='container m-28 mx-auto px-24 pt-14'>Loading FAQ...</div>}>
            <FAQContent />
        </Suspense>
    );
};

export default FAQ;
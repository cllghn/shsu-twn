"use client";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQ: React.FC = () => {
    return (
        <>
            <main className='container flex flex-col w-full m-28 mx-auto px-24 pt-14'>
                <h1 className='text-4xl font-bold text-left pb-10'>Frequently Asked Questions</h1>
                <div>
                    <p>This page includes questions and answers to common questions about this website.</p>
                </div>
                <div className="w-full py-5 mx-auto">
                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className="font-semibold">What is the Texas Water Network Explorer?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                The Texas Water Networks Explorer (TWNet) is a publicly accessible tool designed to enhance how policymakers and decision-makers analyze water data. It maps the interactions among water entities across Texas, illustrating how water is acquired, sold, and redistributed. Using data from the Texas Water Development Board’s (TWDB) Water Use Survey, TWNet leverages network analysis methods and visualization techniques to transform a complex web of thousands of water users into clear, intuitive graphs and insights. These insights help policymakers quickly understand water distribution patterns, identify key stakeholders, and make informed decisions to improve water management.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className="font-semibold">How does the application provide value to policy-makers?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                This tool distills thousands of data points into intuitive visual analytics, simplifying how policymakers conceptualize water usage across Texas. Rather than simply asking, “How much water is used?” the tool broadens the scope to: “Who uses it, and who do they rely on? What kinds of uses interlink water users? And how much water is exchanged?” By applying a network-based approach, users can visualize and interpret the intricate relationships between water entities—such as water intake from sources, sales to industries and municipalities, and retail distribution to other systems. This framing enables policymakers to quickly identify dependencies within the network and better understand how water moves through the system. In turn, this expanded insight supports more data-driven decision-making in key areas, including developing system resilience strategies, risk management, infrastructure planning, and the development of policies and regulations governing water use.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className="font-semibold">How does the tool derive relationships from TWDB’s data?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                TWNet makes use of data provided by the TWDB on Public Water System (PWS) intakes, sales, and retail water information. From the raw data, our tool converts complex water system data into an intuitive flow network visualization by mapping two critical types of water movement in Texas:
                                <br></br><br></br>
                                <ol>
                                    <li><b>1. Water Sources to Systems:</b> These are derived from the records for water intake (self-supplied and purchased) for all Public Water Systems surveyed. This relation captures where water moves from a source (like an aquifer or surface water) to a water system. In turn, this shows where our water originates and which systems depend on each source.</li>
                                    <li><b>2. System-to-System Transfers:</b> These are derived from the records for water sales (wholesale to other PWS or industrial systems) reported by seller and buyer through the water use survey. This relationship captures where water moves between water systems in the network, revealing the interconnection between water systems across Texas.</li>
                                </ol>
                                <br></br>
                                For both types of relationships we also capture, when possible, water volumes being transferred in Texas. This allows us to quantify the strength of relationships. Taken as a whole, these relationships and volumes enable us to show how water moves from natural sources through various systems and ultimately to end users.
                                <br></br><br></br>
                                In addition to characteristics of each relationship, like water volume and frequency, the TWDB data is also used to extract contextual characteristics about the water entities in the network, enriching our understanding of each entity in the network by adding important information beyond just relationships. For example, water sources and water systems are geographically referenced. Similarly, when applicable, data on retail water connections and populations served are included to provide users with relevant data about public water systems in the network.
                                <br></br><br></br>
                                In all, the tool leverages relational data to depict interdependencies and flows, while pairing this with contextual data. What emerges is a clear picture of Texas’s water system, transforming thousands of data points into actionable insights to support water resource planning and policy-making.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className="shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className="font-semibold">What is a “network” in this context? </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                In this context, a network is a system of relationships between water entities in Texas. At a high level, those relationships represent the flow of water. Those can be further defined based on whether they connect a source-to-system (intake) or system-to-system (sales). 
                            </Typography>
                        </AccordionDetails>
                    </Accordion>


                    {/* Complete */}
                </div>
            </ main>
        </>
    );
}

export default FAQ;
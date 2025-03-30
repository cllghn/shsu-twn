import React from 'react';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from '@mui/material';
import OutboundIcon from '@mui/icons-material/Outbound';


const DataPage: React.FC = () => {
    return (
        <>
            <main className='container flex flex-col w-full m-28 mx-auto px-24 pt-14'>
                <h1 className='text-4xl font-bold text-left pb-10'>Texas Water Network Data</h1>
                <div>
                    <p>The Texas Water Network Explorer utilizes annual water use data and estimates. This data is collected by the <a href='https://www.twdb.texas.gov/index.asp' target='_blank'>Texas Water Development Board (TWDB)</a> and available to the public.</p>
                </div>
                <div className="w-full py-5 mx-auto">
                    {/* Accordion 1 */}
                    <Accordion className = "shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className="font-semibold">TWDB Historical Water Use</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                TWDB provides estimates using the annual Water Use Survey and water use estimates for irrigation, livestock, municipal, manufacturing, mining and steam-electric power categories. Summary estimates for 1999 and earlier are static historical estimates. Data reports for 2000 and later are generated directly from the TWDB's Water Use database and reflect the most current and accurate data available to the agency. <b>Note:</b> periodically, the data reports are refreshed to include any new or corrected information.
                            </Typography>
                            <div className='flex justify-end py-5 px-5'>
                                <Button
                                variant="outlined"
                                endIcon={<OutboundIcon />}
                                href="https://www.twdb.texas.gov/waterplanning/waterusesurvey/estimates/index.asp"
                                target="_blank"
                                rel="noopener noreferrer"
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
                                }}
                                >
                                    Go to Data Page
                                </Button>
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    {/* Accordion 2 */}
                    <Accordion className = "shadow-lg">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className="font-semibold">TWDB Historical Water Use Summary and Data Dashboard</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                            This interactive data dashboard displays historical water use survey and estimate data. The Texas Water Development Board Water Use Survey program conducts an annual survey of about 4,650 public water systems and 2,600 industrial facilities. The water use survey collects the volume of both ground and surface water used, the source of the water, water sales, and other pertinent data from the users. Periodically, the data reports are refreshed to include any new or corrected information.
                            </Typography>
                            <div className='flex justify-end py-5 px-5'>
                                <Button
                                variant="outlined"
                                endIcon={<OutboundIcon />}
                                href="https://www.twdb.texas.gov/waterplanning/waterusesurvey/dashboard/index.asp"
                                target="_blank"
                                rel="noopener noreferrer"
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
                                }}
                                >
                                    Go to Dashboard Page
                                </Button>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </ main>
        </>
    );
}

export default DataPage;
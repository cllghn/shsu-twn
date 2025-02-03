// pages/index.tsx

import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { Box, Grid } from '@mui/system';
import { useRouter } from "next/navigation";

interface ScorecardData {
    title: string;
    value: string;
    description: string;
    url?: string;
}

interface ScorecardPageProps {
    data: ScorecardData[];
}

const ScorecardPage: React.FC<ScorecardPageProps> = ({ data }) => {
    const router = useRouter(); // Next.js router for navigation

    return (
        <Box className="container mx-auto p-5">
            {/* Grid layout for scorecards */}
            <Grid container spacing={2} justifyContent="center">
                {data.map((item, index) => (

                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card className="bg-white shadow-md rounded-lg p-4" style={{ width: '100%', height: '280px', maxWidth: '280px' }}>
                            <CardContent className="flex flex-col justify-between" style={{ height: '100%' }}>
                                <Typography variant="h6" className="font-bold text-lg text-center" style={{ wordWrap: 'break-word' }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="h5" className="text-primary text-center my-2" style={{ wordWrap: 'break-word' }}>
                                    {item.value}
                                </Typography>
                                <Typography variant="body2" className="text-center text-gray-600" style={{ wordWrap: 'break-word', flex: 1 }}>
                                    {item.description}
                                </Typography>

                                {/* Conditionally render the button if the URL exists */}
                                {item.url && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className="mt-4 mx-auto"
                                        onClick={() => router.push(item.url)}
                                        // href={item.url}
                                        target="_blank"
                                    >
                                        Explore &rarr;
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ScorecardPage;

"use client";

import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import metadata from '@/data/network-meta-data.json';
import ScorecardPage from '@/components/Scorecards/Scorecards';

const Page: React.FC = () => {
    const allowedKeys = ['sources', 'systems', 'edges'];
    const filteredMetadata = Object.entries(metadata)
        .filter(([key]) => allowedKeys.includes(key))
        .sort(([key1], [key2]) => allowedKeys.indexOf(key1) - allowedKeys.indexOf(key2))
        .map(([key, value]) => value);

    // Handle popover per: https://mui.com/material-ui/react-popover/?srsltid=AfmBOormTxrDw_y5quNmxVsKB8SM7YNOxAtMKyglT1twFNHNwpQE32v-
    const [anchorEl1, setAnchorEl1] = React.useState<null | HTMLElement>(null);
    const [anchorEl2, setAnchorEl2] = React.useState<null | HTMLElement>(null);

    const handlePopoverOpen1 = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl1(event.currentTarget);
    };

    const handlePopoverClose1 = () => {
        setAnchorEl1(null);
    };

    const handlePopoverOpen2 = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl2(event.currentTarget);
    };

    const handlePopoverClose2 = () => {
        setAnchorEl2(null);
    };

    const open1 = Boolean(anchorEl1);
    const open2 = Boolean(anchorEl2);

    return (
        <>
            <main className='container flex flex-col w-full mt-16 mb-28 mx-auto px-24 '>
                <h1 className='text-4xl font-bold text-left pb-10'>Network Explorer</h1>
                <span className="text-black flex flex-wrap items-center pb-8">
                    Explore the {metadata.year} water data flows originating from&nbsp;
                    <Typography
                        aria-owns={open1 ? 'mouse-over-popover-1' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={handlePopoverOpen1}
                        onMouseLeave={handlePopoverClose1}
                        className="cursor-pointer text-black border-b-2 border-dotted border-black whitespace-normal"
                    >
                        water sources
                    </Typography>
                    <Popover
                        id="mouse-over-popover-1"
                        sx={{ pointerEvents: 'none' }}
                        open={open1}
                        anchorEl={anchorEl1}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose1}
                        disableRestoreFocus
                    >
                        <Typography sx={{ p: 1 }}>Ground or surface water sources.</Typography>
                    </Popover>
                    &nbsp; or from nodes in the &nbsp;
                    <Typography
                        aria-owns={open2 ? 'mouse-over-popover-2' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={handlePopoverOpen2}
                        onMouseLeave={handlePopoverClose2}
                        className="cursor-pointer text-black border-b-2 border-dotted border-black whitespace-normal"
                    >
                        water system&nbsp;
                    </Typography>
                    <Popover
                        id="mouse-over-popover-2"
                        sx={{ pointerEvents: 'none' }}
                        open={open2}
                        anchorEl={anchorEl2}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose2}
                        disableRestoreFocus
                    >
                        <Typography sx={{ p: 1 }}>Other nodes involved in the sale and distribution of water.</Typography>
                    </Popover> .
                </span>

                <span>
                    <ScorecardPage data={filteredMetadata} />
                </span>
            </main >
        </>
    );
};

export default Page;
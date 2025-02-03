"use client"

import * as React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { useRouter } from "next/navigation";



export default function FadeMenu() {

    const router = useRouter(); // Next.js router for navigation


    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`fixed top-0 w-full p-5 transition-colors duration-300 flex justify-end ${scrolled ? "bg-white bg-opacity-50 shadow-lg" : "bg-transparent"
                }`}
        >
            <Button
                className='text-bold hover:bg-gray-300 hover:bg-opacity-50'
                variant='outlined'
                id="fade-button"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Menu
            </Button>
            <Menu
                id="fade-menu"
                className='mt-2'
                MenuListProps={{
                    'aria-labelledby': 'fade-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <MenuItem onClick={() => { router.push("/"); handleClose(); }}>Home</MenuItem>
                <MenuItem onClick={() => { router.push("/netexplorer"); handleClose(); }}>Network Explorer</MenuItem>
                <MenuItem onClick={() => { router.push("/data"); handleClose(); }}>Data</MenuItem>
                <MenuItem onClick={handleClose} disabled>About</MenuItem>
                <MenuItem onClick={handleClose} disabled>Methodology</MenuItem>
                <MenuItem onClick={handleClose} disabled>FAQ</MenuItem>

            </Menu>
        </div >
    );
}

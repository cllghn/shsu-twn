"use client"

import * as React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';



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
// bg-white bg-opacity-25 shadow-lg
    return (
        <div
            className={`fixed top-0 z-50 w-full p-5 transition-colors duration-300 flex ${scrolled ? "bg-[#f4f4f4] shadow-lg" : "bg-[#f4f4f4] shadow-lg"
                }`}
        >
            <div onClick={() => router.push("/")} className="flex items-center cursor-pointer">
                <Image
                    src="/icon.png"
                    alt="Logo"
                    width={100}
                    height={100}
                    className="h-12 w-12 mr-2 object-contain"
                />
                <div className="ml-2 flex-wrap sm:max-w-60 hidden sm:block text-xl font-semibold text-[#01161E]">Texas Water Network Explorer</div>
            </div>
            <div className='flex justify-end w-full'>
                <Button
                    variant='outlined'
                    id="fade-button"
                    aria-controls={open ? 'fade-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
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

                    {open ? <CloseIcon /> : <MenuIcon />}

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
                    <MenuItem onClick={() => { router.push("/about"); handleClose(); }}>About</MenuItem>
                    {/* <MenuItem onClick={handleClose} disabled>Methodology</MenuItem> */}
                    <MenuItem onClick={() => { router.push("/faq"); handleClose(); }}>FAQ</MenuItem>

                </Menu>
            </div>

        </div >
    );
}

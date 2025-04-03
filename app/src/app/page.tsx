"use client";

import { useState } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Typography from "@mui/material/Typography";

import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SourceIcon from '@mui/icons-material/Source';

export default function Home() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState("different sources"); // Default text
  const open = Boolean(anchorEl);
  const router = useRouter(); // Next.js router for navigation

  const menuItems = [
    { name: "Water Sources", url: "/netexplorer/sources" },
    { name: "Water Systems", url: "/netexplorer/systems" },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (item?: { name: string; url: string }) => {
    if (item) setSelectedItem(item.name); // Update button text on selection
    setAnchorEl(null);
  };

  const handleGo = () => {
    const selected = menuItems.find((item) => item.name === selectedItem);
    if (selected) router.push(selected.url); // Navigate to selected page
  };


  return (
    <>
      <main className="flex flex-col w-full mb-28">
        {/* Full-Width Background Image Row */}
        <div className="w-screen h-[500px] bg-[url('/twf-resource-water-data.jpg')] bg-cover bg-center relative animate-fadeIn">
          <div className="grid grid-cols-2 gap-4 w-full h-full items-center px-24 ">
            {/* Left Column - Title & Description */}
            <div className="col p-10 sm:bg-[#01161E] sm:bg-opacity-25 sm:rounded-lg  sm:border-2 sm:border-[#f4f4f4] animate-fadeInSlow">
              <h1 className="text-4xl text-white font-bold text-left">
                Texas Water Network Explorer
              </h1>
              <p className="text-white text-left pt-4 sm:block hidden">
                A tool designed to revolutionize the way we interact with water data in Texas.<a href='/about' className='aPlus'>Read more about it... &rarr;</a>
              </p>
            </div>
            {/* Right Column - Placeholder */}
            <div className="col"></div>
          </div>
        </div>

        {/* Content Below the Image */}
        <div className="container mx-auto text-black text-justify sm:px-20 px-10">

          <div className="mt-16 grid grid-cols-10 shadow-lg rounded-lg animate-fadeIn">
            <div className="col-span-3 bg-cover bg-center lg:flex hidden flex-col bg-[url('/dolan_crop.jpg')] rounded-l-lg">
              {/* <PiShareNetworkFill size={70} className="transform -rotate-45 lg:block hidden" />
              <PiShareNetworkFill size={70} className="transform rotate-45 lg:block hidden" /> */}
            </div>
            <div className="bg-white bg-opacity-10 col-span-10 lg:col-span-7 px-20 py-20 rounded-r-lg">
              <h2 className="pb-5 text-[#53899D] font-bold text-lg">Water Flows <WaterDropIcon /></h2>
              <h3 className="pb-5 text-2xl text-thin text-[#124559]">Interested in learning how water flows through the network?</h3>
              <div className="container mx-auto flex items-center space-x-2">
                <div>Explore how water flows from</div>

                {/* Dropdown Button */}
                <Button
                  variant="text"
                  onClick={handleClick}
                  className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                  id="dropdown-button"
                >
                  {selectedItem} <ChevronDown size={18} className="ml-1" />
                </Button>

                {/* Go Button */}
                <Button
                  variant="outlined"
                  onClick={handleGo}
                  disabled={selectedItem === "different sources"} // Disable if default is selected
                  // className="bg-blue-600 text-white normal-case shadow-none hover:bg-blue-700"
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
                    '&:disabled': {
                      backgroundColor: 'transparent',
                      borderColor: '#949494',
                      color: '#949494',
                      cursor: 'not-allowed',
                    },
                }}
                  
                >
                  Go &rarr;
                </Button>

                {/* Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => handleClose()}
                // slotProps={{
                //   paper: {
                //     sx: {
                //       width: document.getElementById("dropdown-button")?.offsetWidth, // Set menu width to match button
                //     },
                //   },
                // }}
                >
                  {menuItems.map((item) => (
                    <MenuItem key={item.name} onClick={() => handleClose(item)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
              <Typography variant="caption">
                <Link href="/faq?expand=waterSource" className="aPlus">
                  Find a source... &rarr;
                </Link>
              </Typography>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-10 shadow-lg rounded-lg animate-fadeIn">
            <div className="bg-white bg-opacity-10 col-span-10 lg:col-span-7 px-20 py-20 rounded-lg">
              <h2 className="pb-5 text-[#53899D] font-bold text-lg">Data Sets <SourceIcon /></h2>
              <h3 className="pb-5 text-2xl text-thin text-[#124559]">Interested in taking a look at the data?</h3>
              <div className="container mx-auto flex items-center space-x-2">

                {/* Go Button */}
                <Button
                  variant="outlined"
                  onClick={() => router.push("/data")}
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
                  Go &rarr;
                </Button>
              </div>
              <Typography variant="caption">
                <Link href="/faq?expand=dataSource" className="aPlus mt-3">
                  Read FAQs about the data... &rarr;
                </Link>
              </Typography>
            </div>
            <div className="col-span-3 bg-cover bg-center lg:flex hidden flex-col bg-[url('/data.jpg')] rounded-r-lg">
            </div>
          </div>
          
        </div>
      </main >
    </>
  );
}

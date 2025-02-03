"use client"

import { useState } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
// import { PiShareNetworkFill } from "react-icons/pi";
// import Graph from "@/components/graph/graph";


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
        <div className="w-screen h-[400px] bg-[url('/twf-resource-water-data.jpg')] bg-cover bg-center relative">
          <div className="grid grid-cols-2 gap-4 w-full h-full flex items-center px-24">
            {/* Left Column - Title & Description */}
            <div className="col">
              <h1 className="text-4xl text-white font-bold text-left">
                Texas Water Foundation Network Explorer
              </h1>
              <p className="text-white text-left pt-4">
                A tool designed to revolutionize the way we interact with water data in Texas.
              </p>
            </div>
            {/* Right Column - Placeholder */}
            <div className="col"></div>
          </div>
        </div>

        {/* Content Below the Image */}
        <div className="container mx-auto px-24 mt-16 text-black">
          <p>
            As part of our commitment to equipping decision makers navigating a complex field, Texas Water Foundation developed the first system map that captures how different water entities interact and are related to each other in one comprehensive, publicly accessible tool. This tool allows you to view different segments of the water sector, and will grow over the years.
          </p>

          <div className="mt-16 grid grid-cols-10 ">
            <div className="col-span-3 bg-cover bg-center lg:flex hidden flex-col bg-[url('/dolan_crop.jpg')]">
              {/* <PiShareNetworkFill size={70} className="transform -rotate-45 lg:block hidden" />
              <PiShareNetworkFill size={70} className="transform rotate-45 lg:block hidden" /> */}
            </div>
            <div className="bg-gray-500 bg-opacity-10 col-span-10 lg:col-span-7 px-20 py-20">
              <h2 className="pb-5 text-red-700 font-bold text-lg">Water Flows</h2>
              <h3 className="pb-5 text-2xl text-thin">Interested in learning how water flows through the system?</h3>
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
                  variant="contained"
                  onClick={handleGo}
                  disabled={selectedItem === "different sources"} // Disable if default is selected
                  className="bg-blue-600 text-white normal-case shadow-none hover:bg-blue-700"
                >
                  Go &rarr;
                </Button>

                {/* Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => handleClose()}
                  slotProps={{
                    paper: {
                      sx: {
                        width: document.getElementById("dropdown-button")?.offsetWidth, // Set menu width to match button
                      },
                    },
                  }}
                >
                  {menuItems.map((item) => (
                    <MenuItem key={item.name} onClick={() => handleClose(item)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-10 ">
            <div className="bg-gray-500 bg-opacity-10 col-span-10 lg:col-span-7 px-20 py-20">
              <h2 className="pb-5 text-red-700 font-bold text-lg">Data Sets</h2>
              <h3 className="pb-5 text-2xl text-thin">Interested in taking a look at the data?</h3>
              <div className="container mx-auto flex items-center space-x-2">

                {/* Go Button */}
                <Button
                  variant="contained"
                  onClick={() => router.push("/data")}
                  className="bg-blue-600 text-white normal-case shadow-none hover:bg-blue-700"
                >
                  Go &rarr;
                </Button>
              </div>
            </div>
            <div className="col-span-3 bg-cover bg-center lg:flex hidden flex-col bg-[url('/data.jpg')]">

            </div>
          </div>
        </div>

        {/* Graph Statistics Section (Placeholder) */}
        {/* <Graph /> */}
      </main >
    </>
  );
}

"use client";

import { useState } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import SchemaIcon from '@mui/icons-material/Schema';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SearchIcon from '@mui/icons-material/Search';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SourceIcon from '@mui/icons-material/Source';
import CircleIcon from '@mui/icons-material/Circle';

export default function Home() {
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const open = Boolean(anchorEl);
  const router = useRouter(); // Next.js router for navigation

  // const [selectedItem, setSelectedItem] = useState("sources or systems"); // Default text
  // const menuItems = [
  //   { name: "Water Sources", url: "/netexplorer/sources" },
  //   { name: "Water Systems", url: "/netexplorer/systems" },
  // ];

  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = (item?: { name: string; url: string }) => {
  //   if (item) setSelectedItem(item.name); // Update button text on selection
  //   setAnchorEl(null);
  // };

  // const handleGo = () => {
  //   const selected = menuItems.find((item) => item.name === selectedItem);
  //   if (selected) router.push(selected.url); // Navigate to selected page
  // };

  const goToSources = () => {
    router.push("/netexplorer/sources");
  };
  const goToSystems = () => {
    router.push("/netexplorer/systems");
  };

  return (
    <>
      <main className="flex flex-col w-full mb-28">
        {/* Full-Width Background Image Row */}
        <div className="w-screen h-[500px] bg-[url('/twf-resource-water-data.jpg')] bg-cover bg-center relative animate-fadeIn">
          <div className="grid grid-cols-2 gap-4 w-full h-full items-center px-24 ">
            {/* Left Column - Title & Description */}
            <div className="col p-10 sm:bg-[#124559] sm:bg-opacity-65 sm:rounded-lg  sm:border-2 sm:border-[#f4f4f4] animate-fadeInSlow">
              <h1 className="text-4xl text-white font-bold text-left">
                Texas Water Network Explorer
              </h1>
              <p className="text-white text-left pt-4 sm:block hidden">
                A tool designed to modernize the way we interact with water data in Texas.<a href='/about' className='aPlus'>&nbsp;Read more about it... &rarr;</a>
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
              <h2 className="pb-5 text-2xl text-[#124559]">Water Flows <WaterDropIcon /></h2>
              <h3 className="pb-5 text-xl text-[#124559]">Interested in learning how water flows through the network?</h3>
              <div className="container mx-auto flex flex-wrap items-center space-x-2">
                <div>Explore flows from</div>
                <Button
                  variant="contained"
                  onClick={goToSources}
                  sx={{
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    backgroundColor: '#124559',
                    // padding: '2px',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#0a0a0a',
                      border: '1px solid #0a0a0a',
                    },
                  }}
                >
                  water sources</Button>
                <div>or</div>
                <Button
                  variant="contained"
                  onClick={goToSources}
                  sx={{
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    backgroundColor: '#124559',
                    // padding: '2px',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      color: '#0a0a0a',
                      border: '1px solid #0a0a0a',
                    },
                  }}
                >
                  water systems.
                </Button>

                {/* Dropdown Button */}
                {/* <Button
                  variant="text"
                  onClick={handleClick}
                  className="bg-gray-200 text-black normal-case shadow-none hover:bg-gray-300"
                  id="dropdown-button"
                >
                  {selectedItem} <ChevronDown size={18} className="ml-1" />
                </Button> */}
                {/* Go Button
                <Button
                  variant="outlined"
                  onClick={handleGo}
                  disabled={selectedItem === "sources or systems"} // Disable if default is selected
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
                </Button> */}
                {/* Dropdown Menu */}
                {/* <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => handleClose()}
                >
                  {menuItems.map((item) => (
                    <MenuItem key={item.name} onClick={() => handleClose(item)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu> */}
              </div>
              <div className="pt-16">
                <Typography variant="caption">
                  <Link href="/faq?expand=waterSource" className="aPlus">
                    <SearchIcon /> Find information on sources/systems... &rarr;
                  </Link>
                </Typography>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-10 shadow-lg rounded-lg animate-fadeIn">
            <div className="bg-white bg-opacity-10 col-span-10 lg:col-span-7 px-20 py-20 rounded-lg">
              <h2 className="pb-5 text-[#124559] text-2xl">Data Sets <SourceIcon /></h2>
              <h3 className="pb-5 text-xl text-[#124559]">Interested in taking a look at the data?</h3>
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
              <div className="pt-16">
                <Typography variant="caption">
                  <Link href="/faq?expand=dataSource" className="aPlus mt-3">
                    <LocalLibraryIcon /> Read FAQs about the data... &rarr;
                  </Link>
                </Typography>
              </div>
            </div>
            <div className="col-span-3 bg-cover bg-center lg:flex hidden flex-col bg-[url('/data.jpg')] rounded-r-lg"></div>

          </div>

          <div className="mt-16 flex flex-col shadow-lg rounded-lg animate-fadeIn">
            <div
              className="w-full h-48 bg-cover bg-center bg-[url('/nets.jpg')] rounded-t-lg"
            ></div>
            <div className="bg-white bg-opacity-10 px-20 py-20 rounded-lg">
              <h2 className="pb-5 text-[#124559] text-2xl">Mapping Critical Water Systems <SchemaIcon /></h2>
              <h3 className="pb-5 text-xl text-[#124559]">Where does the water come from—and where does it go? Take a look at these key visualizations to get started.</h3>
              <div className="container mx-auto items-start grid sm:grid-cols-2 sm:space-x-4">
                <div className="flex flex-col items-start col-span-1">
                  <h4 className="pb-5 text-lg text-[#124559]">Water Sources</h4>
                  <ul className="flex flex-col space-y-4">
                    <div>
                      <Link href="./netexplorer/sources?node=Carrizo-Wilcox+Aquifer" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#01161E]" size={14} /> Carrize-Wilcox Aquifer &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/sources?node=Edwards-Bfz+Aquifer" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#01161E]" size={14} /> Edwards-BFZ Aquifer &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/sources?node=Ogallala+Aquifer" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#01161E]" size={14} /> Ogallala Aquifer &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/sources?node=Rio+Grande+Run+Of+River" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#01161E]" size={14} /> Rio Grande Run of River &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/sources?node=Trinity+Run+Of+River" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#01161E]" size={14} /> Trinity Run of River &rarr;
                      </Link>
                    </div>

                  </ul>
                </div>
                <div className="flex flex-col items-start col-span-1">
                  <h4 className="pb-5 text-lg text-[#124559]">Water Systems</h4>
                  <ul className="flex flex-col space-y-4">
                    <div>
                      <Link href="./netexplorer/systems?node=AQUA+WSC" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#53899D]" size={14} /> Agua WSC &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/systems?node=CITY+OF+HOUSTON" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#53899D]" size={14} /> City of Houston &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/systems?node=EL+PASO+WATER+UTILITIES+PUBLIC+SERVICE+B" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#53899D]" size={14} /> El Paso Water Utilities Public Service &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/systems?node=NORTH+TEXAS+MUNICIPAL+WATER+DISTRICT" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#53899D]" size={14} /> North Texas Municipal Water District &rarr;
                      </Link>
                    </div>
                    <div>
                      <Link href="./netexplorer/systems?node=SAN+ANTONIO+WATER+SYSTEM" className="aPlus">
                        <CircleIcon className="inline-block align-top mr-2 text-[#53899D]" size={14} /> San Antonio Water System &rarr;
                      </Link>
                    </div>

                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main >
    </>
  );
}

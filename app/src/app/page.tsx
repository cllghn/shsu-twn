"use client";

import { useState } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import metadata from '@/data/network-meta-data.json';
import { useRouter } from "next/navigation";
import Link from "next/link";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import SchemaIcon from '@mui/icons-material/Schema';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SearchIcon from '@mui/icons-material/Search';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SourceIcon from '@mui/icons-material/Source';
import CircleIcon from '@mui/icons-material/Circle';

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNames, setFilteredNames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const goToSources = () => {
    router.push("/netexplorer/sources");
  };
  const goToSystems = () => {
    router.push("/netexplorer/systems");
  };

  // Create array with both name and type (source or system)
  const sources = Object.values(metadata.sources.kvs).map(name => ({ name, type: 'source' }));
  const systems = Object.values(metadata.systems.kvs).map(name => ({ name, type: 'system' }));
  const allItems = [...sources, ...systems];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1); // Reset selection when typing
    setIsValidSelection(false); // Invalidate selection when typing
    setSelectedItem(null); // Clear selected item when typing

    if (value.trim() === "") {
      setFilteredNames([]);
      setShowDropdown(false);
    } else {
      const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNames(filtered);
      setShowDropdown(true);
    }
  };

  const handleSelectOption = (item) => {
    setSearchTerm(item.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setIsValidSelection(true);
    setSelectedItem(item);
    // DO NOT navigate here - wait for Go button click
  };

  const handleSearch = () => {
    // Navigate when Go button is clicked
    if (selectedItem) {
      if (selectedItem.type === 'source') {
        const key = Object.keys(metadata.sources.kvs).find(k => metadata.sources.kvs[k] === selectedItem.name);
        router.push(`/netexplorer/sources?node=${encodeURIComponent(key)}`);
      } else if (selectedItem.type === 'system') {
        const key = Object.keys(metadata.systems.kvs).find(k => metadata.systems.kvs[k] === selectedItem.name);
        router.push(`/netexplorer/systems?node=${encodeURIComponent(key)}`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredNames.length === 0) {
      if (e.key === 'Enter' && selectedItem) {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredNames.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectOption(filteredNames[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
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
            </div>
            <div className="bg-white bg-opacity-10 col-span-10 lg:col-span-7 px-20 py-20 rounded-r-lg">
              <h2 className="pb-5 text-2xl text-[#124559]">Water Flows <WaterDropIcon /></h2>
              <h3 className="pb-5 text-xl text-[#124559]">Interested in learning how water flows through the network?</h3>
              <div className="container mx-auto flex flex-wrap items-center space-x-2 space-y-2">
                <div className="w-[90%] flex px-2 space-x-2 relative">
                  <div className="flex-grow relative">
                    <TextField
                      variant="outlined"
                      placeholder="Search for water sources or systems..."
                      fullWidth
                      size="small"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          '&:hover fieldset': {
                            borderColor: '#124559',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#124559',
                          },
                        },
                      }}
                    />
                    {/* Dropdown */}
                    {showDropdown && filteredNames.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {filteredNames.slice(0, 10).map((item, index) => (
                          <div
                            key={index}
                            className={`px-4 py-2 cursor-pointer transition-colors ${index === selectedIndex
                                ? 'bg-[#124559] text-white'
                                : 'hover:bg-gray-100'
                              }`}
                            onClick={() => handleSelectOption(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className={`ml-2 text-xs ${index === selectedIndex ? 'text-gray-200' : 'text-gray-500'}`}>
                              ({item.type})
                            </span>
                          </div>
                        ))}
                        {filteredNames.length > 10 && (
                          <div className="px-4 py-2 text-gray-500 text-sm italic">
                            ... and {filteredNames.length - 10} more results
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={!isValidSelection}
                    sx={{
                      color: '#ffffff',
                      backgroundColor: '#124559',
                      minWidth: '80px',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        color: '#124559',
                        border: '1px solid #124559',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#cccccc',
                        color: '#666666',
                      },
                    }}
                  >
                    Go
                  </Button>
                </div>
                <div className="w-full flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-400"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xl">or</span>
                  <div className="flex-grow border-t border-gray-400"></div>
                </div>
                <div className="text-xl text-[#124559]">Explore flows from</div>
                <Button
                  variant="contained"
                  onClick={goToSources}
                  sx={{
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    backgroundColor: '#124559',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#0a0a0a',
                      border: '1px solid #0a0a0a',
                    },
                  }}
                >
                  water sources</Button>
                <div className="text-xl text-[#124559]">or</div>
                <Button
                  variant="contained"
                  onClick={goToSystems}
                  sx={{
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    backgroundColor: '#124559',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      color: '#0a0a0a',
                      border: '1px solid #0a0a0a',
                    },
                  }}
                >
                  water systems
                </Button>
                <div className="text-xl text-[#124559]">pages.</div>
              </div>

              <div className="pt-10">
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
              <div className="container mx-auto items-start grid sm:grid-cols-2 sm:space-x-4 space-y-6">
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
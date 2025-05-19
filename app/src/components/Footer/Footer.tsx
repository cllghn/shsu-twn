import React from 'react';
import { motion } from "framer-motion";
import GitHubIcon from '@mui/icons-material/GitHub';


const Footer = () => {
    return (
        <div className='relative bottom-0 max-w-full min-w-full animate-fadeIn'>
            <div>
                <img
                    src="/waves.svg"
                    alt="Waves Separator"
                    className="w-full h-full"
                />
            </div>
            <footer className="px-20 pt-1 pb-20 bg-[#53899D]">
                
                <div>
                    <div className="flex justify-left mt-2">
                        <img
                            src="/SH_white.svg"
                            alt="SHSU Logo"
                            className="h-20"
                        />
                        <img
                            src="/IHSLogo_Icon.png"
                            alt="IHS Logo"
                            className="h-20"
                        />
                        <img
                            src="/twf_logo.png"
                            alt="TWF Logo"
                            className="h-20"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-left text-sm text-white sm:order-2 z-0 pt-2">
                        <p>
                            This Web site was co-developed between Sam Houston State University's Institute for Homeland Security and the Texas Water Foundation.
                             <br></br>
                             © 2025 Sam Houston State University, Institute for Homeland Security.
                        </p>
                    </div>
                </div>
            </footer >
        </div >
    );
};

export default Footer;

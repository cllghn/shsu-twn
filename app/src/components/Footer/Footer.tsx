import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';


const Footer = () => {
    return (
        <div className='fixed bottom-0 max-w-full min-w-full bg-white pt-2 border-t-[1px] border-black'>
            <footer className="">
                <div className="flex py-2 justify-center sm:order-1 z-0">
                    Made with &hearts; and&nbsp;<a href='https://github.com/cllghn/shsu-twn' className='relative hover:text-gray-400 cursor-pointer transition-all ease-in-out before:transition-[width] before:ease-in-out before:duration-700 before:absolute before:bg-gray-400 before:origin-center before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] after:transition-[width] after:ease-in-out after:duration-700 after:absolute after:bg-gray-400 after:origin-center after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%]'><GitHubIcon style={{ fontSize: 'small' }} /> version control</a>.
                </div>
            </footer >
        </div >
    );
};

export default Footer;

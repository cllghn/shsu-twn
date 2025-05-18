"use client";

import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <Tooltip title="Return to top" arrow placement="left">
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-[#124559] hover:bg-white text-white hover:text-[#124559] hover:border-2 hover:border-[#124559] rounded-full shadow-2xl transition-all duration-300"
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </button>
        </Tooltip>
      )}
    </>
  );
};

export default BackToTop;
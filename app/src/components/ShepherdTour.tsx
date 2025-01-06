// app/components/ShepherdTour.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import MapIcon from '@mui/icons-material/Map';
import Tooltip from '@mui/material/Tooltip';


const ShepherdTour: React.FC = () => {
    const tourRef = useRef<Shepherd.Tour | null>(null);

    useEffect(() => {
        const tour = new Shepherd.Tour({
            defaultStepOptions: {
                cancelIcon: { enabled: true },
                classes: 'shadow-md bg-blue-500 text-white',
                scrollTo: { behavior: 'smooth', block: 'center' },
            },
            useModalOverlay: true,
        });

        tour.addStep({
            id: 'welcome',
            text: 'Welcome to the Texas Water Network Visualizer! Let’s take a quick tour of the app.',
            buttons: [
                {
                    text: 'Start',
                    action: tour.next,
                },
            ],
        });

        tour.addStep({
            id: 'info',
            text: 'Learn more about the water network and this project by clicking on the information button.',
            attachTo: { element: '#info-btn', on: 'right' },
            buttons: [
                {
                    text: 'Next',
                    action: tour.next,
                },
            ],
        })

        tour.addStep({
            id: 'cy-graph',
            text: 'Explore the relationships between water systems in Texas.',
            attachTo: { element: '#cy-graph', on: 'top' },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                },
                {
                    text: 'Next',
                    action: tour.next,
                },
            ],
        })

        tour.addStep({
            id: 'configure',
            text: 'Configure the graph as you see fit.',
            attachTo: { element: '#config-btn', on: 'left' },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                },
                {
                    text: 'Next',
                    action: tour.next,
                },
            ],
        })

        tour.addStep({
            id: 'fit-screen',
            text: "Can't find the graph? Try clicking the 'Fit Screen' button.",
            attachTo: { element: '#fit-screen-btn', on: 'left' },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                },
                {
                    text: 'Next',
                    action: tour.next,
                },
            ],
        })

        tour.addStep({
            id: 'view-table',
            text: "Take a look at the data underlying the graph in table format.",
            attachTo: { element: '#view-table-btn', on: 'left' },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                },
                {
                    text: 'Next',
                    action: tour.next,
                },
            ],
        })

        tour.addStep({
            id: 'screenshot',
            text: "Like what you see? Take photo of the graph.",
            attachTo: { element: '#screenshot-btn', on: 'left' },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                },
                {
                    text: 'Next',
                    action: tour.next,
                },
            ],
        })

        tour.addStep({
            id: 'shepherd-tour',
            text: "Take the tour again by clicking this button.",
            attachTo: { element: '#shepherd-tour-btn', on: 'right' },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                },
                {
                    text: 'End',
                    action: tour.complete,
                },
            ],
        })


        tourRef.current = tour;

        return () => {
            tourRef.current = null; // Clean up
        };
    }, []);

    const startTour = () => {
        tourRef.current?.start();
    };

    return (
        <Tooltip title="Take the Tour!" arrow placement="right">
            <button
                onClick={startTour}
                className="absolute top-14 left-2 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-white hover:text-blue-500 shadow-md animate-customPulse"
                id='shepherd-tour-btn'
            >
                <MapIcon />
            </button>
        </Tooltip>
    );
};

export default ShepherdTour;

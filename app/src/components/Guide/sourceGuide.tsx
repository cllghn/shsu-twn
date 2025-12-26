import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

let tourDropdownOpened: boolean = false;

export const sourceTour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
        classes: "shadow-md bg-purple-dark",
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: { enabled: true },
    },
    exitOnEsc: true,
    keyboardNavigation: true,
});

sourceTour.addStep({
    id: "welcome",
    title: "🗺️ Tour Welcome",
    text: "Welcome to the Water Source Visualizer guide! This tour will walk you through the main features of the source view.",
    buttons: [
        {
            text: "Skip Tour",
            action: sourceTour.cancel,
            secondary: true,
        },
        {
            text: "Next",
            action: sourceTour.next,
        },
    ],
});

sourceTour.addStep({
    id: 'search-area',
    title: '🔍 How to Search',
    text: 'This is the main search area where you can select different search modes to explore water systems. You can search by name or by location. Once you select a mode, enter your query and hit \'Go &rarr;\' to see the results.',
    attachTo: {
        element: '#search-mode-box',
        on: 'top-start'
    },
    buttons: [
        {
            text: 'Back',
            action: sourceTour.back,
            secondary: true
        },
        {
            text: 'Next',
            action: sourceTour.next
        }
    ]
});

let originalUrl: string = '';

sourceTour.on('start', () => {
    originalUrl = window.location.href;
    tourDropdownOpened = false;
    const url = new URL(window.location.href);
    url.searchParams.set('node', 'Trinity Run Of River');
    window.history.pushState({}, '', url.toString());
});

sourceTour.on('complete', () => {
    // Restore the original URL
    if (originalUrl) {
        window.location.href = originalUrl;
    }
});

sourceTour.on('cancel', () => {
    // Restore the original URL
    if (originalUrl) {
        window.location.href = originalUrl;
    }
    tourDropdownOpened = false;
});

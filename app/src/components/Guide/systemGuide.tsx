import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

let tourDropdownOpened: boolean = false;

export const systemTour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    classes: 'shadow-md bg-purple-dark',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true }
  },
  exitOnEsc: true,
  keyboardNavigation: true
});

systemTour.addStep({
  id: 'welcome',
  title: 'Tour Welcome 🗺️',
  text: 'Welcome to the Water System Visualizer guide! This tour will walk you through the main features of the system view.',
  buttons: [
    {
      text: 'Skip Tour',
      action: systemTour.cancel,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ]
});


systemTour.addStep({
  id: 'search-area',
  title: 'How to Search 🔍',
  text: 'This is the main search area where you can select different search modes to explore water systems. You can search by name or by location. Once you select a mode, enter your query and hit \'Go &rarr;\' to see the results.',
  attachTo: {
    element: '#search-mode-box',
    on: 'top-start'
  },
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ]
});

systemTour.addStep({
  id: 'results-area',
  title: 'Viewing Results 📋',
  text: 'After performing a search, the results will be displayed here.',
  attachTo: {
    element: '#results-area',
    on: 'bottom'
  },
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ],
  when: {
    show: function () {
      // Get the elements
      const graphTab = document.querySelector("#graph-area") as HTMLElement;
      if (graphTab) {
        graphTab.click();
      }
      const goButton = document.querySelector("#go-button") as HTMLElement;
      if (goButton) {
        goButton.click();
      }

    }
  },
});

systemTour.addStep({
  id: 'graph-area',
  title: 'Graph Visualization 📊',
  text: 'This area displays the graph visualization of the water systems based on your search criteria.',
  attachTo: {
    element: '#graph-area',
    on: 'top'
  },
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ],
  when: {
    show: function () {
      const graphTab = document.querySelector("#graph-area") as HTMLElement;
      if (graphTab) {
        graphTab.click();
      }
    }
  }
});

systemTour.addStep({
  id: 'graph-controls',
  title: 'Graph Controls ⚙️',
  text: 'Use these controls to manipulate the graph visualization, such as zooming in/out, resetting the view, or changing ....',
  attachTo: {
    element: '#graph-button-cluster',
    on: 'top'
  },
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ],
  when: {
    show: function () {
      const graphTab = document.querySelector("#graph-area") as HTMLElement;
      if (graphTab) {
        graphTab.click();
      }
    },

  }
});

systemTour.addStep({
  id: 'insights-area',
  title: 'Insights 📊',
  text: 'The insights tab provides detailed analytics about the selected water systems.',
  attachTo: {
    element: '#insights-area',
    on: 'top'
  },
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ],
  when: {
    show: function () {
      const insightsTab = document.querySelector("#insights-area") as HTMLElement;
      if (insightsTab) {
        insightsTab.click();
      }
    }
  }
});

systemTour.addStep({
  id: 'glossary-area',
  title: 'Glossary 📚',
  text: 'The glossary tab provides definitions and explanations of key terms related to water systems.',
  attachTo: {
    element: '#glossary-area',
    on: 'top'
  },
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Next',
      action: systemTour.next
    }
  ],
  when: {
    show: function () {
      const glossaryTab = document.querySelector("#glossary-area") as HTMLElement;
      if (glossaryTab) {
        glossaryTab.click();
      }
    }
  }
});

systemTour.addStep({
  id: 'end',
  title: 'Tour Complete 🎉',
  text: 'That is it! You have completed the tour, but feel free to explore the system view further on your own.',
  buttons: [
    {
      text: 'Back',
      action: systemTour.back,
      secondary: true
    },
    {
      text: 'Finish',
      action: systemTour.complete
    }
  ]
});

let originalUrl: string = '';

systemTour.on('start', () => {
  originalUrl = window.location.href;
  tourDropdownOpened = false;
  const url = new URL(window.location.href);
  url.searchParams.set('node', '31500');
  window.history.pushState({}, '', url.toString());
});

systemTour.on('complete', () => {
  // Restore the original URL
  if (originalUrl) {
    window.location.href = originalUrl;
  }
});

systemTour.on('cancel', () => {
  // Restore the original URL
  if (originalUrl) {
    window.location.href = originalUrl;
  }
  tourDropdownOpened = false;
});
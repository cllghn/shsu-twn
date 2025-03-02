# Texas Water Network Explorer

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vercel](https://vercelbadge.vercel.app/api/cllghn/shsu-twn)](https://vercel.com/cllghn/shsu-twn)


The Texas Water Networks Explorer (TWNet) is a publicly accessible tool designed to enhance how policymakers and decision-makers analyze water data. It maps the interactions among water entities across Texas, illustrating how water is acquired, sold, and redistributed. Using data from the Texas Water Development Board’s (TWDB) Water Use Survey, TWNet leverages network analysis methods and visualization techniques to transform a complex web of thousands of water users into clear, intuitive graphs and insights. These insights help policymakers quickly understand water distribution patterns, identify key stakeholders, and make informed decisions to improve water management.

This repository was created by the Institute for Homeland Security at Sam Houston State University to host the code and data for the TWNet. At the root level, the repository contains the following directories:

- [`data/`](./data/): Contains the data used in the TWNet. In addition, it includes the routines needed to munge said data into a format that can be used by the TWNet application stored in the `app/` sub-directory. All code in this sub-directory is written in Python.
- [`app/`](./app/): Contains the code for the TWNet application. The application is a web-based tool that allows users to interact with the water network data. The application is written in React using TailwindCSS and TypeScript.

## Installation ⚙️

TWNet is composed of key sub-directories that contain the code and data needed to run the application. Instructions will be provided within each sub-directory for how to installation required dependencies and execute the code.

## How to Use TWNet ❓

The TWNet application is a web-based tool that allows users to interact with the water network data. The application is hosted on Vercel and can be accessed at the following URL: [https://shsu-twn.vercel.app/](https://shsu-twn.vercel.app/).

To run the application locally, follow the instructions in the [`app/`](./app/) sub-directory. You may need to run the data munging scripts in the [`data/`](./data/) sub-directory first to generate the data needed for the application.

## Team Members 👥

| Name | Role | Affiliation | Email |
| ---- | ---- | ----------- | ----- |
| Christopher Callaghan | Author and Maintainer | Institute for Homeland Security at Sam Houston State University | cjcallaghan88@gmail.com |
| Dr. Nathan Jones | Contributor | Institute for Homeland Security at Sam Houston State University | nxj008@shsu.edu |
| Reyna Loosmore | Contributor | Institute for Homeland Security at Sam Houston State University | rll040@shsu.edu |
| Ernie Romero | Contributor | Institute for Homeland Security at Sam Houston State University | jer108@shsu.edu |

## Branching Strategy 🌿

Unless otherwise specified, the `main` branch represents the stable code that has been peer reviewed and ready for sharing externally, should that ever be needed. Most changes are stored in the `develop` branch, which serves as an intermediary receptacle of changes and work in progress. Lastly, `task` branches come out of the `develop` branch and act as small task oriented sub-branches used to work on key tasks. By definition, `task` branches are merged back into `develop` ahead of quality assurance and peer review.

```
main         # Stable branch
|   
|---develop  # Ongoing development
    |
    |-- task # Ad hoc changes
```

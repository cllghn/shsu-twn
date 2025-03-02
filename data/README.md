# Texas Water Network Data Processing

This sub-directory contains the code and data needed to process the data used in the Texas Water Network Explorer (TWNet) application. The data is sourced from the Texas Water Development Board’s (TWDB) Water Use Survey and is used to generate the network data used in the TWNet application.

## Folder Structure 📂

This sub-directory contains the following files and folders:

- `inputs/`: Contains the data for the Public Water Systems (PWS) in Texas.
- `outputs/`: Contains the processed data that is used in the TWNet application.
- `network-data-maker.py`: A Python script that processes the PWS data into a network format.

## Requirements 📦

This code was written using Python 3.11.1. Additionally, this repository uses a Python virtual environment to manage dependencies. Those dependencies are listed in the `requirements.txt` file.

## Installation ⚙️

First, create and activate a virtual environment. To create a virtual environment, run the following command:

```bash
cd data  # Change to the data directory

python -m venv venv # Create virtual environment

source .venv/bin/activate  # Mac/Linux
# OR
.venv\Scripts\activate  # Windows
```

To install the dependencies, run the following command:

```bash
pip install -r requirements.txt
```

## Using the Data Processing Scripts 📝

Once you have activate the virtual environment and installed the dependencies, you can run run the `network-data-maker.py`. This file was written using [Marimo](https://marimo.io/), an open-source reactive notebook for Python. 

To create or edit notebooks with Marimo, use the following command:

```bash
marimo edit 
# OR to edit a specific file
marimo edit network-data-maker.py
```

One of the advantages or using Marimo over other tools (e.g., Jupyter Notebooks) is that you can execute the notebooks as scripts. To run the `network-data-maker.py` script at the command line, use the following command:

```bash
python network-data-maker.py
```
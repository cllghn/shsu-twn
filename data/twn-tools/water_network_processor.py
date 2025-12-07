# Import required modules ======================================================
import pandas as pd
import json
import numpy as np
import argparse
import pathlib
from typing import List, Optional, Dict
from datetime import datetime
import networkx as nx
import os

class WaterNetworkProcessor:
    """Process Texas Water Use Survey data into network format."""
    
    def __init__(self, input_dir: str = 'inputs', output_dir: str = 'outputs'):
        self.input_dir = pathlib.Path(input_dir)
        self.output_dir = pathlib.Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    @staticmethod
    def clean_entity(entity: str) -> str:
        """Clean entity names by stripping whitespace and title-casing."""
        if isinstance(entity, str):
            entity = entity.strip()
            entity = entity.title()
        return entity

    def create_intake_elist(self, input_file: str, year: Optional[int] = None) -> pd.DataFrame:
        """Create an edge list from the WUS intake data.
        
        This method is modeled after the intake table in the WUS for 2022 and 
        2023 (e.g., `PWS Intake_2022-2023.csv`).
        It takes in a table and cleans it into an edge list format. The 
        following are key rules to keep in mind: 
        - For each row in the dataset, the function looks at the water type 
            (e.g., 'Reuse', 'Groundwater', 'Surface Water') and whether it was 
            purchased or self-supplied to determine the configuration of the 
            relationship. More specifically:
            - If the water type is reuse and the water is self-supplied, 
                the source is the TWDB Survey Number. A self-loop in the 
                network.
            - If the water is purchased, the source is the Seller Survey
                Number.
            - If the water type is groundwater and the water is 
                self-supplied, the source is the Aquifer Source. If the 
                Aquifer Source is "OTHER AQUIFER", the source is the Source 
                Basin. 
            - If the water type is surface water and the water is 
                self-supplied, the source is the Surface Water Source. If 
                the Surface Water Source is "UNKNOWN", the source is the 
                Source Basin. 
        - Much of the data from the base table is left on the cutting room floor. 
            Only columns that are relevant to the edge list are kept. In 
            addition, certain values are added to the edge list for clarity:
            - Each record gets a unique ID which serves as the edge identifier.
            - Each record is assigned a target of the water (where it's used) 
                from the TWDB Survey Number.
            - Each record is labeled as `"intake"` to denote it came from the 
                intake data.
            - The total volume of water is recorded from the `"Total Intake 
                (Gallons)"` column.
            - The year of intake, water type, and whether it was purchased or 
                self-supplied are also saved for each record.
            - The source file name is added to keep track of where the data came 
                from.

        Args:
            input_file (str): Path to the input CSV file containing intake data.
            year (Optional[int]): Year of the data to process. If None, process 
                all years.
        
        Returns:
            pd.DataFrame: A cleaned edge list DataFrame derived from the intake 
                data.
        """
        # join the input directory and file name to create full path
        fpath = self.input_dir / input_file
        # read in the intake table as a single dataframe
        intake = pd.read_csv(fpath)
        # strip whitespace from column names
        intake.columns = intake.columns.str.strip()

        # declare a helper function to determine the source based on water type
        def process_source(row):
            if row.get('Water Type') == "Reuse" and row.get('Purchased / Self-Supplied') == "Self-Supplied" :
                 return row.get("TWDB Survey No", None)
            elif row.get('Purchased / Self-Supplied') == "Purchased" :
                return row.get("Seller Survey Number", None)
            elif row.get('Water Type') == "Ground Water" and row.get('Purchased / Self-Supplied') == "Self-Supplied":
                # There are no unknowns in the Aquifer Source
                if row.get('Aquifer Source') == "OTHER AQUIFER":
                    return row.get('Source Basin') + ' BASIN (Source Unknown)'
                else:
                    return row.get('Aquifer Source')
            elif row.get('Water Type') == "Surface Water" and row.get('Purchased / Self-Supplied') == "Self-Supplied":
                if row.get('Surface Water Source') == "UNKNOWN":
                    return row.get('Source Basin') + ' BASIN (Source Unknown)' 
                else:
                    return row.get('Surface Water Source')

        # apply the helper function to create the 'source' column
        intake['source'] = intake.apply(process_source, axis=1)

        # create other columns for the edge list safely(ish)
        intake['target'] = intake.get('TWDB Survey No', None)
        intake['id'] = 'intake_' + intake.index.astype(str)
        intake['type'] = 'intake'
        intake['yearly_volume'] = intake.get('Total Intake (Gallons)', None) # This defaults to None if the column is not found
        intake['year'] = intake.get('Year', None)
        intake['water_type'] = intake.get('Water Type', None)
        intake['purchased_self'] = intake.get('Purchased / Self-Supplied', None)
        intake['source_file'] = os.path.basename(fpath)

        # filter rows if a year is added
        if year is not None:
            intake = intake.query("year == @year")
        
        # declare the default columns to keep in the final edge list (this is 
        # from an earlier version of the code, but I've kept it for verbatimity)
        default_columns = [
            'source', 'target', 'id', 'yearly_volume', 'type', 'year', 
            'water_type', 'purchased_self', 'source_file'
            ]

        # Cleaning rules:
        intake.loc[:, 'source'] = intake['source'].astype(str).apply(self.clean_entity)
        intake.loc[:, 'target'] = intake['target'].astype(str).apply(self.clean_entity)

        # return the cleaned edge list with only the default columns
        return intake[default_columns]
    
    def process(self, 
                intake_file: str, 
                year: Optional[int] = None
                ) -> pd.DataFrame:
        """
        Process intake data and return edge list.
        
        Args:
            intake_file (str): Name of intake CSV file
            year (Optional[int]): Year to filter data
            
        Returns:
            pd.DataFrame: Processed edge list
        """
        print(f"Processing intake data for year {year if year else 'all years'}...")
        
        edges = self.create_intake_elist(intake_file, year=year)
        
        print(f"Created {len(edges)} edges")
        
        return edges

    
def main():
    parser = argparse.ArgumentParser(
        description='Process Texas Water Use Survey data into network format'
    )
    
    parser.add_argument(
        '--input-dir',
        type=str,
        help='Directory containing input CSV files (e.g., inputs)',
        required=True
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        help='Directory for output files (e.g., outputs)',
        required=False
    )

    parser.add_argument(
        '--intake-file',
        type=str,
        help='Name of intake CSV file (e.g., PWS Intake_2022-2023.csv)'
    )
    
    parser.add_argument(
        '--year',
        type=int,
        help='Year to process (e.g., 2022)'
    )
    

    args = parser.parse_args()
    
    # Initialize processor
    processor = WaterNetworkProcessor(
        input_dir=args.input_dir
    )
    
    # Run processing
    edges = processor.process(
        intake_file=args.intake_file,
        year=args.year
    )
    
    print("Processing complete!")


if __name__ == '__main__':
    main()
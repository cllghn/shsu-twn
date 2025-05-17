import marimo

__generated_with = "0.11.8"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""# Generating Network Data from Texas Water Use Survey""")
    return


@app.cell
def _():
    import pandas as pd
    import json
    import marimo as mo
    import numpy as np
    import matplotlib.pyplot as plt
    from typing import List, Optional
    import os
    import re
    from datetime import datetime
    import networkx as nx
    return List, Optional, datetime, json, mo, np, nx, os, pd, plt, re


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        ## Background

        The purpose of this document is to extract the required data to generate a sociogram, or social network graph, of nodes involved in the Texas water system. The data was provided by Texas Water Development Board and it comes from the annual Water Use Survey. The inital data release included four datasets:

         1. PWS Intake: Water intake (self-supplied & purchased) by water source for all Public Water Systems, 2022-2023. Includes USE County, Basin and SOURCE County, Basin. Does not include any water sales. All units are in gallons.
         2. PWS Sales: Water sales (wholesale to other PWS or industrial systems) reported by the seller and buyer. It is important to note that the volumes reported may not be the same between the seller and buyer- meter issues, leaks, etc. may cause inconsistent readings. Additionally, some sellers may not report a water sale to a PWS or vise-versa. All units are in gallons.
        3. PWS Retail: Retail water connections and volumes by category (Single Family, Multi-Family, Instititutional, Industrial, Commercial, Agricultural). Includes population served (reported in the Water Use Survey), total metered, and total un-metered. All units are in gallons.
        4. PWS-SurveyNo: Bridge table for TWDB Survey Numbers and TCEQ PWS Codes that includes PWS Name, whether system is a Wholesale system (Y / N), Water Use Survey Form Type, and PWS System Class.

        From these datasets, we will derive the data required to generate the analytic sociogram. Briefly, a sociogram is a visual representation of social relationships or interactions within a group. To generate a sociogram, two key types of data are needed: an edge list and a node list. The node list contains information about the individual entities (or actors) in the network. In this situation, each node can represent a water source (e.g., aquifer), a water system, or an industrial system within the sociogram. At a minimum the we need to generate a node list with the following:

        - A unique identifier for each node (e.g., ID or name).
        - Optional attributes for the nodes, such as demographics, roles, or other characteristics.

        Beyond the node list, in this document we also extract the required edge list. The edge list describes the relationships or interactions between the nodes. Each edge represents a connection between two nodes and includes:

        - A pair of node identifiers (source and target).
        - Optional attributes, such as the type, weight, or strength of the relationship.

        With a list of data requirements in hand, we can begin transforming our raw data.
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        ## Scoping

        After a high-level scan, it appears that the PWS Intake and PWS Sales files contain relational data that could be incorporated into the edge list. The former, links water sources to water systems. That is, each row in the table represents a water system intaking water from a water source (e.g., aquifer or surface water). For example, the first row in the dataset records Canadian River Municipal Water Authority's intake of groundwater from the Ogallala Aquifer. In this situation, the source node in an edge list would be the aquifer, which provides water to the target water system.
        """
    )
    return


@app.cell
def _(pd):
    pd.read_csv('inputs/PWS Intake_2022-2023.csv').head(10)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Similarly, the latter dataset links water sales from water systems to other water systems or industrial customers. Each row represents a transaction in which water is sold from one entity to another. For example, the first row illustrates the purchase of water by the Amarillo MWS from the Canadian River Municipal Water Authority. In this situation, the source node would be the Canadian River Municipal Water Authority, and the target node would be the buyer.""")
    return


@app.cell
def _(pd):
    pd.read_csv('inputs/PWS Sales_2022-2023.csv').head(1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""Regarding non-relational data, those appear to be located within the PWS Retail and PWS Survey-No files. The former includes information on units served by a water system in a given year. Since those units are not unique nodes, they cannot be considered individual entities within the sociogram. For example, the Upper Leon River MWD and the White River MWD serve single-family homes; however, those single-family homes are not unique entities. The label encompasses a category of units served; as such, this will be recorded as an attribute in the node list.""")
    return


@app.cell
def _(pd):
    pd.read_csv('inputs/PWS Retail_2022-2023.csv').head(1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""On the other hand, the PWS Survey-No file includes attributes of the water systems such as the system class, name, etc. These features are then a match for the node list.""")
    return


@app.cell(hide_code=True)
def _(pd):
    pd.read_csv('inputs/PWS BridgeTable_2022-2023.csv').head(1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## Generating an Edge List

        We need to extact data from two files, intake and sales, in a standard format that can be used as an edge list and in turn converted into a JSON. Why this conversion? Simply, the front-end app uses the [Cystoscape.js library](https://js.cytoscape.org/#introduction) for graph analysis and visualization. The library has a very limited data model that must be [met](https://js.cytoscape.org/#notation/elements-json) to return a network graph. 

        The edge list table **must** include the following fields:

        - Source: The starting point or origin of a connection. It represents the node initiating or "sending" the relationship.
        - Target: The endpoint or recipient of the connection. It represents the node "receiving" the relationship.
        - Id: An optional unique identifier assigned to each edge (connection) in the network. It serves as a reference to distinguish and manage individual edges, particularly when you need to track, modify, or annotate specific relationships. This field is a requirement for Cytoscape, the graphing library used in the front-end application. For simplicity, the unique id is created by combining the type string with the row index for each observation.

        Beyond these mandatory fields, we could include the following edge attributes which appear to be available in both datasets for each record:

        - Volume: Water volume exchanged between the source and target in each record, in gallons.
        - Type: Categorical value denoting the type of exchange represented in the connection (e.g., intake or sale).
        - Year: Year of transaction.
        - Other relevant fields.

        The resulting table would then look something like this:

        ```
        | source | target | id       | volume | type   | year |
        |--------|--------|----------|--------|--------|------|
        | Node A | Node B | intake_1 | 100    | intake | 2022 |
        | Node B | Node C | sale_1   | 100    | sale   | 2023 |
        |                       ...                           |
        ```
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ### Intake Edge List

        First, let's extract the relevant data from the intake file (here `PWS Intake_2022-2023.csv`). The following is a list of steps taken in Python to read, clean, and reshape the data into an edge list in the format noted above:

        1. Load the data from a file:
               - Read the spreadsheet in CSCV format that contains the water intake water.

        2. Clean up the headers in the table by stripping them of leading and lagging empty spaces.


        3. Determine the source of water for each record.


               - For each row in the dataset, the function looks at specific columns to determine where whater comes from:

                   - If the water is reused and self-supplied, the source is a TWDB Survey Number (self-supplied).

                   - If the water is purchased, the source is the Seller’s Survey Number (who sold the water).

                   - If the water is groundwater and self-supplied, the source is an Aquifer (or, if the aquifer is labeled as "OTHER AQUIFER," the source is a basin).

                   - If the water is surface water and self-supplied, the source is a Surface Water Source (or, if labeled "UNKNOWN," the source is a basin).

        4. Create key values required in the edge list:

            - Each record gets a unique ID which serves as the edge identifier.
            - Each record is assigned a target of the water (where it's used) from the TWDB Survey Number.
            - Each record is labeled as `"intake"`.
            - The total volume of water is recorded from the `"Total Intake (Gallons)"` column.
            - The year of intake, water type, and whether it was purchased or self-supplied are also saved for each record.
            - The source file name is added to keep track of where the data came from.

        5. Filter the data by year when relevant.

        6. Return the data as a formated edge list.


        The resulting table head is presented below.
        """
    )
    return


@app.cell(hide_code=True)
def _(List, Optional, os, pd):
    # Intake
    def create_intake_el(df_path: str,
                         columns: Optional[List[str]] = None,
                         el: bool = True,
                         year: Optional[int] = None) -> pd.DataFrame:
        """
        Create edge list from intake data.

        Parameters
        ----------
        df_path : str
            Path to intake data.
        columns : Optional[List[str]], optional
            Columns to include in edge list, by default None. If None, it selects preset list of columns.
        el : bool, optional
            If True, returns edge list, by default True.
        year : Optional[int], optional
            Year of data to select, by default None.

        Returns
        -------
        pd.DataFrame
            Edge list as defined above.
        """
        # Load teh CSG and strip column names from extra spaces
        intake = pd.read_csv(df_path)
        intake.columns = intake.columns.str.strip()

        # The source of the water is dependent on a variety of configurations:
        # - If the water type is reuse and the water is self-supplied, the source is the TWDB Survey Number. A self-loop in the network.
        # - If the water is purchased, the source is the Seller Survey Number. 
        # - If the water type is groundwater and the water is self-supplied, the source is the Aquifer Source. If the Aquifer Source is "OTHER AQUIFER", the source is the Source Basin.
        # - If the water type is surface water and the water is self-supplied, the source is the Surface Water Source. If the Surface Water Source is "UNKNOWN", the source is the Source Basin.
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

        # Apply source processing
        intake['source'] = intake.apply(process_source, axis=1)

        # Create other columns safely(ish)
        intake['target'] = intake.get('TWDB Survey No', None)
        intake['id'] = 'intake_' + intake.index.astype(str)
        intake['type'] = 'intake'
        intake['yearly_volume'] = intake.get('Total Intake (Gallons)', None) # This defaults to None if the column is not found
        intake['year'] = intake.get('Year', None)
        intake['water_type'] = intake.get('Water Type', None)
        intake['purchased_self'] = intake.get('Purchased / Self-Supplied', None)
        intake['source_file'] = os.path.basename(df_path)

        if year is not None:
            intake = intake.query("year == @year")

        if el:
            default_columns = ['source', 'target', 'id', 'yearly_volume', 'type', 'year', 'water_type', 'purchased_self', 'source_file']

            # Cleaning rules:
            intake.loc[:, 'source'] = intake['source'].astype(str)
            intake.loc[:, 'target'] = intake['target'].astype(str)
            def clean_entity(entity: str) -> str:
                if isinstance(entity, str):
                    entity = entity.strip()
                    entity = entity.title()
                return entity

            intake.loc[:, 'source'] = intake['source'].apply(clean_entity)
            intake.loc[:, 'target'] = intake['target'].apply(clean_entity)

            if columns:
                available_columns = [col for col in columns if col in intake.columns]
                return intake[available_columns]
            else:
                return intake[default_columns]

        else:
            return intake

    # Run the function and return an edge list
    intake_el = create_intake_el('inputs/PWS Intake_2022-2023.csv', el=True, year=2022)

    # Look at the top 10 rows in that edge list
    intake_el.head(10)
    return create_intake_el, intake_el


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ### Sales Edge List

        Next, let's apply a similar threatment to the sales data, here stored in the `PWS Sales_2022-2023.csv` file. Like before, the following is a list of the steps applied in Python to munge the data into an edge list:

        1. Load the data file from a single CSC that contains information about water sales.
        2. Clean up spreadsheet headers to remove trailing and leading blank spaces.
        3. Identify key information for each sale:

               - Assing the water seller as the edge source. Here we used the `"TWDB Seller Survey No"` as the source node.
               - Next, we assing a target node that represents the water buyer. We take this value from the `"Buyer Survey No"` column.
               - We generate a transaction identifier that will serve as the edge id.
               - Categorize every transaction as `"sale"`.

        4. Add additional sale details: 
            - The yearly volume is pulled from the `"Buyer Volume Reported"` variable.
            - The year is copied from the source data.
            - The function checks what type of water was sold (e.g., groundwater or surface water) by copying the `"Buyer Water Type"` column.
            - Since all the data here refers to water purchases, we assign the `self_purchased` field to `"Purchased"` for every obeservation.
            - We record the name of the file being processed as a source file to that users can track provenance.

        5. (Optional) We filter data by year (e.g., 2022) to only retain transactions from that year.
        6. Return the data as a formated edge list. 

        The resulting table head is presented below.
        """
    )
    return


@app.cell
def _(List, Optional, os, pd):
    # Sales
    def create_sales_el(df_path: str,
                        columns: Optional[List[str]] = None,
                        el: bool = True,
                        year: Optional[int] = None) -> pd.DataFrame:
        """
        Create edge list from sales data.

        Parameters
        ----------
        df_path : str
            Path to sales data.
        columns : Optional[List[str]], optional
            Columns to include in edge list, by default None. If None, it selects preset list of columns.
        el : bool, optional
            If True, returns edge list, by default True.
        year : Optional[int], optional
            Year of data to filter, by default None.

        Returns
        -------
        pd.DataFrame
            Edge list as defined above.
        """
        sales = pd.read_csv(df_path)
        sales.columns = sales.columns.str.strip()

        # Create columns safely(ish)
        sales['source'] = sales.get('TWDB Seller Survey No')
        sales['target'] = sales.get('Buyer Survey No')
        sales['id'] = 'sales_' + sales.index.astype(str)
        sales['type'] = 'sale'
        # Which volume could be reported per transaction? Is this correct?
        sales['yearly_volume'] = sales.get('Buyer Volume Reported')
        sales['year'] = sales.get('Year')
        sales['water_type'] = sales.get('Buyer Water Type')
        sales['purchased_self'] = 'Purchased'
        sales['source_file'] = os.path.basename(df_path)

        if year is not None:
            sales = sales.query("year == @year")

        if el:
            default_columns = ['source', 'target', 'id', 'yearly_volume', 'type', 'year', 'water_type', 'purchased_self', 'source_file']

            # Cleaning rules:
            sales.loc[:, 'source'] = sales['source'].astype(str)
            sales.loc[:, 'target'] = sales['target'].astype(str)

            if columns:
                available_columns = [col for col in columns if col in sales.columns]
                return sales[available_columns]
            else:
                return sales[default_columns]

        else:
            return sales

    sales_el = create_sales_el('inputs/PWS Sales_2022-2023.csv', 
                               el=True, 
                               year=2022)
    sales_el.head(10)
    return create_sales_el, sales_el


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ### Combining Edge Lists

        With both (intake and sales) edge lists made, we can row bind these tables together. The following table is the resulting edge list.
        """
    )
    return


@app.cell
def _(intake_el, pd, sales_el):
    el = pd.concat([intake_el, sales_el])
    el.head(100)
    return (el,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        ## Generating a Node List

        With the edge list completed, we now turn our attention to generating node list from multiple files (e.g., PWS Retail and Survey-No) and the edge list. The process will require a base table with unique identifiers for the nodes on the edge list. Roughly speaking, these come in two flavors, water sources and water systems. Water sources represent aquifers and surface water, while water systems represent public water systems (PWS) and industrial systems.
        """
    )
    return


@app.cell
def _(el, pd):
    def create_nodes_list(el: pd.DataFrame,
                          intake_file: str) -> pd.DataFrame:
        """
        Create a DataFrame with unique node IDs and classify them as either 'water source' or 'water system'.

        Parameters:
            el (pd.DataFrame): A DataFrame containing 'source' and 'target' columns.
            intake_file (str): Path to the CSV file containing intake data.

        Returns:
            pd.DataFrame: A DataFrame with 'id' and 'preliminary_type' columns.
        """
        # Create an empty DataFrame and add an 'id' column with unique values from 'source' and 'target'
        nodes = pd.DataFrame()
        nodes['id'] = pd.concat([el['source'].astype(str), el['target'].astype(str)]).unique()

        # Load intake data and extract unique water source names
        intake = pd.read_csv(intake_file)
        def clean_entity(entity: str) -> str:
            return entity.strip().title() if isinstance(entity, str) else entity

        water_sources = [
            x + ' BASIN (Source Unknown)' if col == 'Source Basin' else x
            for col in ['Aquifer Source', 'Surface Water Source', 'Source Basin']
            for x in intake[col].dropna().apply(str).unique().tolist()
        ]
        water_sources = [clean_entity(x) for x in water_sources]

        # Assign a preliminary type to each node
        nodes['preliminary_type'] = nodes['id'].apply(lambda x: 'water source' if x in water_sources else 'water system')

        return nodes

    nodes = create_nodes_list(el, 'inputs/PWS Intake_2022-2023.csv')
    nodes.head(10)
    return create_nodes_list, nodes


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        Next, we can begin enriching the node table with attribute data extracted from the retail and bridge files. The retail file includes attributes for nodes with a survey number. This excludes water sources which do not appear to have a numeric unique identifier and some water systems. Thus, the after joining the base node table with the retail data, only nodes with survey numbers will have attributes.

        From the retail table we will take the following attributes:

        - Population Served
        - Single Family Volume and Connections
        - Multi-Family Volume and Connections
        - Commercial Volume and Connections
        - Industrial Volume and Connections
        - Institutional Volume and Connections
        - Agrigultural Volume and Connections
        - Total Metered Volume and Connections
        - Total Un-Metered Volume and Connections

        The following is a list of steps used to read, clean, and reshape the retail data prior to left joining it to the base node table by TWBDB survey number:

        1. Read retail data as is from `PWS Retail_2022-2023.csv`.
        2. Rename `TWDB Survey No` to `id` to make the left join easier.
        3. Filter out data to only include records for the year 2022.
        """
    )
    return


@app.cell
def _(Optional, pd):
    # Retail
    def get_retail_nodes(retail_df_path: str,
                        year: Optional[int] = None) -> pd.DataFrame:
        """
        Reads and processes the retail PWS dataset.

        Parameters:
            retail_df_path (str): Path to the CSV file.
            year (int): Year to filter the data.

        Returns:
            pd.DataFrame: Processed DataFrame with retail nodes.
        """
        out = (pd.read_csv(retail_df_path, dtype={'TWDB Survey No': str})  
                .rename(columns={'TWDB Survey No': 'id', 'PWS Name': 'retail_name'})
               ) 

        if year is not None:
            out = out.query("Year == @year")

        return out

    # Load Retail Data
    retail = get_retail_nodes('inputs/PWS Retail_2022-2023.csv')
    retail.head()
    return get_retail_nodes, retail


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        Next, we can bring in the survey number table as additional node attributes. Like before, this survey contains data for nodes that have a survey number. By definition, this excludes water sources which are not linked to unique identifier. 

        The following is a list of steps used to read, clean, and reshape the survey number data prior to left joining it to the base node table by TWBDB survey number:

        1. Read the survey number data as is from `PWS BridgeTable_2022-2023.csv`.
        2. Rename `TWDB Survey Number` to `id`.
        """
    )
    return


@app.cell
def _(pd):
    def get_survey_nodes(survey_df_path: str) -> pd.DataFrame:
        """
        Reads and processes the survey number dataset.

        Parameters:
            survey_df_path (str): Path to the CSV file.

        Returns:
            pd.DataFrame: Processed DataFrame with survey nodes.
        """
        out = (pd.read_csv(survey_df_path, dtype={'TWDB Survey Number': str})  
                .rename(columns={'TWDB Survey Number': 'id',
                                 'PWS Name': 'sur_name'})
               ) 

        return out

    survey_no = get_survey_nodes('inputs/PWS BridgeTable_2022-2023.csv')
    survey_no.head()
    return get_survey_nodes, survey_no


@app.cell
def _(Optional, get_retail_nodes, get_survey_nodes, nodes, pd):
    def enrich_nodes(nodes: pd.DataFrame,
                     retail_df_path: str,
                     survey_df_path: str,
                     intake_df_path: str,
                     sales_df_path: str,
                     year: Optional[int] = None) -> pd.DataFrame:
        """
        Processes multiple PWS-related datasets and merges them into a unified node dataset.
        """
        # Load and clean Retail data
        retail = get_retail_nodes(retail_df_path, year=year)

        # Load and clean Survey Number data
        survey_no = get_survey_nodes(survey_df_path)

        # Merge Retail and Survey Data
        nodes_retail = nodes.merge(retail, on='id', how='left')
        nodes_retail_no = (nodes
                          .merge(retail, on='id', how='left')
                          .merge(survey_no, on='id', how='left'))

        # TODO: After joining, there are ~2k nodes that do not have a name.
        # This suggests that they are not in the retail or survey number 
        # files. After quickly drilling down on these, they appear to have
        # a name on the intake sheet and other data sets.
        nodes_retail_no['unified_name'] = nodes_retail_no.apply(
            lambda x: x['sur_name'] if x['preliminary_type'] == 'water system' else x['id'],
            axis=1)
        nodes_retail_no['unified_name'] = nodes_retail_no.apply(
            lambda x: x['retail_name'] if pd.isnull(x['unified_name']) else x['unified_name'],
            axis=1)

        # Load and clean Intake data
        intake_missing = (pd.read_csv(intake_df_path,
                                     dtype={'TWDB Survey No': str})
                          .rename(columns={'TWDB Survey No': 'id', 
                                           'PWS Name': 'intake_name'}
                                 )[['id', 'intake_name']]
                         )

        intake_sellers = (pd.read_csv(intake_df_path,
                                     dtype={'Seller Survey Number': str})
                          .rename(columns={'Seller Survey Number': 'id',
                                           'Seller Name': 'intake_seller_name'})
                          .dropna(subset=['intake_seller_name'])
                          .groupby('id').first().reset_index()[['id', 'intake_seller_name']]
                          .assign(intake_seller_name=lambda x: x['intake_seller_name'].str.replace(r'\s\d+$', '', regex=True))
                         )

        # Load and clean Buyer & Seller data
        buyer_missing = (pd.read_csv(sales_df_path,
                                    dtype={'Buyer Survey No': str})
                         .rename(columns={'Buyer Survey No': 'id',
                                          'Buyer Name': 'buyer_name'}
                                )[['id', 'buyer_name']])
        seller_missing = (pd.read_csv(sales_df_path, 
                                      dtype={'TWDB Seller Survey No': str})
                          .rename(columns={'TWDB Seller Survey No': 'id',
                                           'PWS Name': 'seller_name'}
                                 )[['id', 'seller_name']])

        # Perform Merges
        merged_data = (nodes_retail_no
                       .merge(intake_missing, on='id', how='left')
                       .merge(buyer_missing, on='id', how='left')
                       .merge(seller_missing, on='id', how='left')
                       .merge(intake_sellers, on='id', how='left'))

        # Unified name column using fillna instead of multiple apply calls
        merged_data['unified_name'] = merged_data[['unified_name', 'intake_name', 'buyer_name', 'seller_name', 'intake_seller_name']].bfill(axis=1).iloc[:, 0]

        # Quick round of cleaning
        def clean_entity(entity: str) -> str:
            return entity.strip().title() if isinstance(entity, str) else entity

        merged_data['unified_name'] = merged_data['unified_name'].apply(clean_entity)

        return merged_data

    nl = enrich_nodes(nodes, 
                     'inputs/PWS Retail_2022-2023.csv', 
                     'inputs/PWS BridgeTable_2022-2023.csv', 
                     'inputs/PWS Intake_2022-2023.csv', 
                     'inputs/PWS Sales_2022-2023.csv', 
                     year=2022)
    return enrich_nodes, nl


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        Clean up the node list a bit more:

        1. Select specific columns.
        2. Remove duplicates based on the `id`.
        """
    )
    return


@app.cell
def _(nl):
    # Define relevant columns
    columns_to_keep = [
        'id', 'unified_name', 'preliminary_type', 'Year', 'TWDB Estimated?', ' Population Served ',
        ' Single Family Volumes ', ' Single Family Connections ', ' Multi-Family Volumes ',
        ' Multi-Family Connections ', ' Commercial Volume ', ' Commercial Connections ',
        ' Industrial Volumes ', ' Industrial Connections ', ' Institutional Volume ',
        ' Institutional Connections ', ' Agricultural Volumes ', ' Agricultural Connections ',
        ' Total Metered Volume ', ' Total Metered Connections ', ' Total Un-metered Volume ',
        ' Total Un-metered Connections ', 'TCEQ PWS Code', 'Wholesale System?',
        'Water Use Survey Form Type', 'PWS System Class'
    ]

    # Select relevant columns and remove duplicate IDs
    nl_tidy = nl.loc[~nl.duplicated(subset='id', keep='first'),
    columns_to_keep]
    nl_tidy
    return columns_to_keep, nl_tidy


@app.cell
def _(nl_tidy):
    nl_tidy[nl_tidy['id'] == "10"]
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""In May 2025, the TWDB partner asked us to prioritize the intake purchases over the sales when we have parallel edges. Let's take a quick stab at doing that. First, figure out how many repeats we got:""")
    return


@app.cell
def _(el):
    el['pedge_count'] = el.groupby(['source', 'target'])['type'].transform('count')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""Now take a quick look. It appears that we tot a couple intakes and a single sale, which roughly add up to the same value.""")
    return


@app.cell
def _(el):
    el[(el['source'] == "10") & (el['target'] == "684600")]
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Let's go a little further, if there is only one parallel edge (that is, no parallel edge), do nothing. Else, filter to only retain the intake values:""")
    return


@app.cell
def _(el):
    el[
        ((el['pedge_count'] == 1) | ((el['pedge_count'] > 1) & (el['type'] == 'intake'))) & 
        ((el['source'] == "10") & (el['target'] == "684600"))
    ]
    return


@app.cell
def _(el):
    el_noparallel = el[((el['pedge_count'] == 1) | ((el['pedge_count'] > 1) & (el['type'] == 'intake')))].drop(columns=['pedge_count'])
    return (el_noparallel,)


@app.cell
def _(el_noparallel):
    el_noparallel.head(10)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## Exporting Data

        First, let write the data out as a comma-separated value (CSV) file to allow Gephi users to work with them.
        """
    )
    return


@app.cell
def _(datetime, el_noparallel, nl_tidy):
    # Get the current date
    current_date = datetime.now().strftime('%Y%m%d')

    # Save the node and edge lists with the date in the filename
    nl_tidy.to_csv(f'outputs/nodes_{current_date}.csv', index=False)
    el_noparallel.to_csv(f'outputs/edges_{current_date}.csv', index=False)
    return (current_date,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## From Tables to JSON

        The front-end application requires data in as a nested JSON. This is the required JSON format:
        ```
         elements: {
            nodes: [
              {
                data: { id: 'a' }
              },

              {
                data: { id: 'b' }
              }
            ],
            edges: [
              {
                data: { id: 'ab', source: 'a', target: 'b' }
              }
            ]
          },
        ```

        In this section, we transform the data accordingly.
        """
    )
    return


@app.cell
def _():
    # [{"data": record} for record in nl.to_dict(orient='records')]
    # [{"data": record} for record in el.to_dict(orient='records')]
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""To export the graph data, we have to shape it into a dictionary. Then, store it as a JSON. The code below tranforms our node and edge list into a single dictionary that Cytoscape.js can understand.""")
    return


@app.cell
def _(el_noparallel, nl_tidy, np, pd):
    def create_cyto_json(nl: pd.DataFrame, el: pd.DataFrame) -> dict:
        """
        Create a JSON object for Cytoscape.js.

        Parameters:
            nl (pd.DataFrame): Node list.
            el (pd.DataFrame): Edge list.

        Returns:
            dict: JSON object for Cytoscape.js.
        """
        out = {}
        out["elements"] = {}

        out["elements"]["nodes"] = [{"data": record} for record in nl.where(pd.notnull(nl), None).replace({np.nan: None}).to_dict(orient='records')]
        out["elements"]["edges"] = [{"data": record} for record in el.where(pd.notnull(el), None).replace({np.nan: None}).to_dict(orient='records')]

        return out

    cyto = create_cyto_json(nl_tidy,
                            el_noparallel.rename(columns={'from': 'source',
                                               'to': 'target'})
                           )
    return create_cyto_json, cyto


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Write it out in the app directory:""")
    return


@app.cell
def _(cyto, json):
    with open('../app/src/data/network-data.json', 'w') as f:
        json.dump(cyto, f, indent=4)
    return (f,)


@app.cell
def _(el_noparallel):
    len(el_noparallel)
    return


@app.cell
def _(mo):
    mo.md(r"""## Parking Lot""")
    return


@app.cell
def _(el_noparallel, nx):
    G = nx.from_pandas_edgelist(el_noparallel, source='source', target='target', create_using=nx.DiGraph())

    return (G,)


@app.cell
def _(G):
    G.is_directed()
    return


@app.cell
def _(G, el_noparallel, json, nl):
    graph_meta_data = {
        'nodes' : {'title': 'Nodes', 
                   'value': len(G.nodes.data()), 
                   'description': 'These are key points where water is sourced, sold, stored, transferred, or consumed.'},
        'edges' : {'title': 'Connections', 
                   'value': len(G.edges.data()), 
                   'description': 'These represent the pathways through which water moves between nodes.'},
        'directed': G.is_directed(),
        'year': float(el_noparallel['year'].unique()[0]),
        'sources': {'title': 'Water Source Nodes', 
                   'value': len(nl[(nl['preliminary_type'] == 'water source') & (~nl['id'].str.contains('BASIN'))]['id'].unique()), 
                   'description': 'Points in the network where water originates, such as ground and surface water.',
                    'url': '/netexplorer/sources',
                   'kvs': {x['id']: x['unified_name'].upper() for x in nl[(nl['preliminary_type'] == 'water source') & (~nl['id'].str.contains('BASIN'))].to_dict(orient='records')}},
        'systems': {'title': 'Water System Nodes',
                    'value': len(nl[nl['preliminary_type'] == 'water system']['id'].unique()),
                    'description': 'Points in the networks involved in the sale and distribution of water.',
                    'url': '/netexplorer/systems',
                    'kvs': {x['id']: x['unified_name'].upper() for x in nl[nl['preliminary_type'] == 'water system'].to_dict(orient='records')}}
    }

    # graph_meta_data
    with open('../app/src/data/network-meta-data.json', 'w') as md:
        json.dump(graph_meta_data, md, indent=4)
    return graph_meta_data, md


@app.cell
def _(graph_meta_data):
    graph_meta_data
    return


if __name__ == "__main__":
    app.run()

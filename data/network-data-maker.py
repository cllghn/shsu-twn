import marimo

__generated_with = "0.10.7"
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
    import networkx as nx
    import matplotlib.pyplot as plt
    from typing import List, Optional
    import os
    return List, Optional, json, mo, np, nx, os, pd, plt


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

        With the list of requirements in hand, we can begin transforming our raw data.
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
    pd.read_csv('pws/PWS Intake_2022-2023.csv').head(10)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Similarly, the latter dataset links water sales from water systems to other water systems or industrial customers. Each row represents a transaction in which water is sold from one entity to another. For example, the first row illustrates the purchase of water by the Amarillo MWS from the Canadian River Municipal Water Authority. In this situation, the source node would be the Canadian River Municipal Water Authority, and the target node would be the buyer.""")
    return


@app.cell
def _(pd):
    pd.read_csv('pws/PWS Sales_2022-2023.csv').head(1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""Regarding non-relational data, those appear to be located within the PWS Retail and PWS Survey-No files. The former includes information on units served by a water system in a given year. Since those units are not unique nodes, they cannot be considered individual entities within the sociogram. For example, the Upper Leon River MWD and the White River MWD serve single-family homes; however, those single-family homes are not unique entities. The label encompasses a category of units served; as such, this will be recorded as an attribute in the node list.""")
    return


@app.cell
def _(pd):
    pd.read_csv('pws/PWS Retail_2022-2023.csv').head(1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""On the other hand, the PWS Survey-No file includes attributes of the water systems such as the system class, name, etc. These features are then a match for the node list.""")
    return


@app.cell(hide_code=True)
def _(pd):
    pd.read_csv('pws/PWS BridgeTable_2022-2023.csv').head(1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## Generating an Edge List

        We need to extact data from two files, intake and sales, in a standard format that can be used as an edge list and in turn converted into a JSON, which is required by the front-end application. As a table, the edge list must include the following fields:

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
        First, let's extract the relevant data from the `PWS Intake_2022-2023.csv` file. The following is a list of steps taken in Python to read, clean, and reshape the data into an edge list in the format noted above:

        1. Read the CSV as is.
        2. Assign the `TWDB Survey No` column as the `target` field.
        3. Determine the `source` based on the following logic:

               - If the water type is reuse and the water is self-supplied, the source is the TWDB Survey Number. A self-loop in the network.
               - If the water is purchased, the source is the Seller Survey Number.
               - If the water type is groundwater and the water is self-supplied, the source is the Aquifer Source. If the Aquifer Source is "OTHER AQUIFER", the source is the Source Basin.
               - If the water type is surface water and the water is self-supplied, the source is the Surface Water Source. If the Surface Water Source is "UNKNOWN", the source is the Source Basin.

        6. Add an `id` field with the `'intake'` string.
        7. Assigning new variable names to existing ones for consistency later on.
        8. Creating a `source_file` variable with the file name to ensure that data provenance can be tracked.
        9. Optionally, filter for year.
        10. Select only relevant columns (`source`, `target`, `id`, `volume`, `type`, `year`, `water_type`, `purchased_self`, `source_file`).

        The resulting table head is presented below.
        """
    )
    return


@app.cell(hide_code=True)
def _(List, Optional, os, pd):
    # Intake
    def create_intake_el(df_path: str, columns: Optional[List[str]] = None, el: bool = True, year: Optional[int] = None) -> pd.DataFrame:
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
        intake = pd.read_csv(df_path)

        # The source of the water is dependent on a variety of configurations:
        # - If the water type is reuse and the water is self-supplied, the source is the TWDB Survey Number. A self-loop in the network.
        # - If the water is purchased, the source is the Seller Survey Number. 
        # - If the water type is groundwater and the water is self-supplied, the source is the Aquifer Source. If the Aquifer Source is "OTHER AQUIFER", the source is the Source Basin.
        # - If the water type is surface water and the water is self-supplied, the source is the Surface Water Source. If the Surface Water Source is "UNKNOWN", the source is the Source Basin.
        def process_source(row):
            if row['Water Type'] == "Reuse" and row['Purchased / Self-Supplied'] == "Self-Supplied" :
                 return row["TWDB Survey No"]
            elif row['Purchased / Self-Supplied'] == "Purchased" :
                return row["Seller Survey Number"]
            elif row['Water Type'] == "Ground Water" and row['Purchased / Self-Supplied'] == "Self-Supplied":
                # There are no unknowns in the Aquifer Source
                if row['Aquifer Source'] == "OTHER AQUIFER":
                    return row['Source Basin'] + ' BASIN'
                else:
                    return row['Aquifer Source']
            elif row['Water Type'] == "Surface Water" and row['Purchased / Self-Supplied'] == "Self-Supplied":
                if row['Surface Water Source'] == "UNKNOWN":
                    return row['Source Basin'] + ' BASIN'
                else:
                    return row['Surface Water Source']

        intake['target'] = intake['TWDB Survey No']
        intake['source'] = intake.apply(process_source, axis=1)
        intake['id'] = 'intake_' + intake.index.astype(str)
        intake['type'] = 'intake'
        intake['yearly_volume'] = intake[' Total Intake (Gallons) ']
        intake['year'] = intake['Year']
        intake['water_type'] = intake['Water Type']
        intake['purchased_self'] = intake['Purchased / Self-Supplied']
        intake['source_file'] = os.path.basename(df_path)

        if year is not None:
            intake = intake[intake['year'] == year]

        if el:
            if columns:
                intake_el = intake[columns]
            else:
                intake_el = intake[['source', 'target', 'id', 'yearly_volume', 'type', 'year', 'water_type', 
                                    'purchased_self', 'source_file']]
            return intake_el
        else:
            return intake

    intake_el = create_intake_el('pws/PWS Intake_2022-2023.csv', el=True, year=2022)
    intake_el.head(10)
    return create_intake_el, intake_el


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        Next, let's apply a similar threatment to the `PWS Sales_2022-2023.csv` file. Like before, the following is a list of the steps applied in Python to read, clean, and transform the data into an edge list:

        1. Read in the file as is.
        2. Assign the `TWDV Seller Survey No` as the `source`.
        3. Assign the `Buyer Survey No` as the `target`.
        4. Assign preset columns.
        5. Generate `id`.
        6. Creating a `source_file` variable with the file name to ensure that data provenance can be tracked.
        7. Optionally, filter for year.
        8. Select only relevant columns (`source`, `target`, `id`, `volume`, `type`, `year`, `water_type`, `purchased_self`, `source_file`).


        The resulting table head is presented below.
        """
    )
    return


@app.cell
def _(List, Optional, os, pd):
    # Sales
    def create_sales_el(df_path: str, columns: Optional[List[str]] = None, el: bool = True, year: Optional[int] = None) -> pd.DataFrame:
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
        sales['source'] = sales['TWDB Seller Survey No']
        sales['target'] = sales['Buyer Survey No']
        sales['id'] = 'sales_' + sales.index.astype(str)
        sales['type'] = 'sale'
        # Which volume could be reported per transaction? Is this correct?
        sales['yearly_volume'] = sales[' Buyer Volume Reported ']
        sales['year'] = sales['Year']
        sales['water_type'] = sales['Buyer Water Type']
        sales['purchased_self'] = 'Purchased'
        sales['source_file'] = os.path.basename(df_path)

        if year is not None:
            sales = sales[sales['year'] == year]

        if el:
            if columns:
                sales_el = sales[columns]
            else:
                sales_el = sales[['source', 'target', 'id', 'yearly_volume', 'type', 'year', 'water_type', 
                                    'purchased_self', 'source_file']]
            return sales_el
        else:
            return sales

    sales_el = create_sales_el('pws/PWS Sales_2022-2023.csv', el=True, year=2022)
    sales_el.head(10)
    return create_sales_el, sales_el


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""With both edge lists made, we can row bind these tables together. The following table is the resulting edge list.""")
    return


@app.cell
def _(intake_el, pd, sales_el):
    el = pd.concat([intake_el, sales_el])
    el['source'] = el['source'].astype(str)
    el['target'] = el['target'].astype(str)
    el
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
    # Create an empty data frame and add an Id column based on the source and target values
    nodes = pd.DataFrame()
    nodes['id'] = pd.concat([el['source'].astype(str), el['target'].astype(str)]).unique()

    # From the intake data, create a list of water sources that can be used to differentiate IDs
    intake = pd.read_csv('pws/PWS Intake_2022-2023.csv')
    water_sources = [
        x + ' BASIN' if col == 'Source Basin' else x
        for col in ['Aquifer Source', 'Surface Water Source', 'Source Basin']
        for x in intake[col].dropna().apply(str).unique().tolist()
    ]

    # Create a preliminary categorical variable that differentiates between water sources and water systems
    nodes['preliminary_type'] = nodes['id'].apply(lambda x: 'water source' if x in water_sources else 'water system')

    # Take a look at the first 10 rows
    nodes.head(10)
    return intake, nodes, water_sources


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        Next, we can begin enriching the node table with attribute data extracted from the retail and bridge files. The retail file includes attributes for nodes with a survey number. This excludes water sources which do not appear to have a numeric unique identifier. Thus, the after joining the base node table with the reatil data, only nodes with survey numbers will have attributes.

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

        1. Read data as is from `PWS Retail_2022-2023.csv`.
        2. Rename `TWDB Survey No` to `id` to make the left join easier.
        3. Filter out data to only include most recent record by `id`.
        """
    )
    return


@app.cell
def _(pd):
    # Retail
    retail = pd.read_csv('pws/PWS Retail_2022-2023.csv')
    retail.rename(columns={'TWDB Survey No' : 'id', 'PWS Name': 'retail_name'}, inplace=True)
    retail['id'] = retail['id'].astype(str)
    #retail = retail.sort_values(by=['id', 'Year']).groupby('id').tail(1)
    retail = retail[retail['Year'] == 2022]
    retail
    return (retail,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Now, join the `retail` table with the `nodes` table.""")
    return


@app.cell
def _(nodes, pd, retail):
    nodes_retail = pd.merge(nodes, retail, on='id', how='left')
    return (nodes_retail,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        Next, we can bring in the survey number table as additional node attributes. Like before, this survey contains data for nodes that have a survey number. By definition, this excludes water sources which are not linked to unique identifier. 

        The following is a list of steps used to read, clean, and reshape the survey number data prior to left joining it to the base node table by TWBDB survey number:

        1. Read the survey number data as is from `PWS BridgeTable_2022-2023.csv`.
        2. Rename `TWDB Survey Number` to `id`.
        """
    )
    return


@app.cell
def _(pd):
    survey_no = pd.read_csv('pws/PWS BridgeTable_2022-2023.csv')
    survey_no.rename(columns={'TWDB Survey Number': 'id', 'PWS Name' : 'sur_name'}, inplace=True)
    survey_no['id'] = survey_no['id'].astype(str)
    survey_no.head(100)
    return (survey_no,)


@app.cell(hide_code=True)
def _(mo):
    mo.md("""Now join the `survey_no` table with the `nodes` table using a left join.""")
    return


@app.cell
def _(nodes_retail, pd, survey_no):
    nodes_retail_no = pd.merge(nodes_retail, survey_no, on='id', how='left')
    nodes_retail_no.head(100)
    return (nodes_retail_no,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""Lastly, clean up the joined node data, attempting to match ids to names.""")
    return


@app.cell
def _(nodes_retail_no, pd):
    # Yields 2,150 nulls
    nodes_retail_no['unified_name'] = nodes_retail_no.apply(lambda x: x['sur_name'] if x['preliminary_type'] == 'water system' else x['id'], axis=1)
    # Yields 2,123 nulls
    nodes_retail_no['unified_name'] = nodes_retail_no.apply(lambda x: x['retail_name'] if pd.isnull(x['unified_name']) else x['unified_name'], axis=1)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ### Future Investigations

        After joining, there are 2,015 nodes that do not have a name. This suggests that they are not in the retail or survey number files. After quickly drilling down on these, they appear to have a name on the intake sheet.
        """
    )
    return


@app.cell
def _(nodes_retail_no):
    missing_names = nodes_retail_no[nodes_retail_no['unified_name'].isnull()]
    missing_names.head(10)
    return (missing_names,)


@app.cell(hide_code=True)
def _(mo):
    mo.md("""Perhaps if we incorporate names from the intake and sales data we can minimize missing names.""")
    return


@app.cell
def _(nodes_retail_no, pd):
    intake_missing = (pd.read_csv('pws/PWS Intake_2022-2023.csv')
                      .rename(columns={'TWDB Survey No': 'id', 'PWS Name': 'intake_name'}, inplace=False
                             )[['id', 'intake_name']])
    intake_missing['id'] = intake_missing['id'].astype(str)

    intake_sellers = (pd.read_csv('pws/PWS Intake_2022-2023.csv').rename(columns={'Seller Survey Number': 'id', 'Seller Name': 'intake_seller_name'}, inplace=False).dropna(subset=['intake_seller_name']).groupby('id').first().reset_index()[['id', 'intake_seller_name']])
    intake_sellers['intake_seller_name'] = intake_sellers['intake_seller_name'].str.replace(r'\s\d+$', '', regex=True)
    intake_sellers['id'] = intake_sellers['id'].astype(str)

    buyer_missing = (pd.read_csv('pws/PWS Sales_2022-2023.csv')
                      .rename(columns={'Buyer Survey No': 'id', 'Buyer Name': 'buyer_name'}, inplace=False
                             )[['id', 'buyer_name']])
    buyer_missing['id'] = buyer_missing['id'].astype(str)

    seller_missing = (pd.read_csv('pws/PWS Sales_2022-2023.csv')
                      .rename(columns={'TWDB Seller Survey No': 'id', 'PWS Name': 'seller_name'}, inplace=False
                             )[['id', 'seller_name']])
    seller_missing['id'] = seller_missing['id'].astype(str)

    nodes_retail_no_intake = pd.merge(nodes_retail_no, intake_missing, on='id', how='left')
    nodes_retail_no_intake_buyer = pd.merge(nodes_retail_no_intake, buyer_missing, on='id', how='left')
    nodes_retail_no_intake_buyer_seller = pd.merge(nodes_retail_no_intake_buyer, seller_missing, on='id', how='left')
    nodes_retail_no_intake_buyer_seller_ = pd.merge(nodes_retail_no_intake_buyer_seller, intake_sellers, on='id', how='left')

    nodes_retail_no_intake_buyer_seller_['unified_name'] = nodes_retail_no_intake_buyer_seller_.apply(lambda x: x['intake_name'] if pd.isnull(x['unified_name']) else x['unified_name'], axis=1)
    nodes_retail_no_intake_buyer_seller_['unified_name'] = nodes_retail_no_intake_buyer_seller_.apply(lambda x: x['buyer_name'] if pd.isnull(x['unified_name']) else x['unified_name'], axis=1)
    nodes_retail_no_intake_buyer_seller_['unified_name'] = nodes_retail_no_intake_buyer_seller_.apply(lambda x: x['seller_name'] if pd.isnull(x['unified_name']) else x['unified_name'], axis=1)
    nodes_retail_no_intake_buyer_seller_['unified_name'] = nodes_retail_no_intake_buyer_seller_.apply(lambda x: x['intake_seller_name'] if pd.isnull(x['unified_name']) else x['unified_name'], axis=1)

    nodes_retail_no_intake_buyer_seller_.head()
    return (
        buyer_missing,
        intake_missing,
        intake_sellers,
        nodes_retail_no_intake,
        nodes_retail_no_intake_buyer,
        nodes_retail_no_intake_buyer_seller,
        nodes_retail_no_intake_buyer_seller_,
        seller_missing,
    )


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""This seems to close the gap; however, we need to figure out why so many records are missing.""")
    return


@app.cell
def _(nodes_retail_no_intake_buyer_seller_):
    nl = nodes_retail_no_intake_buyer_seller_[['id', 'unified_name', 'preliminary_type', 'Year', 'TWDB Estimated?', ' Population Served ', ' Single Family Volumes ', ' Single Family Connections ', ' Multi-Family Volumes ', ' Multi-Family Connections ', ' Commercial Volume ', ' Commercial Connections ', ' Industrial Volumes ', ' Industrial Connections ', ' Institutional Volume ', ' Institutional Connections ', ' Agricultural Volumes ', ' Agricultural Connections ', ' Total Metered Volume ', ' Total Metered Connections ', ' Total Un-metered Volume ',' Total Un-metered Connections ', 'TCEQ PWS Code','Wholesale System?', 'Water Use Survey Form Type', 'PWS System Class']]
    nl = nl[~nl.duplicated(subset='id', keep='first')]
    nl.head(100)
    return (nl,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## From Tables to CSV

        Let's print them out as CSVs to allow Gephi users to work with them.
        """
    )
    return


@app.cell
def _(el, nl):
    nl.to_csv('nodes.csv', index=False)
    el.to_csv('edges.csv', index=False)
    return


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


@app.cell
def _(el):
    el.rename(columns={'from': 'source', 'to': 'target'}, inplace=True)
    return


@app.cell
def _(el, nx):
    G = nx.from_pandas_edgelist(el, source='source', target='target', create_using=nx.DiGraph())
    positions = nx.spring_layout(G, k=0.1, iterations=100, seed=42) #600 worked well but take 10 mins
    return G, positions


@app.cell
def _(G, nx, plt, positions):
    nx.draw(
        G,
        pos=positions,
        with_labels=False,
        node_color='skyblue',
        node_size=10,
        edge_color='gray'
    )

    plt.show()
    return


@app.cell
def _(nl, pd, positions):
    node_coordinates = {node: (node, pos[0], pos[1]) for node, pos in positions.items()}
    node_coordinates_df = pd.DataFrame.from_dict(node_coordinates, orient='index', columns=['id', 'x', 'y'])
    nl_pos = pd.merge(nl, node_coordinates_df, on='id', how='left')
    nl_pos
    return nl_pos, node_coordinates, node_coordinates_df


@app.cell
def _(el, nl_pos, np, pd):
    out = {}
    out["elements"] = {}

    nodes_coords = [{"data": record} for record in nl_pos.where(pd.notnull(nl_pos), None).replace({np.nan: None}).to_dict(orient='records')]
    for node in nodes_coords: 
        node["position"] = {"x": node['data']["x"], "y": node['data']["y"]}
    out["elements"]["nodes"] = nodes_coords 

    out["elements"]["edges"] = [{"data": record} for record in el.where(pd.notnull(el), None).replace({np.nan: None}).to_dict(orient='records')]
    return node, nodes_coords, out


@app.cell
def _(json, out):
    with open('../app/src/data/network-data.json', 'w') as f:
        json.dump(out, f, indent=4)
    return (f,)


@app.cell
def _(mo):
    mo.md(
        r"""
        ## Graph Meta Data


        """
    )
    return


@app.cell
def _(G, el, nl):
    graph_meta_data = {
        'nodes' : {'title': 'Nodes', 
                   'value': G.number_of_nodes(), 
                   'description': 'These are key points where water is sourced, sold, stored, transferred, or consumed.'},
        'edges' : {'title': 'Connections', 
                   'value': G.number_of_edges(), 
                   'description': 'These represent the pathways through which water moves between nodes.'},
        'directed': G.is_directed(),
        'year': float(el['year'].unique()[0]),
        'sources': {'title': 'Water Source Nodes', 
                   'value': len(nl[(nl['preliminary_type'] == 'water source') & (~nl['id'].str.contains('BASIN'))]['id'].unique()), 
                   'description': 'Points in the network where water originates, such ground and surface water.',
                    'url': '/netexplorer/sources',
                   'kvs': {x['id']: x['unified_name'] for x in nl[(nl['preliminary_type'] == 'water source') & (~nl['id'].str.contains('BASIN'))].to_dict(orient='records')}},
        'systems': {'title': 'Water System Nodes',
                    'value': len(nl[nl['preliminary_type'] == 'water system']['id'].unique()),
                    'description': 'Points in the networks involved in the sale and distribution of water.',
                    'url': '/netexplorer/systems',
                    'kvs': {x['id']: x['unified_name'] for x in nl[nl['preliminary_type'] == 'water system'].to_dict(orient='records')}}
    }

    graph_meta_data
    # with open('../app/src/data/network-meta-data.json', 'w') as md:
    #     json.dump(graph_meta_data, md, indent=4)
    return (graph_meta_data,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## Lingering Questions

        1. For the source in intake we use either the Aquifer or the Surface Water Source. Is this correct or should we reference additional geographic features here (e.g., county or basin)? These latter values differ between the sources. For example, Ogallala Aquifer can be in Roberts or Donley County, which in turn changes the Basin Source.
        2. Why are there unknown intake sources? What should we do in these situations?
        3. I used 2022 retail data assuming that that year was more complete, is that correct? Or should I use the most recent year for each observation? The latter would mean that some retail numbers might come from 2022, while others might come from 2023.
        4. Why do some numeric identifiers appear on the intake form but not on other files? How do we get around these? Could we pass a list to TWDB for them to check?
        """
    )
    return


if __name__ == "__main__":
    app.run()

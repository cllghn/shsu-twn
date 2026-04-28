# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "marimo>=0.22.4",
#     "pandas>=3.0.2",
# ]
# ///

import marimo

__generated_with = "0.23.1"
app = marimo.App(width="medium")


@app.cell
def _():
    import pandas as pd
    import os
    from typing import List, Optional

    # --- 1. Build Intake Edge List ---

    def create_intake_el(df_path: str,
                         columns: Optional[List[str]] = None,
                         el: bool = True,
                         year: Optional[int] = None) -> pd.DataFrame:

        intake = pd.read_csv(df_path)
        intake.columns = intake.columns.str.strip()

        def process_source(row):
            if row.get('Water Type') == "Reuse" and row.get('Purchased / Self-Supplied') == "Self-Supplied":
                return row.get("TWDB Survey No", None)
            elif row.get('Purchased / Self-Supplied') == "Purchased":
                return row.get("Seller Survey Number", None)
            elif row.get('Water Type') == "Ground Water" and row.get('Purchased / Self-Supplied') == "Self-Supplied":
                if row.get('Aquifer Source') == "OTHER AQUIFER":
                    return row.get('Source Basin') + ' BASIN (Source Unknown)'
                else:
                    return row.get('Aquifer Source')
            elif row.get('Water Type') == "Surface Water" and row.get('Purchased / Self-Supplied') == "Self-Supplied":
                if row.get('Surface Water Source') == "UNKNOWN":
                    return row.get('Source Basin') + ' BASIN (Source Unknown)'
                else:
                    return row.get('Surface Water Source')

        intake['source'] = intake.apply(process_source, axis=1)
        intake['source_county'] = intake.get('Source County')
        intake['target'] = intake.get('TWDB Survey No', None)
        intake['target_name'] = intake.get('PWS Name', None)
        intake['target_county'] = intake.get('County Used')
        intake['id'] = 'intake_' + intake.index.astype(str)
        intake['type'] = 'intake'
        intake['yearly_volume'] = intake.get('Total Intake (Gallons)', None)
        intake['year'] = intake.get('Year', None)
        intake['water_type'] = intake.get('Water Type', None)
        intake['purchased_self'] = intake.get('Purchased / Self-Supplied', None)
        intake['source_file'] = os.path.basename(df_path)

        if year is not None:
            intake = intake.query("year == @year")

        if el:
            default_columns = [
                'source', 'target', 'target_name', 'id', 'yearly_volume', 'type',
                'year', 'water_type', 'purchased_self', 'source_file',
                'source_county', 'target_county'
            ]

            def clean_entity(entity: str) -> str:
                if isinstance(entity, str):
                    entity = entity.strip().title()
                return entity

            intake['source'] = intake['source'].astype(str).apply(clean_entity)
            intake['target'] = intake['target'].astype(str).apply(clean_entity)

            if columns:
                available_columns = [col for col in columns if col in intake.columns]
                return intake[available_columns]
            else:
                return intake[default_columns]

        return intake


    # Build it
    intake_el = create_intake_el('inputs/PWS Intake_2022-2023.csv', el=True, year=2022)
    print(f"Intake edge list shape: {intake_el.shape}")
    intake_el.head()
    return List, Optional, intake_el, os, pd


@app.cell
def _(intake_el, pd):
    # Load bridge table IDs
    bridge = pd.read_csv('inputs/PWS BridgeTable_2022-2023.csv', dtype=str)
    bridge.columns = bridge.columns.str.strip()
    bridge_ids = set(bridge['TWDB Survey Number'].dropna().str.strip())

    # Pull unique source and target nodes from the intake edge list
    intake_sources = set(intake_el['source'].dropna().astype(str).str.strip().unique())
    intake_targets = set(intake_el['target'].dropna().astype(str).str.strip().unique())
    all_intake_nodes = intake_sources | intake_targets

    # --- Comparison ---
    in_bridge     = all_intake_nodes & bridge_ids          # present in both
    sources_only  = intake_sources - bridge_ids            # sources not in bridge table
    targets_only  = intake_targets - bridge_ids            # targets not in bridge table
    not_in_bridge = all_intake_nodes - bridge_ids          # any intake node not in bridge table

    print(f"Total unique intake nodes:        {len(all_intake_nodes)}")
    print(f"Found in bridge table:            {len(in_bridge)}")
    print(f"NOT in bridge table (any):        {len(not_in_bridge)}")
    print(f"  └─ Sources not in bridge:       {len(sources_only)}")
    print(f"  └─ Targets not in bridge:       {len(targets_only)}")

    # Inspect the gaps as a DataFrame for easier review
    gaps_df = pd.DataFrame({
        'node_id': sorted(not_in_bridge),
        'is_source': [n in intake_sources for n in sorted(not_in_bridge)],
        'is_target': [n in intake_targets for n in sorted(not_in_bridge)],
    })
    gaps_df
    return bridge_ids, intake_sources, intake_targets


@app.cell
def _(bridge_ids, intake_sources):
    unknown_sources: list[str] = [n for n in intake_sources if n not in bridge_ids and not n.isdigit()]
    print(f"Unique source nodes made up of letters not in bridge table: {len(unknown_sources)}")
    print("Examples of unknown sources (n=10):")
    for s in unknown_sources[:10]:
        print(f"  - {s}")
    print(f"  - ...{len(unknown_sources) - 10} more")
    return


@app.cell
def _(bridge_ids, intake_sources):
    unknown_digit_sources: list[str] = [n for n in intake_sources if n not in bridge_ids and n.isdigit()]
    print(f"Unique source nodes made up of digits not in bridge table: {len(unknown_digit_sources)}")
    print("Examples of unknown digit sources (n=10):")
    for stri in unknown_digit_sources[:10]:
        print(f"  - {stri}")
    print(f"  - ...{len(unknown_digit_sources) - 10} more")
    return


@app.cell
def _(bridge_ids, intake_sources, intake_targets):
    tranformation_list = {
            # Brazos River System to Brazos River System, issue appears to be created by double seller ID from user inputs
            "331": "325",
            # Beach and Tennis Club Hoa appears in two tables intakes and sales, but recoded using the number seen in the bridge table
            "1104065": "1104547",#
            # Cedar Creek Reservoir appears twice in the intake seller survery number variable, bad user input
            "175": "190", #
            # Cedar Creek Water system appears to be a two individual systems
            # Cedar Creek Water Systems!
            # Cisco is three numbers!
            # City of Bryan appears in bridge table as 102400, so we went with that
            "1103744": "102400", #
            # City of Bryan appears in bridge table as 185000, so we went with that
            "1103607": "185000", #
            # City of Morgans Point appears in bridge table as 578600, so we went with that
            "1106104": "578600", #
            # There are two cities of Reno, so we went with keeping both
            # 722750 != 722750
            # City of Rose City and City of Royse are different
            # 742622 != 750700
            # Eagle Mountain we assumed that the id for seller was a user error and recoded as the source
            '195': 'Eagle Mountain Lake/Reservoir',
            # Emerald Forest appears in bridge table as 60134, so we went with that
            "1103775": "60134", #
            # There are two Enchanted Forests in the bridge table
            # 267275 != 817582
            # There are two FMC Technologies Inc in the Seller data under the buyer column, we went with one over the other for no particular reason, but assuming that this is an input error.abs
            "291334": "623100", #
            # G & W WSC has two unique nodes
            # 312941 != 312943
            # Green trails mud, confirmed valid number against the bridge table
            "1101657": "342282", #
            # Confirmed Harris County 91 against the bridge table
            "1106324": "371091", #
            # Hickory Hollow Water System was confirmed against the bridge table
            "385415": "880970", #
            # Two Hidalgo County LDs
            # 800 != 805
            # Two Hidalgo Irrigation Districts
            # 1103097 != 1105159
            ## TODO: Industrial Utilities Service
            # Lago Vista Water System
            "1103477": "479500", #
            # Consolidate Lake Houston
            "250": "Lake Houston", #
            # Mill Creek, keep as is
            # Oak Hollow Subdivision there are two in the bridge table
            # '617710' !=  '817589',
            # Oak Shores Water System there are two in the bridge table
            # 618415 != 618510,
            # Pecan Grove Mobile Home Park there are two in the bridge table
            # 653867 != 1106279 ,
            ## TODO: Figure out Possum Kingdom
            '370': 'Possum Kingdom Lake/Reservoir',
            ## TODO: Figure out Run of The River
            # DELETE THESE NODES -------------------
            # SHADY ACRES two of them in the bridge table
            # 873016 != 1102390
            # SHADY OAKS MHP wto of them on the bridge table
            # 1104504 != 1104574
            # Sk Mobile Home Park there are two on the bridge table
            # 626055 != 801181
            # Southmost Regional Water Authority or 1102242 on bridge table
            "1103610": "1102242", #
            # Tarrant Regional Water District
            "1102621": "1104223", #
            ## TODO: TOLEDO BEND
            '80': 'Toledo Bend Lake/Reservoir',
            # Tra Trinity County Regional
            "950": "873990", #
            # Travis County Mud 18
            '1103692': '1103819', #
            # TODO: FIgure out what to do with the unspecified facility
            # DELETE THESE NODES -------------------
            # West Travis County Public Utility Agency
            '1103957': '891348', #
            # Two westwood subdivisions
            # 919658 != 938320
        }


    unknown_digit_sources_: list[str] = [n for n in intake_sources if n not in bridge_ids and n.isdigit() and n not in tranformation_list.keys() and n not in tranformation_list.values()]
    unknown_digit_targets_: list[str] = [n for n in intake_targets if n not in bridge_ids and n.isdigit() and n not in tranformation_list.keys() and n not in tranformation_list.values()]

    print(f"Unique source nodes, in intake table, made up of digits not in bridge table: {len(unknown_digit_sources_)}")
    print(f"Unique target nodes, in intake table, made up of digits not in bridge table: {len(unknown_digit_targets_)}")
    print(f"Unique digit nodes in intake table, not in bridge table: {len(set(unknown_digit_sources_ + unknown_digit_targets_))}")
    print("Examples of unknown digit sources (n=10):")
    for uds in unknown_digit_sources_[:10]:
        print(f"  - {uds}")
    if len(unknown_digit_sources_) > 10:
        print(f"  - ...{len(unknown_digit_sources_) - 10} more")
    print("Examples of unknown digit targets (n=10):")
    for udt in unknown_digit_targets_[:10]:
        print(f"  - {udt}")
    if len(unknown_digit_targets_) > 10:
        print(f"  - ...{len(unknown_digit_targets_) - 10} more")
    return (tranformation_list,)


@app.cell
def _(intake_el, pd):
    # --- 3. Compare Bridge IDs and Names vs Intake Target IDs and Names ---

    bridges = pd.read_csv('inputs/PWS BridgeTable_2022-2023.csv', dtype=str)
    bridges.columns = bridges.columns.str.strip()

    # Clean bridge for comparison
    bridge_clean = (bridges[['TWDB Survey Number', 'PWS Name']]
                    .dropna(subset=['TWDB Survey Number'])
                    .drop_duplicates(subset=['TWDB Survey Number'])
                    .rename(columns={'TWDB Survey Number': 'bridge_id', 'PWS Name': 'bridge_name'})
                    .assign(bridge_id=lambda x: x['bridge_id'].str.strip(),
                            bridge_name=lambda x: x['bridge_name'].str.strip().str.title()))

    # Clean intake targets for comparison
    intake_targets_clean = (intake_el[['target', 'target_name']]
                            .dropna(subset=['target'])
                            .drop_duplicates(subset=['target'])
                            .rename(columns={'target': 'intake_id', 'target_name': 'intake_name'})
                            .assign(intake_id=lambda x: x['intake_id'].str.strip(),
                                    intake_name=lambda x: x['intake_name'].str.strip().str.title()))

    # Outer join to capture all cases
    comparison = intake_targets_clean.merge(bridge_clean, 
                                            left_on='intake_id', 
                                            right_on='bridge_id', 
                                            how='outer')

    # Classify each row
    def classify(row):
        has_intake = pd.notna(row['intake_id'])
        has_bridge = pd.notna(row['bridge_id'])
        if has_intake and has_bridge:
            if row['intake_name'] == row['bridge_name']:
                return 'ID match, name match'
            else:
                return 'ID match, name mismatch'
        elif has_intake and not has_bridge:
            return 'In intake only (missing from bridge)'
        elif has_bridge and not has_intake:
            return 'In bridge only (missing from intake)'

    comparison['match_status'] = comparison.apply(classify, axis=1)

    # Summary
    print(comparison['match_status'].value_counts().to_string())
    print(f"\nTotal rows: {len(comparison)}")

    comparison.sort_values('match_status')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    Can't compare the sources since these don't have a name.
    """)
    return


@app.cell
def _(List, Optional, os, pd):
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

        sales['source'] = sales.get('TWDB Seller Survey No').astype(str)
        sales['source_county'] = sales.get('Seller County')
        sales['target'] = sales.get('Buyer Survey No').astype(str)
        sales['target_county'] = 'Not listed in Sales data.'
        sales['id'] = 'sales_' + sales.index.astype(str)
        sales['type'] = 'sale'
        sales['yearly_volume'] = sales.get('Buyer Volume Reported')
        sales['year'] = sales.get('Year')
        sales['water_type'] = sales.get('Buyer Water Type')
        sales['purchased_self'] = 'Purchased'
        sales['source_file'] = os.path.basename(df_path)

        if year is not None:
            sales = sales.query("year == @year")

        if el:
            default_columns = ['source', 'target', 'id', 'yearly_volume', 'type', 'year', 'water_type', 'purchased_self', 'source_file']

            if columns:
                available_columns = [col for col in columns if col in sales.columns]
                return sales[available_columns]
            else:
                return sales[default_columns]

        else:
            return sales

    sales_el = create_sales_el('inputs/PWS Sales_2022-2023.csv', el=True, year=2022)
    sales_el.head(10)

    return (sales_el,)


@app.cell
def _(bridge_ids, sales_el, tranformation_list):
    sales_sources = set(sales_el['source'].dropna().astype(str).str.strip().unique())
    sales_targets = set(sales_el['target'].dropna().astype(str).str.strip().unique())

    sales_unknown_digit_sources_: list[str] = [n for n in sales_sources if n not in bridge_ids and n.isdigit() and n not in tranformation_list.keys() and n not in tranformation_list.values()]
    sales_unknown_digit_targets_: list[str] = [n for n in sales_targets if n not in bridge_ids and n.isdigit() and n not in tranformation_list.keys() and n not in tranformation_list.values()]

    print(f"Unique source nodes, in sales table, made up of digits not in bridge table: {len(sales_unknown_digit_sources_)}")
    print(f"Unique target nodes, in sales table, made up of digits not in bridge table: {len(sales_unknown_digit_targets_)}")
    print(f"Unique digit nodes in sales table, not in bridge table: {len(set(sales_unknown_digit_sources_ + sales_unknown_digit_targets_))}")
    print("Examples of unknown digit sources (n=10):")
    for suds in sales_unknown_digit_sources_[:10]:
        print(f"  - {suds}")
    if len(sales_unknown_digit_sources_) > 10:
        print(f"  - ...{len(sales_unknown_digit_sources_) - 10} more")
    print("Examples of unknown digit targets (n=10):")
    for sudt in sales_unknown_digit_targets_[:10]:
        print(f"  - {sudt}")
    if len(sales_unknown_digit_targets_) > 10:
        print(f"  - ...{len(sales_unknown_digit_targets_) - 10} more")
    return


@app.cell
def _(bridge_ids):
    len(bridge_ids)
    return


if __name__ == "__main__":
    app.run()

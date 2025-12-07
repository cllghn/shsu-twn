# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "marimo>=0.17.0",
#     "pyzmq",
# ]
# ///

import marimo

__generated_with = "0.17.7"
app = marimo.App()


@app.cell
def _():
    import marimo as mo
    from fuzzywuzzy import fuzz
    from strsimpy.jaro_winkler import JaroWinkler
    import pandas as pd
    from typing import List

    jarowinkler = JaroWinkler()
    return List, fuzz, jarowinkler, pd


@app.cell
def _(fuzz):
    string1 = "TARRANT REGIONAL WATER DISTRICT"
    string2 = "TARRANT REGIONAL WATER DISTRICT"
    similarity_ratio = fuzz.ratio(string1, string2)
    print(f"Levenshtein similarity ratio: {similarity_ratio}")
    return


@app.cell
def _(pd):
    nodes = (pd
        .read_csv('data/outputs/nodes_20250604.csv')
        .set_index('id')['unified_name']
        .to_dict())

    subset = dict(list(nodes.items())[:500])


    return (nodes,)


@app.cell
def _(List, pd):
    def clean_name(name: str, patterns_to_remove: List[str] = None) -> str:
        """Remove common patterns from names before comparison."""
        if patterns_to_remove is None:
            patterns_to_remove = ['Lake/Reservoir', 'Basin (Source Unknown)', "Run Of River", 'City Of ']
    
        cleaned = name
        for pattern in patterns_to_remove:
            cleaned = cleaned.replace(pattern, '')
            
        return cleaned.strip()

    def find_similar_nodes(nodes_dict: dict, similarity_func, min_similarity: float, ignore_patterns: bool = False) -> dict:
        """
        Find similar nodes using a specified similarity function.
    
        Args:
            nodes_dict: Dictionary of {id: name}
            similarity_func: Function that takes (id, name, nodes_dict, min_similarity)
            min_similarity: Minimum similarity threshold
            ignore_patterns: Should we use the clean_name function?
    
        Returns:
            Dictionary of {id: [list of matches]}
        """
        results = {
            k: similarity_func(k, v, {n_id: n for n_id, n in nodes_dict.items() if n_id != k}, min_similarity, ignore_patterns) 
            for k, v in nodes_dict.items()
        }
        return results

    def flatten_results_to_df(results: dict) -> pd.DataFrame:
        """
        Flatten similarity results dictionary to DataFrame.
    
        Args:
            results: Dictionary of {id: [list of matches]}
    
        Returns:
            DataFrame with all matches
        """
        flattened = []
        for node_id, matches in results.items():
            flattened.extend(matches)
        return pd.DataFrame(flattened)
    return clean_name, find_similar_nodes, flatten_results_to_df


@app.cell
def _(
    List,
    clean_name,
    find_similar_nodes,
    flatten_results_to_df,
    fuzz,
    nodes,
):
    def levenstein_similarty(id: str, name: str, names_dict: dict, 
                             min_similarity: int, 
                             ignore_patterns: bool = False) -> List[dict]:
        out = []
    
        for node_id, node_name in names_dict.items():
            if node_id == id:  # Skip self
                continue


            if ignore_patterns:
                similarity_ratio = round(
                    fuzz.ratio(
                        clean_name(name).lower(), 
                        clean_name(node_name).lower()
                    ), 2
                )
            
            else:
                similarity_ratio = round(
                    fuzz.ratio(
                        name.lower(), 
                        node_name.lower()
                    ), 2
                )
            
            if similarity_ratio >= min_similarity:
                temp = {
                    'id': id,
                    'name': name,
                    'match_id': node_id,
                    'match_name': node_name, 
                    'lv_similarity_score': similarity_ratio,
                    'ignore_patterns': ignore_patterns,
                    'id_match': id == node_id
                }
            
                if ignore_patterns:
                    temp['clean_name'] = clean_name(name).lower()
                    temp['clean_match_name'] = clean_name(node_name).lower()
                    temp['identical_clean_strings'] = clean_name(name).lower() == clean_name(node_name).lower()
                    temp['raw_lv_similarity_score'] = similarity_ratio = round(
                        fuzz.ratio(
                            name.lower(), 
                            node_name.lower()
                        ), 2
                    )
            

                out.append(temp)
                

        return out

    # Put functions into use:
    lv_results = find_similar_nodes(nodes, 
                                    levenstein_similarty, 
                                    min_similarity=90, 
                                    ignore_patterns = True)
    lv_df = flatten_results_to_df(lv_results)
    return (lv_df,)


@app.cell
def _(lv_df):
    patterns_to_remove = ['Lake/Reservoir', 'Basin (Source Unknown)', "Run Of River", 'City Of ']
    pattern_regex = '|'.join(patterns_to_remove)

    lv_df['both_with_patterns'] = (
        lv_df['name'].str.contains(pattern_regex, case=False) & 
        lv_df['match_name'].str.contains(pattern_regex, case=False)
    )

    df1 = lv_df[lv_df['both_with_patterns'] & ~lv_df['identical_clean_strings']]
    return (df1,)


@app.cell
def _(lv_df):
    df2 = lv_df[~lv_df['both_with_patterns'] & lv_df['identical_clean_strings']]
    return (df2,)


@app.cell
def _(lv_df):
    df3 = lv_df[(lv_df['raw_lv_similarity_score'] >= 80) & (lv_df['name'] == lv_df['match_name']) ]
    return (df3,)


@app.cell
def _(df1, df2, df3, pd):
    result = pd.concat([df1, df2, df3], ignore_index=True)
    return (result,)


@app.cell
def _(result):
    result.to_csv('./data/lv_similarity.csv', index=False)
    return


@app.cell
def _(
    List,
    clean_name,
    find_similar_nodes,
    flatten_results_to_df,
    jarowinkler,
    nodes,
):
    def jarowinkler_similarity(id: str, name: str, names_dict: dict, 
                              min_similarity: float = 0.9, 
                              ignore_patterns: bool = False) -> List[dict]:
        out = []
        for node_id, node_name in names_dict.items():
            if node_id == id:  # Skip self
                continue

            if ignore_patterns:
                similarity_ratio = round(
                    jarowinkler.similarity(
                        clean_name(name).lower(), 
                        clean_name(node_name).lower()
                    ), 2
                )
            
            else:
                similarity_ratio = round(
                    jarowinkler.similarity(
                        name.lower(), 
                        node_name.lower()
                    ), 2
                )
        
        
        
            if similarity_ratio >= min_similarity:
                temp = {
                    'id': id,
                    'name': name,
                    'match_id': node_id,
                    'match_name': node_name, 
                    'jw_similarity_score': similarity_ratio,
                    'ignore_patterns': ignore_patterns,
                    'id_match': id == node_id
                }

                if ignore_patterns:
                    temp['clean_name'] = clean_name(name).lower()
                    temp['clean_match_name'] = clean_name(node_name).lower()
                    temp['identical_clean_strings'] = clean_name(name).lower() == clean_name(node_name).lower()
            
                out.append(temp)
    
        return out
    
    # Put functions into use:
    jw_results = find_similar_nodes(nodes, jarowinkler_similarity, min_similarity=0.9)
    jw_df = flatten_results_to_df(jw_results)
    jw_df
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()

import marimo

__generated_with = "0.11.8"
app = marimo.App()


@app.cell
def _():
    import marimo as mo
    import networkx as nx
    import pandas as pd
    import matplotlib.pyplot as plt
    import numpy as np
    return mo, np, nx, pd, plt


@app.cell
def _(pd):
    edges = pd.read_csv("outputs/edges_20250604.csv")
    nodes = pd.read_csv("outputs/nodes_20250604.csv").set_index("id")
    return edges, nodes


@app.cell
def _(edges, nx):
    G = nx.from_pandas_edgelist(edges, source = "source", target = "target", create_using=nx.DiGraph)
    return (G,)


@app.cell
def _(G, nodes):
    for node_id, row in nodes.iterrows():
        if node_id in G:
            G.nodes[node_id].update(row.to_dict())
    return node_id, row


@app.cell
def _(G):
    print(G.nodes['Ogallala Aquifer'])
    return


@app.cell
def _(G, nx):
    # Let's get some basic topographic metrics to get ourselves situated:
    topo = {
        'nodes': G.number_of_nodes(),
        'edges': G.number_of_edges(),
        'is_directed': G.is_directed(),
        'density': nx.density(G),
        'average_degree': sum(dict(G.degree()).values()) / G.number_of_nodes(),
        'weak_component_count': nx.number_connected_components(G.to_undirected())
    }

    # pd.DataFrame([topo])
    topo
    return (topo,)


@app.cell
def _(G, pd):
    # Get degree (k) for each node
    k_Pk = {}

    for value in dict(G.degree()).values():
        if value not in k_Pk:
            k_Pk[value] = {
                'degree': value,
                'count': 0,
                'probability': 0
            }
        k_Pk[value]['count'] += 1 

    # Turn our counts to probs (P(k))
    total_nodes = G.number_of_nodes()
    for degree in k_Pk:
        k_Pk[degree]['probability'] = k_Pk[degree]['count'] / total_nodes

    k_Pk_df = pd.DataFrame.from_dict(k_Pk).T
    return degree, k_Pk, k_Pk_df, total_nodes, value


@app.cell
def _(k_Pk_df, plt):
    degrees = k_Pk_df.index.tolist()  # x-axis
    probabilities = k_Pk_df['probability'].tolist()  # y-axis

    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.scatter(degrees, probabilities, s=20, color='steelblue', alpha=0.7)
    plt.xlabel('Degree (k)')
    plt.ylabel('Probability P(k)')
    plt.grid(True, alpha=0.3)
    plt.show()
    return degrees, probabilities


@app.cell
def _(degrees, np, plt, probabilities):
    log_degrees = np.log10(np.array(degrees) + 1e-10)  
    log_probabilities = np.log10(np.array(probabilities) + 1e-10)  # log base 10

    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.scatter(log_degrees, log_probabilities, s=20, color='steelblue', alpha=0.7)
    plt.xlabel('Log Degree (k)')
    plt.ylabel('Log Probability P(k)')
    plt.grid(True, alpha=0.3)
    plt.show()
    return log_degrees, log_probabilities


@app.cell
def _(G, nx):
    def calculate_degree_of_fragmentation(mod_G):
        """
        Calculate the degree of fragmentation for a graph.
    
        The degree of fragmentation is calculated as:
        (2 * sum(1/d_ij)) / (n * (n-1))
    
        where d_ij is the shortest path distance between nodes i and j,
        and n is the total number of nodes.
        """
        # Total number of nodes
        n = len(mod_G.nodes)
    
        if n <= 1:
            return 0.0
    
        denominator = n * (n - 1)
        sum_of_reciprocal_distances = 0.0

        # Get all shortest path lengths (works for both directed and undirected)
        distance_matrix = dict(nx.all_pairs_shortest_path_length(mod_G))
    
        # Calculate sum of reciprocal distances
        for source in mod_G.nodes:
            if source in distance_matrix:
                for destination in mod_G.nodes:
                    if source != destination and destination in distance_matrix[source]:
                        distance = distance_matrix[source][destination]
                        if distance > 0:  # Safety check
                            sum_of_reciprocal_distances += 1.0 / distance

        # Calculate degree of fragmentation
        degree_of_fragmentation = (2.0 * sum_of_reciprocal_distances) / denominator
    
        return degree_of_fragmentation

    calculate_degree_of_fragmentation(G)
    return (calculate_degree_of_fragmentation,)


if __name__ == "__main__":
    app.run()

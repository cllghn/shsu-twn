import marimo

__generated_with = "0.10.7"
app = marimo.App(width="medium")


@app.cell
def _():
    import pandas as pd
    import json
    import marimo as mo
    return json, mo, pd


@app.cell
def _(pd):
    el = pd.read_csv('edgelist.csv')
    nl = pd.read_csv('nodelist.csv')
    return el, nl


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        This is the required JSON format:
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
        """
    )
    return


@app.cell
def _(nl):
    [{"data": record} for record in nl.to_dict(orient='records')]
    return


@app.cell
def _(el):
    el['id'] = el.index
    el.rename(columns={'from': 'source', 'to': 'target'}, inplace=True)

    [{"data": record} for record in el.to_dict(orient='records')]
    return


@app.cell
def _(el, nl):
    out = {}
    out["elements"] = {}
    out["elements"]["nodes"] = [{"data": record} for record in nl.to_dict(orient='records')]
    out["elements"]["edges"] = [{"data": record} for record in el.to_dict(orient='records')]
    return (out,)


@app.cell
def _(json, out):
    with open('../app/src/app/graph/network-data.json', 'w') as f:
        json.dump(out, f, indent=4)
    return (f,)


if __name__ == "__main__":
    app.run()

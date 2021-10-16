import plotly.figure_factory as ff
import plotly.graph_objects as go
import numpy
import pandas

from plotly.offline import plot
from sklearn import tree

import stock.dash_apps.forest as forest


# Create timeseries visualisation.
def generate_timeseries(date):
    x = rdm_model.data.index.tolist()
    y = rdm_model.data['Adj_Close']

    fig = go.Figure(data=go.Scatter(x=x, y=y, mode='lines', showlegend=False))
    fig.update_layout(title='Timeseries', xaxis={'title': 'Date'}, yaxis={'title': 'Closing Price ($)'})

    if date is not None:
        x = date['points'][0]['x']
        y = date['points'][0]['y']
    else:
        x = x[-1]
        y = y[-1]

    if rdm_model.model_prediction(x) == 'Up':
        colour = ['#028000']
    else:
        colour = ['#fe0100']

    fig.add_trace(go.Scatter(x=[x], y=[y], marker=dict(size=[8], color=colour, line_width=0, opacity=1), showlegend=False))

    return fig


# Create matrix visualisation.
def generate_intensity_matrix(date, d_tree):
    matrix = rdm_model.decision_tree_accuracy(date)
    matrix_colors = [[0, 'red'], [1, 'green']]
    positive = list(map(abs, matrix))
    matrix_text = numpy.around(positive, decimals=2)

    yaxis_template = dict(showgrid=False, zeroline=False, showticklabels=False,
                         ticks='')
    xaxis_template = dict(showgrid=False, zeroline=False, showticklabels=False,
                          ticks='', title='Matrix')

    max_matrix = max(matrix.flatten())
    min_matrix = min(matrix.flatten())

    fig = go.Figure(data=go.Heatmap(z=matrix, colorscale=matrix_colors, colorbar=dict(ticks='inside', tickmode='array', nticks=2, ticktext=['Up', 'Down'], tickvals=[max_matrix, min_matrix])))
    fig.update_layout(title='Forest', xaxis=xaxis_template, yaxis=yaxis_template)

    if d_tree is not None:
        x = d_tree['points'][0]['x']
        y = d_tree['points'][0]['y']
    else:
        x = 0
        y = 0

    fig.add_shape(type='rect', xref='x', yref='y', x0=x-0.5, x1 = x+0.5, y0=y-0.5, y1=y+0.5,
                      line=dict(color="#b3d9ff", width=3))

    fig_div = plot(fig, output_type='div')

    return fig


# Create feature importance bar chart.
def generate_feature_importance(model):

    labels = [{'label': 'Momentum RSI', 'value': 'momentum_rsi'},
                {'label': 'Trend EMA', 'value': 'trend_ema_fast'},
                {'label': 'Momentum WR', 'value': 'momentum_wr'},
                {'label': 'Momentum Stoch', 'value': 'momentum_stoch'},
                {'label': 'Trend ADX', 'value': 'trend_adx'},
                {'label': 'Volume ADI', 'value': 'volume_adi'},
                {'label': 'Trend CCI', 'value': 'trend_cci'},
                {'label': 'Trend MACD', 'value': 'trend_macd'},
                {'label': 'Volatility BBM', 'value': 'volatility_bbm'},
                {'label': 'Momentum ROC', 'value': 'momentum_roc'},
                {'label': 'Volume OBV', 'value': 'volume_obv'},
                {'label': 'Volatility ATR', 'value': 'volatility_atr'},
                {'label': 'Momentum MFI', 'value': 'momentum_mfi'},
                {'label': 'Volatility BBL', 'value': 'volatility_bbl'},
                {'label': 'Volume EMV', 'value': 'volume_em'}]

    features = []
    for f in rdm_model.features:
        for x in labels:
            if f == x.get('value'):
                features.append(x.get('label'))

    importance = model.feature_importances_
    d = {'Importance': importance, 'Features': features}

    fig = go.Figure(go.Bar(y=d['Features'], x=d['Importance'], orientation='h'))
    fig.update_layout(xaxis={'categoryorder': 'total descending', 'title': 'Feature Importance'})

    return fig


class Node:

    def __init__(self, val, f, t, e):
        self.val = val
        self.left = None
        self.right = None
        self.x = None
        self.y = None
        self.feature = f
        self.threshold = t
        self.entropy = e


i = [0]


def knuth_layout(n, depth):
    if n.left is not None:
        knuth_layout(n.left, depth + 1)
    n.x = i[0]
    n.y = depth
    i[0] += 1
    if n.right is not None:
        knuth_layout(n.right, depth + 1)


def create_nodes(estimator):
    n_nodes = estimator.tree_.node_count
    children_left = estimator.tree_.children_left
    children_right = estimator.tree_.children_right
    feature = estimator.tree_.feature
    threshold = estimator.tree_.threshold
    entropy = estimator.tree_.impurity

    #print(feature)

    nodes = []

    for i in range(n_nodes):
        f = 'none'
        if feature[i] != -2:
            f = rdm_model.features[feature[i]]
        #print(f)
        nodes.append(Node(i, f, threshold[i], entropy[i]))

    for node in nodes:
        # print(node.val, " left ", children_left[node.val])
        if children_left[node.val] != -1:
            node.left = nodes[children_left[node.val]]

        if children_right[node.val] != -1:
            node.right = nodes[children_right[node.val]]

    knuth_layout(nodes[0], 0)

    #tree.export_graphviz(estimator, out_file='output.dot')

    return nodes


def generate_tree(estimator, date):
    nodes = create_nodes(estimator)

    Xn = [node.x for node in nodes]
    Yn = [-node.y for node in nodes]
    Zn = [{'Feature: ' + str(node.feature), 'Threshold: ' + str(node.threshold)} for node in nodes]
    Xe = []
    Ye = []
    for node in nodes:
        if node.left is not None:
            Xe += [node.x, node.left.x, None]
            Ye += [-node.y, -node.left.y, None]

        if node.right is not None:
            Xe += [node.x, node.right.x, None]
            Ye += [-node.y, -node.right.y, None]

    d_path = estimator.decision_path(rdm_model.get_values_for_date(date)).toarray()[0]
    Xd = []
    Yd = []
    for i in range(len(d_path)):
        if d_path[i] == 1:
            Xd.append(nodes[i].x)
            Yd.append(-nodes[i].y)

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=Xe,
                             y=Ye,
                             mode='lines',
                             line=dict(color='rgb(210,210,210)', width=1),
                             hoverinfo='none'
                             ))
    fig.add_trace(go.Scatter(x=Xn,
                             y=Yn,
                             text=Zn,
                             mode='markers',
                             name='nodes',
                             marker=dict(size=18,
                                         color='#6175c1',  # '#DB4551',
                                         line=dict(color='rgb(50,50,50)', width=1)
                                         ),
                             hoverinfo='text',
                             opacity=0.8
                             ))
    fig.add_trace(go.Scatter(x=Xd,
                             y=Yd,
                             text=Zn,
                             mode='markers',
                             name='nodes',
                             marker=dict(size=18,
                                         color='rgb(255,0,0)',  # '#DB4551',
                                         line=dict(color='rgb(50,50,50)', width=1)
                                         ),
                             hoverinfo='text',
                             opacity=0.8
                             ))

    yaxis = dict(showline=False,  # hide axis line, grid, ticklabels and  title
                zeroline=False,
                showgrid=False,
                showticklabels=False,
                )
    xaxis = dict(showline=False,  # hide axis line, grid, ticklabels and  title
                 zeroline=False,
                 showgrid=False,
                 showticklabels=False, title='Node-Link Diagram'
                 )

    fig.update_layout(title='Decision Tree',
                      font_size=12,
                      showlegend=False,
                      xaxis=xaxis,
                      yaxis=yaxis,
                      hovermode='closest',
                      plot_bgcolor='rgb(248,248,248)'
                      )

    return fig


def feature_importance_table(model):
    labels = [{'label': 'Momentum RSI', 'value': 'momentum_rsi'},
                {'label': 'Trend EMA Fast', 'value': 'trend_ema_fast'},
                {'label': 'Trend EMA Slow', 'value': 'trend_ema_slow'},
                {'label': 'Momentum WR', 'value': 'momentum_wr'},
                {'label': 'Momentum Stoch', 'value': 'momentum_stoch'},
                {'label': 'Trend ADX', 'value': 'trend_adx'},
                {'label': 'Volume ADI', 'value': 'volume_adi'},
                {'label': 'Trend CCI', 'value': 'trend_cci'},
                {'label': 'Trend MACD', 'value': 'trend_macd'},
                {'label': 'Volatility BBM', 'value': 'volatility_bbm'},
                {'label': 'Momentum ROC', 'value': 'momentum_roc'},
                {'label': 'Volume OBV', 'value': 'volume_obv'},
                {'label': 'Volatility ATR', 'value': 'volatility_atr'},
                {'label': 'Momentum MFI', 'value': 'momentum_mfi'},
                {'label': 'Volatility BBL', 'value': 'volatility_bbl'}]

    features = []
    for f in model.features:
        for x in labels:
            if f == x.get('value'):
                features.append(x.get('label'))

    importance = model.model.feature_importances_
    d = {'Feature': features, 'Importance': importance}
    df = pandas.DataFrame(d)

    return df.to_dict('records')


def decision_table(date):
    prediction = rdm_model.decision_tree_values('2017-12-28').flatten()
    l = []
    for pred in prediction:
        if pred == 1:
            l.append("Up")
        else:
            l.append("Down")

    x = [y for y in range(100)]
    d = {'Tree': x, 'Prediction': l}
    df = pandas.DataFrame(d)

    return df.to_dict('records')


def generate_pca():
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=rdm_model.p['PC1'], y=rdm_model.p['PC2'], mode='markers', marker_color=rdm_model.p['out']))
    fig.update_layout(xaxis={'title': 'PC1'}, yaxis={'title': 'PC2'})
    return fig


rdm_model = forest.Forest('MSFT', ['momentum_rsi', 'trend_ema_fast', 'trend_ema_slow', 'momentum_wr', 'momentum_stoch', 'trend_adx'], 1)

# Handles all the GUI components.

import dash
from dash.dependencies import Input, Output, State  
import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
import dash_table

from django_plotly_dash import DjangoDash

import stock.dash_apps.forest as forest
import stock.dash_apps.dashlogic as dashlogic

app = DjangoDash('VisualData')


# Manages the layout of the GUI components.
app.layout = html.Div([
    # Create dropdown menu with examples of companies.

    dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Row([
                    dbc.Col([
                        # Show timeseries visualisation.
                        dcc.Graph(id='timeseries', config={'modeBarButtonsToRemove': ['toggleSpikelines', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']})
                    ], md=10),  # timeseries
                    dbc.Col([
                        html.Div([
                            html.P(className='metadatalabel', children='Model Prediction: '),
                            html.H2(id='model_prediction', className='metadataresult'),
                            html.P(className="metadatalabel", children='Model Accuracy: '),
                            html.H2(id='model_accuracy', className='metadataresult')
                        ], id='metadata')
                    ], md=2)
                ]),
                dbc.Row([
                    dbc.Col([
                        html.Div([
                            dbc.Row([
                                dbc.Col([
                                    dcc.Dropdown(
                                        id='feature_dropdown',
                                        options=[
                                            {'label': 'Momentum RSI', 'value': 'momentum_rsi'},
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
                                            {'label': 'Volume EMV', 'value': 'volume_em'}
                                        ],
                                        multi=True,
                                        value=['momentum_rsi', 'trend_ema_fast', 'volume_em', 'trend_cci', 'momentum_stoch', 'trend_adx', 'trend_macd', 'volume_adi']
                                    ),
                                ], md=3),
                                dbc.Col([
                                    dbc.Button('Calculate', id='submit', color="primary")
                                ], md=1)
                            ])
                        ], id='form_style')
                    ])
                ]),
                dbc.Row([
                    dbc.Col([
                        # Show matrix visualisation.
                        dcc.Graph(id='matrix', config={'displayModeBar': False}),

                        # Show feature importance bar chart.
                        dcc.Graph(id='forest_feature_importance', config={'displayModeBar': False})
                    ], md=8),  # forest level
                    dbc.Col([
                        # Show node link.
                        dcc.Graph(id='tree', config={'modeBarButtonsToRemove': ['toggleSpikelines', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']}),

                        dcc.Graph(id="tree_feature_importance", config={'displayModeBar': False})
                    ], md=4)
                ])
            ], width=12)
        ])
    ], fluid=True),
])

# Update graphs.
@app.callback([Output('timeseries', 'figure'),
               Output('forest_feature_importance', 'figure'),
               Output('matrix', 'figure'),
               Output('tree', 'figure'),
               Output('tree_feature_importance', 'figure'),
               Output('model_accuracy', 'children'),
               Output('model_prediction', 'children'),
               Output('model_prediction', 'className')],
              [Input('submit', 'n_clicks'),
               Input('timeseries', 'clickData'),
               Input('matrix', 'clickData')],
              [State('feature_dropdown', 'value')])
def update_graph(clicks, date, d_tree, feature_dropdown_value, **kwargs):
    date = None
    dashlogic.rdm_model.update(kwargs['session_state']['stock'], feature_dropdown_value, kwargs['session_state']['timeperiod'])
    if date is None:
        d = dashlogic.rdm_model.data.index.tolist()[-1] 
    else:
        d = date['points'][0]['x']

    print ("Update test: ")
    print (d_tree)

    a, b = display_tree(d_tree, d)

    print("d: " + str(d))

    string_acurracy = '{:.2f}%'.format(dashlogic.rdm_model.accuracy())
    string_prediction = '{}'.format(dashlogic.rdm_model.model_prediction(d))
    print (string_prediction)

    if string_prediction == 'Up':
        class_name = 'pred_up'
    else:
        class_name = 'pred_down'
    
    

    return (dashlogic.generate_timeseries(date),
            dashlogic.generate_feature_importance(dashlogic.rdm_model.model),
            display_matrix(d, d_tree),
            a, b,
            string_acurracy, string_prediction, class_name)


def display_matrix(date, d_tree):
    print ("Matrix test: ")
    print (d_tree)
    fig = dashlogic.generate_intensity_matrix(date, d_tree)
    return fig


def display_tree(click_data, date):
    if click_data is None:
        return (dashlogic.generate_tree(dashlogic.rdm_model.model.estimators_[0], date),
                dashlogic.generate_feature_importance(dashlogic.rdm_model.model.estimators_[0]))
    else:
        x = click_data['points'][0]['x']
        y = click_data['points'][0]['y']
        est = x + (y * 10)
        return (dashlogic.generate_tree(dashlogic.rdm_model.model.estimators_[est], date),
                dashlogic.generate_feature_importance(dashlogic.rdm_model.model.estimators_[est]))


if __name__ == '__main__':
    app.run_server(debug=False)

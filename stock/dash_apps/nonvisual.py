# Handles all the GUI components.

import dash
from dash.dependencies import Input, Output, State
import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
import dash_table
import pandas

import forest
import dashlogic

app = dash.Dash('VisualData')

# Manages the layout of the GUI components.
app.layout = html.Div([
    dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Row([
                    dbc.Col([
                        dcc.Dropdown(
                            id='stock_dropdown',
                            options=[
                                {'label': 'Microsoft', 'value': 'MSFT'},
                                {'label': 'Boeing', 'value': 'BA'},
                                {'label': 'Nike', 'value': 'NKE'},
                                {'label': 'Intel', 'value': 'INTC'},
                                {'label': 'Visa', 'value': 'V'},
                                {'label': 'Verizon', 'value': 'VZ'},
                                {'label': 'Apple', 'value': 'AAPL'},
                                {'label': 'Disney', 'value': 'DIS'},
                                {'label': 'McDonalds', 'value': 'MCD'}
                            ],
                            value='MSFT'
                        )
                    ], width=3),
                    dbc.Col([
                        dcc.Dropdown(
                            id='feature_dropdown',
                            options=[
                                {'label': 'Momentum RSI', 'value': 'momentum_rsi'},
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
                                {'label': 'Volatility BBL', 'value': 'volatility_bbl'}
                            ],
                            multi=True,
                            value=['momentum_rsi', 'trend_ema_fast', 'trend_ema_slow', 'momentum_wr', 'momentum_stoch', 'trend_adx']
                        ),
                    ], width=3),
                    dbc.Col([
                        dcc.Slider(id='slider',
                                   min=1,
                                   max=90,
                                   marks={1: '1 day', 10: '10 days', 30: '30 days', 60: '60 days', 90: '90 days'},
                                   value=1,
                                   step=None),
                    ], width=5),
                    dbc.Col([
                        dbc.Button('Submit', id='submit', color="primary")
                    ], width=1)
                ]),

                html.H2(id='model_accuracy'),
                html.H2(id='model_prediction'),
                dash_table.DataTable(
                    id='feature_table',
                    columns=[{"name": 'Feature', "id": 'Feature'}, {"name": 'Importance', "id": 'Importance'}],
                ),
                dash_table.DataTable(
                    id='decision_table',
                    columns=[{"name": 'Tree', "id": 'Tree'}, {"name": 'Prediction', "id": 'Prediction'}],
                )
            ], width=12)
        ])
    ], fluid=True),
])


@app.callback([Output('model_accuracy', 'children'),
               Output('model_prediction', 'children'),
               Output('feature_table', 'data'),
               Output('decision_table', 'data')],
              [Input('submit', 'n_clicks')],
              [State('stock_dropdown', 'value'),
               State('feature_dropdown', 'value'),
               State('slider', 'value')])
def update_accuracy(clicks, stock_dropdown_value, feature_dropdown_value, slider_value, **kwargs):
    rdm_model = forest.Forest(kwargs['session_state']['stock'], feature_dropdown_value, kwargs['session_state']['timeperiod'])

    string_acurracy = 'Model Accuracy is {:.2f}%'.format(rdm_model.accuracy())
    string_prediction = 'Model Prediction is {}'.format(rdm_model.model_prediction())
    return string_acurracy, string_prediction, dashlogic.feature_importance_table(rdm_model), dashlogic.decision_table()


if __name__ == '__main__':
    app.run_server(debug=False)

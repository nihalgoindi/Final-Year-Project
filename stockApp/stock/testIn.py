from datetime import datetime, timedelta

from finnhub import client as Finnhub

import time
import pandas as pd
import numpy as np
import requests
import json

import yfinance as yf
import pandas as pd



finnhub_client = Finnhub.Client(api_key="bovh7pnrh5r90eafkh7g")

def convertApi(api):
    data = pd.DataFrame.from_dict(api)
    data= data.rename(columns={'c': 'close', 'h': 'high','l':'low','o':'open','v':'volume','t':'date'})
    try:
        data['date'] = pd.to_datetime(data['date'], unit = 's')
        pass
    except Exception as e:
        print(e)
        pass
    return data

res = finnhub_client.stock_candles('MSFT', 'D', 1378166400, 1514419200)
data1 = pd.DataFrame(res)
data1 = convertApi(data1)

# data = yf.download('MSFT','2013-09-03','2017-12-28')
# df1 = data.drop(['Open', 'Close', 'High', 'Low', 'Volume', ], 1)
# df1.reset_index(drop=True, inplace=True)
# data1 = data1.join(df1)
print(data1)










from datetime import datetime, timedelta

from finnhub import client as Finnhub

import time
import pandas as pd
import numpy as np
import requests
import json

import numpy
import quandl


import ta
finnhub_client = Finnhub.Client(api_key="bovh7pnrh5r90eafkh7g")



def stock_data(stock):
    res = finnhub_client.stock_candles(stock, 'D', 1378166400, 1514419200)
    #print(res)
    data = pd.DataFrame(res)
    data = convertApi(data)
    data = ta.add_all_ta_features(data, open="open", high="high", low="low", close="close", volume="volume", fillna=True)
    return data


def convertApi(api):
    data = pd.DataFrame.from_dict(api)
    data= data.rename(columns={'c': 'close', 'h': 'high','l':'low','o':'open','v':'volume','t':'date'})
    try:
        data['date'] = pd.to_datetime(data['date'], unit = 's')
        pass
    except Exception as e:
        print(e)
        pass
    return data
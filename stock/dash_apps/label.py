from datetime import datetime, timedelta

from finnhub import client as Finnhub

import yfinance as yf
import pandas as pd

import time
import pandas as pd
import numpy as np
import requests
import json
from datetime import date

import numpy
import quandl
import ta

#finnhub_client = Finnhub.Client(api_key="bovh7pnrh5r90eafkh7g")


def stock_data(stock):
    # Gets stock data in dataframe format.
    #data1 = quandl.get("EOD/" + stock, authtoken="sF7ZfZxjJzJ9wF1rCguK")
    

    # dataYh = yf.download('MSFT','2013-09-03','2017-12-28')
    # df1 = dataYh.drop(['Open', 'Close', 'High', 'Low', 'Volume'], 1)
    # df2 = dataYh.drop(['Open', 'Close', 'High', 'Low', 'Volume', 'Adj Close'], 1)
    # res1 = finnhub_client.stock_candles('MSFT', 'D', 1378166400, 1514419200)
    # dres1 = convertApi(res1)
    # data1 = df2.join(dres1)
    # data = data1.join(df1)
    # print(stock + "\n") 
    today = date.today()
    d1 = today.strftime("%Y-%m-%d")
    
    data = yf.download(stock,'2013-09-03', d1)

    #print(data1)
    data = data.reindex(columns=['Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close'])
    data.columns = ['Open', 'High', 'Low', 'Close', 'Volume', 'Adj_Close']
    print (data)
    

    # Calculate feature values and add them to the dataframe.
    data = ta.add_all_ta_features(data, open="Open", high="High", low="Low", close="Close", volume="Volume", fillna=True)

    # Label the data.
    data['Output1'] = numpy.where(data['Adj_Close'] < data['Adj_Close'].shift(-1), 1, -1)
    data['Output10'] = numpy.where(data['Adj_Close'] < data['Adj_Close'].shift(-10), 1, -1)
    data['Output30'] = numpy.where(data['Adj_Close'] < data['Adj_Close'].shift(-30), 1, -1)
    data['Output60'] = numpy.where(data['Adj_Close'] < data['Adj_Close'].shift(-60), 1, -1)
    data['Output90'] = numpy.where(data['Adj_Close'] < data['Adj_Close'].shift(-90), 1, -1)
    
    #print(stock + "\n") 
    #print (data)    

    return data

def convertApi(api):
    data = pd.DataFrame.from_dict(api)
    data= data.rename(columns={'c': 'close', 'h': 'high','l':'low','o':'open','v':'volume','t':'date'})
    try:
        data['date'] = pd.to_datetime(data['date'], unit = 's')
        pass
    except Exception as e:
        print(e)

    return data 

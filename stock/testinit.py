from datetime import datetime, timedelta

from finnhub import client as Finnhub

import time
import pandas as pd
import numpy as np
import requests
import json


import yfinance as yf
import pandas as pd
#pd.set_option("display.max_rows", None, "display.max_columns", None)






# Get the data for the stock AAPL

#df1 = data.drop(['Open', 'Close', 'High', 'Low', 'Volume', ], 1)
#print (data.reset_index())
#print (data.drop('Open', 1))
#df1 = data[['High', 'Low']]
#df1.reset_index(drop=True, inplace=True)

data = yf.download('MSFT','2013-09-03','2017-12-28')
data = data.reindex(columns=['Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close'])
print (data)
df2 = data
df2.reset_index(drop=True, inplace=True)
print (df2)
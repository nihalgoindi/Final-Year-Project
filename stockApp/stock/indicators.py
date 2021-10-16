
#Technical Analysis indicators strictly using numpy, pandas and math
#Available from:
#https://www.quantopian.com/posts/technical-analysis-indicators-without-talib-code
#@author: Bruno Franca
#@author: Peter Bakker

#modified to work with format
#n = number of points to take.
#@author: rokas rudys

import numpy
import math as m
import pandas as pd
import numpy as np

def getIndicator(data,name,arg):
    if(name == 'SMA'):
        return SMA(data,int(arg))
    if(name == 'EMA'):
        return EMA(data,int(arg))
    if(name == 'MOM'):
        return MOM(data,int(arg))
    if(name == 'ROC'):
        return ROC(data,int(arg))
    if(name == 'RSI'):
        return RSI(data,int(arg))
    if(name == 'ATR'):
        return ATR(data,int(arg))
    if(name == 'BBANDS'):
        print(arg)
        argl = arg.split('.')
        n = argl[0]
        return BBANDS(data,int(n),2)
    if(name == 'MACD'):
        argl = arg.split('.')
        n = argl[0]
        n_fast = argl[1]
        n_slow = argl[2]
        return MACD(data,int(n),int(n_fast),int(n_slow))
    else:
        return 'ERROR: INDICATOR UNAVAILABLE'

#Momentum
def MOM(df, n, reset_index=True):
    M = pd.Series(df['close'].diff(n), name = 'MOM '+str(n))
    df = df.join(M)
    df.reset_index(drop=True)
    return df

#Rate of Change
def ROC(df, n, reset_index=True):
    M = df['close'].diff(n - 1)
    N = df['close'].shift(n - 1)
    ROC = pd.Series(M / N, name = 'ROC '+str(n))
    df = df.join(ROC)
    df.reset_index(drop=True)
    return df

#Relative strength index
def RSI(df, n, reset_index=True):
    period = n
    column = 'close'

    # wilder's RSI
    delta = df[column].diff()
    up, down = delta.copy(), delta.copy()

    up[up < 0] = 0
    down[down > 0] = 0

    rUp = up.ewm(com=period - 1,  adjust=False).mean()
    rDown = down.ewm(com=period - 1, adjust=False).mean().abs()

    rsi = 100 - 100 / (1 + rUp / rDown)
    df = df.join(rsi.to_frame('RSI '+str(n)))
    df.reset_index(drop=True)
    return df
    
#Moving Average
def SMA(df, n, reset_index=True):
    MA = pd.Series(df['close'].rolling(n).mean(), name = 'SMA '+str(n))
    df = df.join(MA)
    df.reset_index(drop=True)
    return df

#Exponential Moving Average
def EMA(df, n, reset_index=True):
    df = df.sort_index()
    df['EMA '+str(n)] = df['close'].ewm(span=n,min_periods=n-1,adjust=False,ignore_na=False).mean()
    df.reset_index(drop=True)
    return df

#Average True Range
def ATR(df, n, reset_index=True):
    df = df.reset_index(drop=True)
    i = 0
    TR_l = [0]
    while i < df.index[-1]:
        high_value = df.at[i+1, "high"]
        low_value = df.at[i+1, "low"]
        close_value = df.at[i, "close"]
        TR = max(high_value, close_value) - min(low_value, close_value)
        TR_l.append(TR)
        i = i + 1
    TR_s = pd.Series(TR_l)
    ATR = pd.Series(TR_s.ewm(span = n, min_periods = n,adjust=True,ignore_na=False).mean(), name = 'ATR '+str(n))
    df = df.join(ATR)
    df.reset_index(drop=True)
    return df

#Bollinger Bands
def BBANDS(df, n, k=2, reset_index=True):
    MA = pd.Series(df['close'].rolling(n).mean(), name='BBANDS '+str(n))
    MSD = pd.Series(df['close'].rolling(k).std())

    upper_band = MA + 2 * MSD
    upper_band = upper_band.rename('BBANDS '+str(n)+' U')

    lower_band = MA - 2 * MSD
    lower_band = lower_band.rename('BBANDS '+str(n)+' L')


    df = df.join(upper_band).join(lower_band)
    df = df.reset_index(drop=True)
    return df

#MACD, MACD Signal and MACD difference
def MACD(df, n, n_fast, n_slow, reset_index=True):
    EMAfast = df['close'].ewm(span=n_fast,min_periods=n_fast-1,adjust=False,ignore_na=False).mean()
    EMAslow = df['close'].ewm(span=n_slow,min_periods=n_slow-1,adjust=False,ignore_na=False).mean()

    MACD = pd.Series(EMAfast - EMAslow, name = 'MACD '+str(n_fast)+' '+str(n_slow)+' '+str(n))
    MACDSIGN = pd.Series(MACD.ewm(span=n,min_periods=n-1,adjust=False,ignore_na=False).mean(), name='MACD '+str(n_fast)+' '+str(n_slow)+' '+str(n) + 'signal')

    df = df.join(MACD)
    df = df.join(MACDSIGN)

    df = df.reset_index(drop=True)
    return df
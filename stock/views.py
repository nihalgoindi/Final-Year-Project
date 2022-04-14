from django.shortcuts import redirect, render
from django.db.models import Q
from django.http import JsonResponse
from django.core import serializers
from django.http import HttpResponse
from datetime import datetime, timedelta
import ta
import plotly.figure_factory as ff
import plotly.graph_objects as go
import numpy
import pandas
import os
from django.conf import settings


from plotly.offline import plot
from plotly.graph_objs import Scatter
from sklearn import tree

from stock.modeldata import modeldata

from stock.forest import Forest

from finnhub import client as Finnhub

import time
import pandas as pd
import numpy as np
import requests
import json
import io

apiClient = Finnhub.Client(api_key="bovh7pnrh5r90eafkh7g")
currentProcessor = "No"
processingList = []

def home(request):
    return render(request,'traditional.html', {'graph': "Updating data...",'ticker' : "Getting data..."})

def testStrategy(request):
    stock = str(json.loads(request.body.decode('utf-8'))["params"]['stock'])
    dateFrom = datetime.strptime(json.loads(request.body.decode('utf-8'))["params"]['dateFrom'],"%d/%m/%Y")
    dateTo = datetime.strptime(json.loads(request.body.decode('utf-8'))["params"]['dateTo'],"%d/%m/%Y")
    dataType = str(json.loads(request.body.decode('utf-8'))["params"]['dataType'])

    stockData = convertApi(getApiData(stock,dataType,dateFrom,dateTo))
    if not isinstance(stockData, pd.DataFrame):
        return JsonResponse({'table': "Error: Unable to download data, try using less.","error":1})

    money = float(json.loads(request.body.decode('utf-8'))["params"]['money'])
    strategy = str(json.loads(request.body.decode('utf-8'))["params"]['strategy'])
    sellingThreshold = int(json.loads(request.body.decode('utf-8'))["params"]['sellingThreshold'])*-1
    buyingThreshold = int(json.loads(request.body.decode('utf-8'))["params"]['buyingThreshold'])
    strategySteps = strategy.split("!")
    workedDF,hadonetrade = calculateStrategy(stockData,strategySteps,money,sellingThreshold,buyingThreshold)

    if not isinstance(workedDF, pd.DataFrame):
        return JsonResponse({'table': "Error:"+workedDF,'money':money,"error":2})
    if not hadonetrade:
        return JsonResponse({'table': workedDF.to_json(orient="records"),'money':money,"error":3})
    return JsonResponse({'table': workedDF.to_json(orient="records"),'money':money,"error":0})




def calculateStrategy(data,strategySteps,money,sellTrh,buyTrh):
    import stock.indicators as ind
    #populate the dataframe with all required indicators
    for step in strategySteps:
        rule = step.split(",")
        for indic in rule:
            i = indic.split(":")
            if i[0] == "INDIC":
                #catch duplicate indicator
                name = i[1]
                indName = i[1]+' '+str(i[2].split('.')[0])
                typeind = str(i[2].split('.')[0])
                if(name == "BBANDS"):
                    indName = i[1]+' '+str(i[2].split('.')[0])+" U"
                    indName2 = i[1]+' '+str(i[2].split('.')[0])+" L"

                    if not indName in data.columns:
                        data = ind.getIndicator(data,i[1],i[2])
                elif(name != 'STOCK' and name != "NUM"):
                    if not indName in data.columns:
                        data = ind.getIndicator(data,i[1],i[2])
    #set default
    data['buysell'] = 0
    data['value'] = 0
    data['stockcount'] = 0
    data['money'] = money
    data['total'] = money
    data['profit'] = 0.0
    data['inifTrue'] = 0

    inif = False
    ifbool = False
    iftype = ""
    ifnum = 0
    ifrulecount = 0

    #rule processing, go for each rule
    for idx,step in enumerate(strategySteps):
        if step.startswith("STOP"):
            data, hadonetrade = calculateValue(data,money,buyTrh,sellTrh)
            return data, hadonetrade
        else:
            if not inif:
                if step.startswith("IF"):
                    inif = True
                    ifexplain = step.split(":")
                    ifrulecount = 0
                    data['inifTrue'] = 0

                    iftype = ifexplain[1]
                    ifnum = ifexplain[2]
                    ifbool = ifexplain[3] == "T"

                else:
                    #calculate buysell values from rule
                    final,buyorsell = parseRule(step,data)
                    if not isinstance(final, pd.DataFrame):
                        if(final == "not a rule"):
                            return "One of the rules is incorrect: "+step
                        else:
                            return "Rule parsing failed: "+step
                    #add to existing buysell value
                    data.sort_index().sort_index(axis=1)
                    final.sort_index().sort_index(axis=1)

                    data['buysell'] = data['buysell'].add(np.select([data['date'] == final['date']],[buyorsell]))
            else:
                if step.startswith("ENDIF") and inif:
                    inif = False
                    parts = step.split(":")


                    #handle endif
                    if iftype == "<":
                        if ifbool:
                            data['buysell'] = data['buysell'].add(np.select([data['inIfTrue'] < ifnum],[parts[2]]))
                        else:
                            data['buysell'] = data['buysell'].add(np.select([ifrulecount-(data['inIfTrue']) < ifnum],[parts[2]]))
                    elif iftype == ">":
                        if ifbool:
                            data['buysell'] = data['buysell'].add(np.select([data['inIfTrue'] > ifnum],[parts[2]]))
                        else:
                            data['buysell'] = data['buysell'].add(np.select([ifrulecount-(data['inIfTrue']) > ifnum],[parts[2]]))
                    elif iftype == "==":
                        if ifbool:
                            data['buysell'] = data['buysell'].add(np.select([data['inIfTrue'] == ifnum],[parts[2]]))
                        else:
                            data['buysell'] = data['buysell'].add(np.select([data['inIfTrue'] == ifnum],[parts[2]]))
                    else:
                        return "Invalid 'IF' Strategy Condition"
                #handle inside if
                final, buyorsell = parseRule(step,data)
                data['inifTrue'] = data['inifTrue'].add(np.select([data['date'] == final['date']],[1]))
                ifrulecount =+ 1

    return "Failed to process Strategy"


#compute buy and sell points
def calculateValue(df,money,buystrength,sellstrength):
    import math
    hadonetrade = False
    hasbuy = False
    buycost = 0
    df['newTransaction'] = False
    for row in df.itertuples():
        i = row.Index
        if(i > 0):
            prevmoney = df.at[i-1,'money']
            if(hasbuy):
                prevstockcount = df.at[i-1,'stockcount']
            else:
                prevstockcount = 0

            if(row.buysell >= buystrength):
                canafford = math.floor((prevmoney)/row.open)
                if(not hasbuy or canafford > 0):
                    hasbuy = True
                    hadonetrade = True
                    #count possible number of stock
                    df.at[i,'newTransaction'] = True
                    newcount = prevstockcount + canafford
                    df.at[i,'stockcount'] = newcount
                    #count value of stock and remaining money
                    value = round(row.open*newcount,2)
                    buycost = buycost + value
                    currentmoney = round((prevmoney - value),2)
                    df.at[i,'value'] = value
                    df.at[i,'money'] = currentmoney
                    df.at[i,'total'] = round(currentmoney + value,2)
                else:
                    df.at[i,'stockcount'] = prevstockcount
                    df.at[i,'money'] = prevmoney
                    value = round(row.open*prevstockcount,2)
                    df.at[i,'value'] = value
                    df.at[i,'total'] = round(prevmoney + value,2)

            elif(row.buysell <= sellstrength):
                if(hasbuy):
                    hasbuy = False
                    df.at[i,'newTransaction'] = True
                    hadonetrade = True
                    #if we have stocks how much are they worth
                    sellvalue = round((prevstockcount*row.open),2)
                    newmoney = round((prevmoney + sellvalue),2)
                    df.at[i,'profit'] = sellvalue - buycost
                    df.at[i,'money'] = newmoney
                    df.at[i,'total'] = newmoney
                    df.at[i,'value'] = sellvalue
                    df.at[i,'stockcount'] = prevstockcount
                    buycost = 0
                else:
                    df.at[i,'stockcount'] = prevstockcount
                    df.at[i,'money'] = prevmoney
                    value = round(row.open*prevstockcount,2)
                    df.at[i,'value'] = value
                    df.at[i,'total'] = round(prevmoney + value,2)
            else:
                df.at[i,'stockcount'] = prevstockcount
                df.at[i,'money'] = prevmoney
                value = round(row.open*prevstockcount,2)
                df.at[i,'value'] = value
                df.at[i,'total'] = round(prevmoney + value,2)
    return df,hadonetrade

#read complete rule
def parseRule(step,data):
    #handle multiple and/or
    connectors = step.split('*')
    lastrule = str(connectors[len(connectors)-1]).split(",")
    buyorsellblock = lastrule[len(lastrule)-1]
    final = None
    buyorsell = int(buyorsellblock.split(":")[1])

    # handle rule combination
    if buyorsellblock.startswith("SELL"):
        buyorsell = buyorsell*  -1

    first = True
    for i in range(0,len(connectors),1):
        if (len(connectors) > 1) and not first:
            #parse next part of rule
            rule2part = connectors[i].split(",")
            connect = rule2part[0]
            rule2part.pop(0)
            rule2 = processRule(data,rule2part)
            if connect.startswith("AND"):
                final = final[final.index.isin(rule2.index)]
            elif connect.startswith("OR"):
                final = pd.concat([final, rule2], ignore_index=True, sort=True)
        elif first:
            first = False
            #if no connectors or first
            final = processRule(data,connectors[i].split(","))
    return final,buyorsell

#compute individual rule
def processRule(data, parts):
    #extract rule data
    rules = []
    for indic in parts:
        if indic.startswith("INDIC:"):
            i = indic.split(":")
            name = i[1]
            if(name == "STOCK"):
                typeof = str(i[2].split('.')[0])
                if(typeof == "C"):
                    rules.append('close')
                elif(typeof == "O"):
                    rules.append('open')
                elif(typeof == "H"):
                    rules.append('high')
                elif(typeof == "L"):
                    rules.append('low')
                elif(typeof == "V"):
                    rules.append('volume')
            elif(name != "BBANDS" and name != "NUM" ):
                rules.append((i[1]+' '+str(i[2].split('.')[0])))
            elif(name == 'BBANDS'):
                n = i[2].split('.')[0]
                band = " U" if i[2].split('.')[1] == "U" else " L"
                rules.append(('BBANDS '+str(n)+ band))
            elif(name == "NUM"):
                data['NUM'] = int(i[2])
                rules.append("NUM")
    rule1 = rules[0]
    rule2 = rules[1]

    #comparator check
    whatcomparator = parts[1]
    if(whatcomparator.startswith("CROSS")):
        #calculate crossing
        data['Diff'] = data[rule2] - data[rule1]
        #from Top or Below
        if(whatcomparator.split(':')[1] == "A"):
            #crosses at top
            return data.where(((data['Diff'] < 0) & (data['Diff'].shift() > 0)))
        else:
            #crosses at bottom
            return data.where(((data['Diff'] > 0) & (data['Diff'].shift() < 0)))
    elif(whatcomparator.startswith("==")):
        return data.where(data[rule1] == data[rule2])

    elif(whatcomparator.startswith(">")):
        return data.where(data[rule1] > data[rule2])

    elif(whatcomparator.startswith("<")):
        return data.where(data[rule1] < data[rule2])

    return "failed processing rule"

def getApiData(symb,timeFrame,datefrom,dateto):
    from datetime import timezone
    datefrom = int(datefrom.replace(tzinfo=timezone.utc).timestamp())
    dateto = int(dateto.replace(tzinfo=timezone.utc).timestamp())
    return apiClient.stock_candle(symbol=symb, resolution=timeFrame, **{'from':datefrom, 'to': dateto})


def getGraph(request):
    from .models import Symbol
    from .models import Stock
    import stock.indicators as ind
    if request.method == 'POST':
        ticker = str(json.loads(request.body.decode('utf-8'))["params"]['ticker'])
        indicators = str(json.loads(request.body.decode('utf-8'))["params"]['indicators'])
        mainType = str(json.loads(request.body.decode('utf-8'))["params"]['mainType'])
        timeFrame = str(json.loads(request.body.decode('utf-8'))["params"]['timeFrame'])
        dateFrom = datetime.strptime(json.loads(request.body.decode('utf-8'))["params"]['dateFrom'],"%d/%m/%Y")
        dateTo = datetime.strptime(json.loads(request.body.decode('utf-8'))["params"]['dateTo'],"%d/%m/%Y")
        title="Unable to get Title"
        try:
            #check if ticker exists
            symb = None
            if Symbol.objects.filter(symbol=ticker).exists():
                symb = Symbol.objects.filter(symbol=ticker).first()
                title = symb.name

            #get data
            api = getApiData(symb=symb.symbol,timeFrame=timeFrame,datefrom=dateFrom,dateto=dateTo)
            #print (api)
            data = convertApi(api)
            #print (data)
            print (stock_data(data))

            if not isinstance(data, pd.DataFrame):
                return JsonResponse({'graph': "ERROR: Could not get data - unable to convert into dataframe. Maybe too much data at once","error":1})
            indicatorNames = []

            #parse indicator string and add indicators
            if indicators != "":
                indicators = indicators.split(',')
                for i in indicators:
                    i = i.split(':')
                    colors = i[len(i)-1].split("-")
                    color1 = colors[1]
                    color2 = colors[3]
                    name = i[0]
                    if(name != 'BBANDS' ):
                        indName = i[0]+' '+str(i[1].split('.')[0])
                        if not indName in data.columns:
                            indicatorNames.append((indName,color1))
                            data = ind.getIndicator(data,i[0],i[1])
                            print (data)
                    elif(name == 'BBANDS'):
                        indName = i[0]+' '+str(i[1].split('.')[0])
                        indCheck = i[0]+' '+str(i[1].split('.')[0])+" U"

                        if not indCheck in data.columns:
                            indicatorNames.append((indName,color1,color2))
                            data = ind.getIndicator(data,i[0],i[1])
                            #print (data)

        except Exception as e:
            data = "Error: "+ str(e)
            return JsonResponse({'graph': "Unable to compute, please try less data <br> advanced:"+data,"error":'1'})
        return JsonResponse({'graph': data.to_json(orient="records"),'title' : str(title),'indicatorNames':indicatorNames,"error": '0'})
    else:
        return JsonResponse({'graph': "wrong request",'title' : "Failed.",'indicatorNames':indicatorNames,"error":'1'})

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

def search(request):
    from stock.models import Symbol
    if request.method == "POST":
        #pk_070fdeb06e7d48a49fc5b4a9a3492016 IEX api key for stocks
        search = str(json.loads(request.body.decode('utf-8'))["params"]['searchField'])
        searchResp = []
        errcode = 0

        #check if empty symbols
        if(Symbol.objects.exists() == 0):
            print("Populating Symbols")

        try:
            searchResp = getTickers(search)

            if searchResp.count() > 0:
                searchResp = list(searchResp.values())
            else:
                errcode = 1
                searchResp = "Nothing Found...  please try something else."

        except Exception as e:
            searchResp = "Error:"+str(e)
            errcode = 2

    return JsonResponse({'data':searchResp,'error':errcode})



def checkType(row):
    if 'minute' in dir(row):
        return row.minute
    return '0'

def rulebuilding(request):
    return render(request,'rules.html')


def newRuleBuilder(request):
    return render(request, 'newRuleBuilder.html')

def strategyBuilder(request):
    return render(request, 'strategyBuilder.html')


def strategyTester(request):
    return render(request, 'strategyTester.html')


def deleteRule(request):
    if request.user.is_anonymous:
        return JsonResponse({"error":1,"msg":"user is not logged in"})

    from .models import BuyRule
    from .models import SellRule
    ruletype =str(json.loads(request.body.decode('utf-8'))["params"]['buyorsell'])
    name =str(json.loads(request.body.decode('utf-8'))["params"]['name'])
    html =str(json.loads(request.body.decode('utf-8'))["params"]['html'])
    rule =str(json.loads(request.body.decode('utf-8'))["params"]['rule'])

    if(ruletype == "BUY"):
        try:
            r = BuyRule.objects.filter(user = request.user, name=name,rule=rule,html=html)
            r.delete()
        except Exception as e:
            return JsonResponse({"error":3,"msg":"could not delete the strategy as wrong inputs: "+ str(e)})
    elif(ruletype =="SELL"):
        try:
            r = SellRule.objects.filter(user = request.user, name=name,rule=rule,html=html)
            r.delete()
        except Exception as e:
            return JsonResponse({"error":3,"msg":"could not delete the strategy as wrong inputs: "+ str(e)})
    else:
        return JsonResponse({"error":2,"msg":"not a valid ruletype"})

    return JsonResponse({"success":1,"error":0})

def saveRule(request):
    if request.user.is_anonymous:
        return JsonResponse({"error":1,"msg":"user is not logged in"})

    from .models import BuyRule
    from .models import SellRule
    ruletype =str(json.loads(request.body.decode('utf-8'))["params"]['buyorsell'])
    name =str(json.loads(request.body.decode('utf-8'))["params"]['name'])
    html =str(json.loads(request.body.decode('utf-8'))["params"]['html'])
    rule =str(json.loads(request.body.decode('utf-8'))["params"]['rule'])

    if(ruletype == "BUY"):
        try:
            r = BuyRule(user = request.user, name=name,rule=rule,html=html)
            r.full_clean()
            r.save()
        except Exception as e:
            return JsonResponse({"error":3,"msg":"could not save the rule as wrong inputs: "+ str(e)})
    elif(ruletype =="SELL"):
        try:
            r = SellRule(user = request.user, name=name,rule=rule,html=html)
            r.full_clean()
            r.save()
        except Exception as e:
            return JsonResponse({"error":3,"msg":"could not save the rule as wrong inputs: "+ str(e)})
    else:
        return JsonResponse({"error":2,"msg":"not a valid ruletype"})

    return JsonResponse({"success":1,"error":0})

def deleteStrat(request):
    if request.user.is_anonymous:
        return JsonResponse({"error":1,"msg":"user is not logged in"})

    from .models import Strategy
    name =str(json.loads(request.body.decode('utf-8'))["params"]['name'])
    html =str(json.loads(request.body.decode('utf-8'))["params"]['html'])
    strategy =str(json.loads(request.body.decode('utf-8'))["params"]['strategy'])
    try:
        s= Strategy.objects.filter(user =request.user, name=name,strategy=strategy,html=html)
        s.delete()
    except Exception as e:
        return JsonResponse({"error":3,"msg":"could not delete the strategy as wrong inputs: "+ str(e)})

    return JsonResponse({"success":1,"error":0})

def saveStrat(request):
    if request.user.is_anonymous:
        return JsonResponse({"error":1,"msg":"user is not logged in"})

    from .models import Strategy
    name =str(json.loads(request.body.decode('utf-8'))["params"]['name'])
    html =str(json.loads(request.body.decode('utf-8'))["params"]['html'])
    strategy =str(json.loads(request.body.decode('utf-8'))["params"]['strategy'])

    try:
        s= Strategy(user = request.user, name=name,strategy=strategy,html=html)
        s.full_clean()
        s.save()
    except Exception as e:
        return JsonResponse({"error":3,"msg":"could not save the strategy as wrong inputs: "+ str(e)})
    return JsonResponse({"success":1,"error":0})

def getRules(request):
    from .models import BuyRule
    from .models import SellRule
    from .models import Strategy
    buyrules = []
    sellrules = []
    strategy = []
    if request.user.is_anonymous:
        return JsonResponse({'buyrules': buyrules,'sellrules':sellrules,"strategy":strategy,"error":1})
    else:
        buyrules = list(BuyRule.objects.filter(user=request.user).values())
        sellrules = list(SellRule.objects.filter(user=request.user).values())
        strategy = list(Strategy.objects.filter(user=request.user).values())

    return JsonResponse({'buyrules': buyrules,'sellrules':sellrules,"strategy":strategy,"error":0})

def scatter(request):
    return render(request,'scatter.html')

def scatterget(request):
    from .models import Symbol
    from .models import Stock
    import stock.indicators as ind

    import multiprocessing
    if request.method == 'POST':
        ticker = str(json.loads(request.body.decode('utf-8'))["params"]['ticker'])
        dataType = str(json.loads(request.body.decode('utf-8'))["params"]['dataType'])
        dateFrom = datetime.strptime(json.loads(request.body.decode('utf-8'))["params"]['dateFrom'],"%d/%m/%Y")
        dateTo = datetime.strptime(json.loads(request.body.decode('utf-8'))["params"]['dateTo'],"%d/%m/%Y")
        indicator1 = str(json.loads(request.body.decode('utf-8'))["params"]['indicator1'])
        period1 = str(json.loads(request.body.decode('utf-8'))["params"]['period1'])
        indicator2 = str(json.loads(request.body.decode('utf-8'))["params"]['indicator2'])
        period2 = str(json.loads(request.body.decode('utf-8'))["params"]['period2'])
        try:
            #get raw data
            symb = None
            if Symbol.objects.filter(symbol=ticker).exists():
                symb = Symbol.objects.filter(symbol=ticker).first()

            data = convertApi(getApiData(symb=symb.symbol,timeFrame=dataType,datefrom=dateFrom,dateto=dateTo))
            if not isinstance(data, pd.DataFrame):
                return JsonResponse({'table': "ERROR: Could not get data - may be too many dates.","error":1})

            #add indicators
            if indicator1 != 'open':
                data = ind.getIndicator(data,indicator1,period1)


            if  indicator2 != 'open' and  ((indicator1+period1) !=(indicator2+period2)) :
                data = ind.getIndicator(data,indicator2,period2)

        except Exception as e:
            data = "Error: "+ str(e)
            return JsonResponse({'table': data,"error":1})

        return JsonResponse({'table': data.to_json(orient="records"),'name':symb.symbol +" - "+symb.name,"error":0})
    else:
        return JsonResponse({'table': "wrong request","error":1})



def getTickers(search):
    from stock.models import Symbol
    from datetime import timezone


    #update tickers
    #if empty then get everything
    if not Symbol.objects:
        updateAllTickers()
        #if havent updated for 3 days, check if theres changes
    elif(Symbol.objects.filter(symbol="AAPL").first().date - datetime.now(timezone.utc)).days > 3:
        updateAllTickers()
    searchResult = Symbol.objects.filter(
                        Q(symbol__icontains=search) |
                        Q(name__icontains=search))[:5]
    if searchResult:
        return searchResult

    return searchResult

def updateAllTickers():
    from stock.models import Symbol
    from datetime import timezone
    #maybe allow changing in future
    exchange = 'US'
    api = apiClient.stock_symbol(exchange=exchange)

    for item in api:
        if not Symbol.objects.filter(symbol=item['symbol']).exists():
            Symbol.objects.update_or_create(symbol=item['symbol'], exchange=exchange, name=item['description'], dataType="Stock",date=datetime.now(timezone.utc))

    #remove testing tickers
    Symbol.objects.filter(symbol="NTEST").delete()
    Symbol.objects.filter(symbol="NTEST-A").delete()
    Symbol.objects.filter(symbol="NTEST-B").delete()
    Symbol.objects.filter(symbol="NTEST-C").delete()
    return True

def saveStock(symbol,data):
    import multiprocessing
    from .models import Symbol
    from .models import Stock
    print("Adding stock in Background")
    x = 0
    for i in range(len(data['t'])):
        try:
            stk, created = Stock.objects.get_or_create(symbol=symbol,date=datetime.fromtimestamp(data['t'][i]),open=data['o'][i],high=data['h'][i],
                low=data['l'][i], close =data['c'][i],volume=data['v'][i])
            if created:
                x=x+1
        except Exception as e:
            print(str(e))
    return 0

def stock_data(data):
    # Gets stock data in dataframe format.
    #print(data)
    # Calculate feature values and add them to the dataframe.
    data = ta.add_all_ta_features(data, open="open", high="high", low="low", close="close", volume="volume", fillna=True)

    #print (data)
    #print (stock)
    #print (data)

    return data


def machine_learning(request, stock, timeperiod):
    rdm_model = Forest(stock, ['momentum_rsi', 'trend_ema_fast', 'volume_em', 'trend_cci', 'momentum_stoch', 'trend_adx', 'trend_macd', 'volume_adi'], timeperiod)

    date = None

    if date is None:
        d = rdm_model.data.index.tolist()[-1]
    else:
        d = date['points'][0]['x']


    x = rdm_model.data.index.tolist()
    y = rdm_model.data['Adj_Close']

    fig = go.Figure(data=go.Scatter(x=x, y=y, mode='lines', showlegend=False))
    fig.update_layout(title=stock, xaxis={'title': 'Date'}, yaxis={'title': 'Closing Price ($)'})


    x = x[-1]
    y = y[-1]

    if rdm_model.model_prediction(x) == 'Up':
        colour = ['#028000']
    else:
        colour = ['#fe0100']

    fig_pred = rdm_model.model_prediction(x)
    fig.add_trace(go.Scatter(x=[x], y=[y], marker=dict(size=[8], color=colour, line_width=0, opacity=1), showlegend=False))
    fig_div = plot(fig, output_type='div')
    fig_acu = rdm_model.accuracy()


    testTable = generate_feature_importance(rdm_model)
    print("Test Table:")
    print(testTable)
    print(testTable['Importance'])
    print(testTable['Features'])



    request.session['stock'] = stock
    request.session['timeperiod'] = timeperiod
    request.session['modelPred'] = fig_pred
    request.session['modelAcu'] = fig_acu

    dash_context = request.session.get("django_plotly_dash", dict())
    dash_context['stock'] = stock
    dash_context['timeperiod'] = timeperiod
    dash_context['momentum_rsi'] = testTable['Importance'][0]
    dash_context['trend_ema'] = testTable['Importance'][1]
    dash_context['volume_emv'] = testTable['Importance'][2]
    dash_context['trend_cci'] = testTable['Importance'][3]
    dash_context['momentum_stoch'] = testTable['Importance'][4]
    dash_context['trend_adx'] = testTable['Importance'][5]
    dash_context['trend_macd'] = testTable['Importance'][6]
    dash_context['volume_adi'] = testTable['Importance'][7]
    request.session['django_plotly_dash'] = dash_context



    return render(request, "machinelearning.html", context={'fig_div': fig_div,'fig_pred': fig_pred, 'fig_acu': fig_acu,
                                                            'stock': stock, 'timeperiod': timeperiod})

def viewData(request):
    #Redirect to login if no user
    if not (request.user.is_authenticated):
        return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))

    models = []
    url = 'stock/static/json/' + request.user.username + '.json'
    url = os.path.join(settings.BASE_DIR, url)


    if os.path.isfile(url) and os.access(url, os.R_OK):
        # checks if file exists
        print ("File exists and is readable")
    else:
        open(url, "x")
        data = {}
        data['models'] = []
        with open(url, 'w') as outfile:
            json.dump(data, outfile)


    with open(url) as json_file:
        data = json.load(json_file)
        print (len(data['models']))
        for p in data["models"]:
            rdm_data = modeldata(p["id"], p["stock"], p["timeperiod"], p["pred"], p["acu"], p["momentum_rsi"],
                                 p["trend_ema"], p["volume_emv"], p["trend_cci"], p["momentum_stoch"],
                                 p["trend_adx"], p["trend_macd"], p["volume_adi"])
            models.append(rdm_data)


    return render(request,"data.html", context={'models': models})

def setData(request, stock, timeperiod):
    #Redirect to login if no user
    if not (request.user.is_authenticated):
        return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))

    fig_pred = str(request.session['modelPred'])
    fig_acu = (request.session['modelAcu'])
    fig_acu = "{:.2f}".format(fig_acu)
    stock = str(request.session['stock'])
    timeperiod = str(request.session['timeperiod'])
    momentum_rsi = request.session['django_plotly_dash']['momentum_rsi']
    momentum_rsi = "{:.3f}".format(momentum_rsi)
    trend_ema = request.session['django_plotly_dash']['trend_ema']
    trend_ema = "{:.3f}".format(trend_ema)
    volume_emv = request.session['django_plotly_dash']['volume_emv']
    volume_emv = "{:.3f}".format(volume_emv)
    trend_cci = request.session['django_plotly_dash']['trend_cci']
    trend_cci = "{:.3f}".format(trend_cci)
    momentum_stoch = request.session['django_plotly_dash']['momentum_stoch']
    momentum_stoch = "{:.3f}".format(momentum_stoch)
    trend_adx = request.session['django_plotly_dash']['trend_adx']
    trend_adx = "{:.3f}".format(trend_adx)
    trend_macd = request.session['django_plotly_dash']['trend_macd']
    trend_macd = "{:.3f}".format(trend_macd)
    volume_adi = request.session['django_plotly_dash']['volume_adi']
    volume_adi = "{:.3f}".format(volume_adi)

    url = 'stock/static/json/' + request.user.username + '.json'
    url = os.path.join(settings.BASE_DIR, url)

    if os.path.isfile(url) and os.access(url, os.R_OK):
        # checks if file exists
        print ("File exists and is readable")
    else:
        open(url, "x")
        data = {}
        data['models'] = []
        with open(url, 'w') as outfile:
            json.dump(data, outfile)

    with open(url) as json_file:
        data = json.load(json_file)
        index = str((len(data['models'])) + 1)
        temp = data['models']

        # python object to be appended
        x = {
            "id":index,
            "stock":stock,
            "timeperiod":timeperiod,
            "pred":fig_pred,
            "acu":fig_acu,
            "momentum_rsi":momentum_rsi,
            "trend_ema":trend_ema,
            "volume_emv":volume_emv,
            "trend_cci":trend_cci,
            "momentum_stoch":momentum_stoch,
            "trend_adx":trend_adx,
            "trend_macd":trend_macd,
            "volume_adi":volume_adi
        }


    # appending data to emp_details
    temp.append(x)

    write_json(data, url)


    return redirect('machinelearning', stock, timeperiod)

def delData(request, id):
    i = 0
    print(id)
    sid = int(id)

    models = []
    url = 'stock/static/json/' + request.user.username + '.json'
    url = os.path.join(settings.BASE_DIR, url)

    with open(url) as json_file:
        data = json.load(json_file)

        for p in data["models"]:
            if p["id"] == id:
                print ("test: " + str(i))
                del (data["models"][i])
            i += 1
        with open(url, 'w') as data_file:
            data = json.dump(data, data_file, indent=4)


    return redirect('viewMLData')

def write_json(data, filename):
    with open(filename,'w') as f:
        json.dump(data, f, indent=4)

def generate_feature_importance(rdm_model):

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

    importance = rdm_model.model.feature_importances_
    d = {'Importance': importance, 'Features': features}

    return d
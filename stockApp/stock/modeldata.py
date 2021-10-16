class modeldata:
    def __init__(self, id, stock, timePeriod, prediction, accuracy, momentum_rsi, 
                       trend_ema , volume_emv, trend_cci, momentum_stoch, trend_adx,
                       trend_macd, volume_adi):
        self.id = id
        self.stock = stock
        self.timePeriod = timePeriod
        self.prediction = prediction
        self.accuracy = accuracy
        self.momentum_rsi = momentum_rsi
        self.trend_ema = trend_ema
        self.volume_emv = volume_emv
        self.trend_cci = trend_cci
        self.momentum_stoch = momentum_stoch
        self.trend_adx = trend_adx
        self.trend_macd = trend_macd
        self.volume_adi = volume_adi
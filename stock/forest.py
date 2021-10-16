# Generates a random forest model from dataset.
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import numpy

from stock.label import stock_data

from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import pandas

class Forest:

    def __init__(self, stock, features, days):
    
        self.stock = stock
        self.features = features

        self.data = stock_data(stock)

        self.x = self.data[features]
        self.y = self.data['Output' + str(days)]

        split = int(self.data.shape[0] * 0.75)
        self.x_train = self.x[:split]
        self.y_train = self.y[:split]
        self.x_test = self.x[split:]
        self.y_test = self.y[split:]

        self.model = self.generate_random_forest(100)

    def update(self, stock, features, days):
        self.features = features

        if stock != self.stock:
            self.stock = stock
            self.data = stock_data(stock)

        self.x = self.data[features]
        self.y = self.data['Output' + str(days)]

        split = int(self.data.shape[0] * 0.75)
        self.x_train = self.x[:split]
        self.y_train = self.y[:split]
        self.x_test = self.x[split:]
        self.y_test = self.y[split:]

        self.model = self.generate_random_forest(100)

    # Generate random forest model with training data.
    def generate_random_forest(self, estimators): 
        self.model = RandomForestClassifier(criterion="entropy",
                                            n_estimators=estimators,
                                            random_state=50,
                                            max_depth=None,
                                            oob_score=True)
        self.model.fit(self.x_train, self.y_train)

        return self.model

    # Returns the accuracy of the generated model on the test data.
    def accuracy(self):
        return accuracy_score(self.y_test, self.model.predict(self.x_test), normalize=True) * 100.0

    # Returns a report on the quality of the model.
    def report(self):
        return classification_report(self.y_test, self.model.predict(self.x_test))

    def get_values_for_date(self, date):
        return self.x.loc[date].to_frame().transpose()

    # Returns a 2D array of the predictions of each decision tree in the forest.
    def decision_tree_values(self, date):
        values = []
        for tree in self.model.estimators_:
            values.append(tree.predict(self.get_values_for_date(date))[0])

        grid = numpy.reshape(values, (-1, 10))

        return grid

    # Returns the prediction of the decision tree as 1 or -1
    def decision_tree_prediction(self, tree):
        if tree.predict(self.x_test.tail(1))[0] == self.y_test.tail(1)[0]:
            return 1

        return -1

    # Returns a 2D array of accuracy of each decision tree in forest.
    def decision_tree_accuracy(self, date):
        values = []

        for tree in self.model.estimators_:
            prediction = tree.predict(self.get_values_for_date(date))[0]
            score = tree.score(self.x_test, self.y_test)
            if prediction == 1:
                values.append(score)
            else:
                values.append(0 - score)

        grid = numpy.reshape(values, (-1, 10))

        return grid

    def decision_path(self, date):
        print(self.model.decision_path(self.get_values_for_date(date)))

    def model_prediction(self, date):
        prediction = self.model.predict(self.get_values_for_date(date))

        if prediction[0] == 1:
            return "Up"
        else:
            return "Down"

# tree = [10, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 500, 1000]
# tree = [10, 25, 50, 100, 150, 200, 300, 500, 750, 1000, 2000, 5000, 10000]
# x = Forest('MSFT', 30)
# for j in range(40):
#   start = time.time()
#  i = (j + 1) * 25
# x.generate_random_forest(i)
# z = x.accuracy()
# end = time.time() - start
# print(i, z, end)
# print("A accuracy: ", z, " speed: ", end)
# x.decision_path()


# G = ['volume_adi', 'volume_obv', 'volume_cmf', 'volume_fi', 'volume_em', 'volume_sma_em', 'volume_vpt', 'volume_nvi', 'volatility_atr', 'volatility_bbhi', 'volatility_bbli', 'volatility_kchi', 'volatility_kcli', 'volatility_dchi', 'volatility_dcli', 'trend_macd', 'trend_ema_fast', 'trend_ema_slow', 'trend_adx', 'trend_vortex_ind_diff', 'trend_trix', 'trend_mass_index', 'trend_cci', 'trend_dpo', 'trend_kst', 'trend_kst_sig', 'trend_kst_diff', 'trend_ichimoku_a', 'trend_ichimoku_b', 'trend_visual_ichimoku_a', 'trend_visual_ichimoku_b', 'trend_aroon_ind', 'momentum_rsi', 'momentum_mfi', 'momentum_tsi', 'momentum_uo', 'momentum_stoch', 'momentum_stoch_signal', 'momentum_wr', 'momentum_ao', 'momentum_kama', 'momentum_roc', 'others_dr', 'others_dlr', 'others_cr']

# A = ['momentum_rsi', 'trend_ema_fast', 'trend_ema_slow', 'momentum_wr', 'momentum_stoch', 'trend_adx']
# B = ['momentum_rsi', 'volume_adi', 'trend_cci', 'momentum_wr', 'trend_macd', 'momentum_stoch', 'trend_ema_fast', 'trend_ema_slow', 'volatility_bbm']
# C = ['momentum_rsi', 'momentum_stoch', 'momentum_wr', 'trend_macd', 'momentum_roc', 'volume_obv']
# D = ['momentum_stoch', 'trend_macd', 'trend_cci', 'momentum_roc', 'momentum_rsi', 'volatility_bbm', 'volatility_bbl'] # No SD
# E = ['volatility_atr', 'trend_macd', 'momentum_mfi', 'momentum_stoch', 'trend_adx', 'trend_cci', 'momentum_rsi', 'momentum_roc', 'volume_adi']
# F = ['momentum_stoch', 'momentum_roc', 'momentum_wr', 'volume_adi', 'trend_cci', 'momentum_rsi', 'volatility_bbm', 'volatility_bbl'] # No SD
# H = ['momentum_rsi', 'volume_obv', 'volatility_bbl']

# af = Forest('MSFT', A)
# bf = Forest('MSFT', B)
# cf = Forest('MSFT', C)
# df = Forest('MSFT', D)
# ef = Forest('MSFT', E)
# ff = Forest('MSFT', F)
# gf = Forest('MSFT', G)
# hf = Forest('MSFT', H)


# print("A accuracy: ", af.accuracy(), " OOB Score: ", af.model.oob_score_)
# print("B accuracy: ", bf.accuracy(), " OOB Score: ", bf.model.oob_score_)
# print("C accuracy: ", cf.accuracy(), " OOB Score: ", cf.model.oob_score_)
# print("D accuracy: ", df.accuracy(), " OOB Score: ", df.model.oob_score_)
# print("E accuracy: ", ef.accuracy(), " OOB Score: ", ef.model.oob_score_)
# print("F accuracy: ", ff.accuracy(), " OOB Score: ", ff.model.oob_score_)
# print("G accuracy: ", gf.accuracy(), " OOB Score: ", gf.model.oob_score_)
# print("H accuracy: ", hf.accuracy(), " OOB Score: ", hf.model.oob_score_)

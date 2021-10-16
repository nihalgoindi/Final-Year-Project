#Finnhub API client 
#Available from:
#https://github.com/s0h3ck/finnhub-api-python-client
#Finnhub API is available under the MIT license.
#@author: s0h3ck

#modified to only include necessary requests
#@author: rokas rudys



import requests

from finnhub.exceptions import FinnhubAPIException
from finnhub.exceptions import FinnhubRequestException

class Client:
    API_URL = "https://finnhub.io/api/v1"

    def __init__(self, api_key, requests_params=None):
        self.api_key = api_key
        self.session = self._init__session()
        self._requests_params = requests_params

    def _init__session(self):
        session = requests.session()
        session.headers.update({'Accept': 'application/json',
                                'User-Agent': 'finnhub/python'})
        return session

    def _request(self, method, uri, **kwargs):
        
        kwargs['timeout'] = 40

        data = kwargs.get('data', None)

        if data and isinstance(data, dict):
            kwargs['data'] = data
        else:
            kwargs['data'] = {}

        kwargs['data']['token'] = self.api_key
        kwargs['params'] = kwargs['data']

        del(kwargs['data'])

        response = getattr(self.session, method)(uri, **kwargs)

        return self._handle_response(response)

    def _create_api_uri(self, path):
        return "{}/{}".format(self.API_URL, path)

    def _request_api(self, method, path, **kwargs):
        uri = self._create_api_uri(path)
        return self._request(method, uri, **kwargs)

    def _handle_response(self, response):
        if not str(response.status_code).startswith('2'):
            raise FinnhubAPIException(response)
        try:
            return response.json()
        except ValueError:
            raise FinnhubRequestException("Invalid Response: {}".format(response.text))

    def _get(self, path, **kwargs):
        return self._request_api('get', path, **kwargs)

    def company_profile(self, **params):
        return self._get("stock/profile", data=params)
        
    def exchange(self):
        return self._get("stock/exchange")

    def stock_symbol(self, **params):
        return self._get("stock/symbol", data=params)

    def stock_candle(self, **params):
        return self._get("stock/candle", data=params)

    def stock_tick(self, **params):
        return self._get("stock/tick", data=params)

    def forex_exchange(self):
        return self._get("forex/exchange")

    def forex_symbol(self, **params):
        return self._get("forex/symbol", data=params)

    def forex_candle(self, **params):
        return self._get("forex/candle", data=params)

    def crypto_exchange(self):
        return self._get("crypto/exchange")

    def crypto_symbol(self, **params):
        return self._get("crypto/symbol", data=params)

    def crypto_candle(self, **params):
        return self._get("crypto/candle", data=params)

    def calendar_ipo(self):
        return self._get("calendar/ipo")

    def calendar_ico(self):
        return self._get("calendar/ico")

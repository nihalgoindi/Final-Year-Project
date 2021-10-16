from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import timezone

#Create your models here.    
class Symbol(models.Model):
    exchange = models.CharField(max_length=16)
    dataType = models.CharField(max_length=8)
    symbol = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    date = models.DateTimeField()
    class Meta:
        unique_together = (('exchange',"dataType", "symbol"),)

class Stock(models.Model):
    symbol = models.ForeignKey(Symbol, on_delete=models.CASCADE)
    date = models.CharField(max_length=20)
    open = models.FloatField(null=True)
    high = models.FloatField(null=True)
    low = models.FloatField(null=True)
    close = models.FloatField(null=True)
    volume = models.FloatField(null=True)

    class Meta:
        unique_together = (('symbol', "date"),)

class Forex(models.Model):
    symbol = models.ForeignKey(Symbol, on_delete=models.CASCADE)
    date = models.DateTimeField()
    open = models.FloatField(null=True)
    high = models.FloatField(null=True)
    low = models.FloatField(null=True)
    close = models.FloatField(null=True)
    volume = models.FloatField(null=True)

    class Meta:
        unique_together = (('symbol', "date"),)

class Crypto(models.Model):
    symbol = models.ForeignKey(Symbol, on_delete=models.CASCADE)
    date = models.DateTimeField()
    open = models.FloatField(null=True)
    high = models.FloatField(null=True)
    low = models.FloatField(null=True)
    close = models.FloatField(null=True)
    volume = models.FloatField(null=True)

    class Meta:
        unique_together = (('symbol', "date"),)

class BuyRule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.TextField()
    rule = models.TextField()
    html = models.TextField()
    

class SellRule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.TextField()
    rule = models.TextField()
    html = models.TextField()

class Strategy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.TextField()
    strategy = models.TextField()
    html = models.TextField()

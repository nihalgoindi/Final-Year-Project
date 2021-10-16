import datetime
from django import template

register = template.Library()

@register.simple_tag(takes_context=True)
def tagtest(context):
    stock = context['stock']
    timeperiod = context['timeperiod']
    return stock + timeperiod
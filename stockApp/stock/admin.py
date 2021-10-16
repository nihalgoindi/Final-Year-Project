from django.contrib import admin

# Register your models here.
from .models import Symbol
from .models import Stock

admin.site.register(Symbol)
admin.site.register(Stock)
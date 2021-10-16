from django.contrib import admin
from django.urls import path, include
from stock.dash_apps import dashboard


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('stock.urls')),
    path('django_plotly_dash/', include('django_plotly_dash.urls')),
]

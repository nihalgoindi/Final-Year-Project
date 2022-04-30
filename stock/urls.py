from django.urls import path,include
from . import views
#url links for stockcharting.
urlpatterns = [
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/', include('accounts.urls')),
    path('', views.home, name="homepage"),
    path('search', views.search, name="search"),
    path('testStrategy', views.testStrategy, name="testStrategy"),
    path('getGraph', views.getGraph, name="getGraph"),
    path('getRules', views.getRules, name="getRules"),
    path('saveRule', views.saveRule, name="saveRule"),
    path('saveStrat', views.saveStrat, name="saveStrat"),
    path('deleteRule', views.deleteRule, name="deleteRule"),
    path('deleteStrat', views.deleteStrat, name="deleteStrat"),
    path('rulebuilding', views.rulebuilding, name="rulebuilding"),
    path('ruleBuilderNew', views.ruleBuilderNew, name="ruleBuilderNew"),
    path('strategyBuilder', views.strategyBuilder, name="strategyBuilder"),
    path('scatterget', views.scatterget, name="scatterget"),
    path('scatterPlot', views.scatter, name="scatterPlot"),
    path(r'^machinelearning/(?P<stock>\w+)/(?P<timeperiod>\w+)/$',
         views.machine_learning,
         name="machinelearning"),
    path(r'^delData/(?P<id>\w+)/$', views.delData, name="delData"),
    path(r'^setData/(?P<stock>\w+)/(?P<timeperiod>\w+)/$',
         views.setData,
         name="setData"),
    path('viewMLData', views.viewData, name="viewMLData"),
]

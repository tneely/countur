"""counterSite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
	https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
	1. Add an import:  from my_app import views
	2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
	1. Add an import:  from other_app.views import Home
	2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
	1. Import the include() function: from django.conf.urls import url, include
	2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from counter.views import *
from counter.models import Counter, Count
from django.contrib.auth.decorators import login_required

urlpatterns = [
    url(r'^$', login_required(CounterListView.as_view()), name="counters"),
    url(r'^(?P<pk>\d+)$', login_required(CounterDetailView.as_view()), name="counter"),
    # Counter save functions
    url(r'^(?P<counter_id>\d+)/(?P<value>-?\d+)$', login_required(increment), name="increment"),
    url(r'^delete/(?P<counter_id>\d+)$', login_required(delete), name="delete"),
    url(r'^rename/(?P<counter_id>\d+)/(?P<name>\w+[ \w]+)$', login_required(rename), name="rename"),
    url(r'^reorder/(?P<counter_id>\d+)/(?P<new_pos>\d+)$', login_required(reorder), name="reorder"),
    url(r'^resize/(?P<counter_id>\d+)/(?P<height>\d+)/(?P<width>\d+)$', login_required(resize), name="resize"),
    url(r'^create/(?P<name>\w+[ \w]*)/(?P<value>-?\d*)/$', login_required(create), name="create"),
]

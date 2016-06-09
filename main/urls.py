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
from . import views

urlpatterns = [
    url(r'^$', views.login, name='home'),
    url(r'^contact/', views.contact, name='contact'),
    url(r'^about/', views.about, name='about'),
    # Account
    url(r'^accounts/login/$', views.login, name='account_login'),
    url(r'^accounts/signup/$', views.signup, name='account_signup'),
    url(r"^accounts/logout/$", views.logout, name="account_logout"),
    url(r"^accounts/manage/$", views.manage, name="account_manage"),
    url(r"^accounts/delete/$", views.delete, name="account_delete"),
    url(r"^accounts/password/change/$", views.password_change,
        name="account_change_password"),
    url(r"^accounts/password/set/$", views.password_set, name="account_set_password"),
    url(r"^accounts/inactive/$", views.account_inactive, name="account_inactive"),
    # E-mail
    url(r"^accounts/email/$", views.email, name="account_email"),
    url(r"^accounts/confirm-email/$", views.email_verification_sent,
        name="account_email_verification_sent"),
    url(r"^accounts/confirm-email/(?P<key>[-:\w]+)/$", views.confirm_email,
        name="account_confirm_email"),
    # Password reset
    url(r"^accounts/password/reset/$", views.password_reset,
        name="account_reset_password"),
    url(r"^accounts/password/reset/done/$", views.password_reset_done,
        name="account_reset_password_done"),
    url(r"^accounts/password/reset/key/(?P<uidb36>[0-9A-Za-z]+)-(?P<key>.+)/$",
        views.password_reset_from_key,
        name="account_reset_password_from_key"),
    url(r"^accounts/password/reset/key/done/$", views.password_reset_from_key_done,
        name="account_reset_password_from_key_done"),
]

# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-04-23 15:20
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('counter', '0002_auto_20160423_1119'),
    ]

    operations = [
        migrations.RenameField(
            model_name='count',
            old_name='createdd',
            new_name='created',
        ),
    ]
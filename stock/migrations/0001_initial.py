# Generated by Django 2.2.7 on 2020-02-03 11:37

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Symbol',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(max_length=8)),
                ('exchange', models.CharField(max_length=8)),
                ('name', models.CharField(max_length=255)),
                ('region', models.CharField(max_length=8)),
                ('currency', models.CharField(max_length=8)),
            ],
        ),
    ]

# Generated by Django 2.2.7 on 2020-02-08 17:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0009_auto_20200206_1748'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='date',
            field=models.DateTimeField(),
        ),
        migrations.AlterUniqueTogether(
            name='stock',
            unique_together={('symbol', 'timeFrame', 'date')},
        ),
        migrations.RemoveField(
            model_name='stock',
            name='minute',
        ),
    ]

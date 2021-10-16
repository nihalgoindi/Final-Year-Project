from django.test import TestCase
from django.utils import timezone
from stock.models import Symbol
from stock.models import BuyRule
from stock.models import SellRule
from stock.models import SellRule
from stock.models import Strategy
from django.contrib.auth.models import User

class SymbolModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        Symbol.objects.create( exchange = "USA",
                                dataType = "D",
                                symbol = "TEST",
                                name = "TESTNAME",
                                date = timezone.now())

    def test_name_label(self):
        s = Symbol.objects.get(id=1)
        field_label = s._meta.get_field('name').verbose_name
        self.assertEquals(field_label, 'name')

    def test_symbol_label(self):
        s = Symbol.objects.get(id=1)
        field_label = s._meta.get_field('symbol').verbose_name
        self.assertEquals(field_label, 'symbol')


class BuyRuleModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        user = User.objects.create_user('myusername', 'myemail@crazymail.com', 'mypassword')
        BuyRule.objects.create( user = user,
                                name = "test",
                                rule = "test",
                                html = "test")

    def test_name_label(self):
        s = BuyRule.objects.get(id=1)
        field_label = s._meta.get_field('name').verbose_name
        self.assertEquals(field_label, 'name')

    def test_rule_label(self):
        s = BuyRule.objects.get(id=1)
        field_label = s._meta.get_field('rule').verbose_name
        self.assertEquals(field_label, 'rule')

class SellRuleModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        user = User.objects.create_user('myusername', 'myemail@crazymail.com', 'mypassword')
        SellRule.objects.create( user = user,
                                name = "test",
                                rule = "test",
                                html = "test")

    def test_name_label(self):
        s = SellRule.objects.get(id=1)
        field_label = s._meta.get_field('name').verbose_name
        self.assertEquals(field_label, 'name')

    def test_rule_label(self):
        s = SellRule.objects.get(id=1)
        field_label = s._meta.get_field('rule').verbose_name
        self.assertEquals(field_label, 'rule')

class StrategyModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        user = User.objects.create_user('myusername', 'myemail@crazymail.com', 'mypassword')
        Strategy.objects.create( user = user,
                                name = "test",
                                strategy = "test",
                                html = "test")

    def test_name_label(self):
        s = Strategy.objects.get(id=1)
        field_label = s._meta.get_field('name').verbose_name
        self.assertEquals(field_label, 'name')

    def test_rule_label(self):
        s = Strategy.objects.get(id=1)
        field_label = s._meta.get_field('strategy').verbose_name
        self.assertEquals(field_label, 'strategy')
from django.test import TestCase
from django.utils.timezone import timezone
from stock.models import Symbol

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
        self.assertEquals(field_label, 'TESTNAME')

    def test_symbol_label(self):
        s = Symbol.objects.get(id=1)
        field_label = s._meta.get_field('symbol').verbose_name
        self.assertEquals(field_label, 'TEST')


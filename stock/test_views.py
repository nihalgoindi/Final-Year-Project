from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class HometViewTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        test= 0

    def test_view_url_exists_at_desired_location(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
           
    def test_view_url_accessible_by_name(self):
        response = self.client.get(reverse('homepage'))
        self.assertEqual(response.status_code, 200)

class scatterPlotViewTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        test= 0
    def test_view_url_exists_at_desired_location(self):
        response = self.client.get('/scatterPlot')
        self.assertEqual(response.status_code, 200)
           
    def test_view_url_accessible_by_name(self):
        response = self.client.get(reverse('scatterPlot'))
        self.assertEqual(response.status_code, 200)

class rulebuildingViewTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        test= 0 

    def test_view_url_exists_at_desired_location(self):
        response = self.client.get('/rulebuilding')
        self.assertEqual(response.status_code, 200)
           
    def test_view_url_accessible_by_name(self):
        response = self.client.get(reverse('rulebuilding'))
        self.assertEqual(response.status_code, 200)
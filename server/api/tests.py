from django.test import TestCase


class ApiEndpointsTests(TestCase):
    def test_hello_endpoint(self):
        response = self.client.get('/hello/')
        self.assertEqual(response.status_code, 200)

    def test_foobar_endpoint(self):
        response = self.client.get('/foobar/')
        self.assertEqual(response.status_code, 200)

import unittest
import requests
from app import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.base_url = 'http://localhost:5000'
        self.valid_data = {
            'content': '武侠小说，主角擅长剑法',
            'word_count': '1000'
        }
    
    def test_normal_request(self):
        response = self.client.post('/', data=self.valid_data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('output', response.json)
        
    def test_invalid_word_count(self):
        test_cases = [
            {'word_count': '300'},   # 低于最小值
            {'word_count': '20000'}, # 超过最大值
            {'word_count': 'abc'}    # 非数字
        ]
        
        for case in test_cases:
            data = {**self.valid_data, **case}
            response = self.client.post('/', data=data)
            self.assertEqual(response.status_code, 400)

    def test_empty_content(self):
        response = self.client.post('/', data={'content': '', 'word_count': '1000'})
        self.assertEqual(response.status_code, 400)

    def test_server_error_handling(self):
        with unittest.mock.patch('requests.post') as mock_post:
            mock_post.side_effect = Exception("模拟错误")
            response = self.client.post('/', data=self.valid_data)
            self.assertEqual(response.status_code, 500)
            self.assertIn('模拟错误', response.json['error'])

if __name__ == '__main__':
    unittest.main()

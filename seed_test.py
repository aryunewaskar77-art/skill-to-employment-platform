import requests
res = requests.post('http://localhost:8000/api/v1/identity/seed-review-samples')
print(res.status_code, res.text)

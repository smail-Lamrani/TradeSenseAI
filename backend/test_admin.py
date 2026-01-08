"""
Test script for admin API - verbose
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

# Login as admin
print("=== LOGIN ===")
login_res = requests.post(f'{BASE_URL}/auth/login', json={
    'email': 'admin@tradesense.com',
    'password': 'admin123'
})
print(f"Status: {login_res.status_code}")
data = login_res.json()
print(f"Response: {json.dumps(data, indent=2)}")

if 'access_token' in data:
    token = data['access_token']
    print(f"\nToken (first 50 chars): {token[:50]}...")
    
    # Try to get users
    print()
    print("=== GET ADMIN USERS ===")
    headers = {'Authorization': f'Bearer {token}'}
    print(f"Headers: {headers}")
    
    users_res = requests.get(f'{BASE_URL}/admin/users', headers=headers)
    print(f"Status: {users_res.status_code}")
    print(f"Response headers: {dict(users_res.headers)}")
    
    try:
        users_data = users_res.json()
        print(f"Response body: {json.dumps(users_data, indent=2)}")
    except:
        print(f"Response text: {users_res.text}")
else:
    print(f"Login failed: {data}")

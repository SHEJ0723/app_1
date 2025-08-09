#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试管理员登录
"""

import requests
import json
import time

# API基础URL
BASE_URL = "http://localhost:5000"

def test_admin_login():
    """测试管理员登录"""
    print("=== 测试管理员登录 ===")
    
    # 1. 先获取验证码
    try:
        print("1. 获取验证码...")
        response = requests.get(f"{BASE_URL}/api/captcha")
        print(f"验证码响应状态码: {response.status_code}")
        print(f"验证码响应头: {dict(response.headers)}")
        print(f"验证码响应cookies: {dict(response.cookies)}")
        
        if response.status_code == 200:
            captcha_data = response.json()
            captcha_text = captcha_data['data']['text']
            session_id = response.cookies.get('session_id')
            print(f"获取验证码成功: {captcha_text}")
            print(f"Session ID: {session_id}")
        else:
            print(f"获取验证码失败: {response.text}")
            return
    except Exception as e:
        print(f"获取验证码请求失败: {e}")
        return
    
    # 2. 管理员登录
    login_data = {
        "workId": "admin",
        "adminPassword": "admin123",
        "captcha": captcha_text
    }
    
    headers = {
        'Cookie': f'session_id={session_id}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n2. 管理员登录...")
    print(f"登录数据: {login_data}")
    print(f"请求头: {headers}")
    
    try:
        response = requests.post(f"{BASE_URL}/api/admin-login", json=login_data, headers=headers)
        print(f"登录响应状态码: {response.status_code}")
        print(f"登录响应头: {dict(response.headers)}")
        print(f"登录响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                token = data.get('data', {}).get('token')
                print(f"登录成功，获取到token: {token[:20]}...")
                return token
            else:
                print(f"登录失败: {data.get('message')}")
        else:
            print(f"登录失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"登录请求失败: {e}")
    
    return None

if __name__ == '__main__':
    # 等待服务器启动
    print("等待服务器启动...")
    time.sleep(3)
    
    test_admin_login() 
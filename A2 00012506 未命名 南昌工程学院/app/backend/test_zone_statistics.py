#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试分区统计API
"""

import requests
import json

# API基础URL
BASE_URL = "http://localhost:5000"

def get_admin_token():
    """获取管理员token"""
    # 1. 先获取验证码
    try:
        response = requests.get(f"{BASE_URL}/api/captcha")
        if response.status_code == 200:
            captcha_data = response.json()
            captcha_text = captcha_data['data']['text']
            session_id = response.cookies.get('session_id')
            print(f"获取验证码成功: {captcha_text}")
        else:
            print(f"获取验证码失败: {response.text}")
            return None
    except Exception as e:
        print(f"获取验证码请求失败: {e}")
        return None
    
    # 2. 管理员登录
    login_data = {
        "workId": "admin",
        "adminPassword": "admin123",
        "captcha": captcha_text
    }
    
    headers = {
        'Cookie': f'session_id={session_id}'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/admin-login", json=login_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data.get('data', {}).get('token')
        else:
            print(f"登录失败: {response.text}")
            return None
    except Exception as e:
        print(f"登录请求失败: {e}")
        return None

def test_zone_statistics():
    """测试分区统计API"""
    print("=== 测试分区统计API ===")
    
    # 获取管理员token
    token = get_admin_token()
    if not token:
        print("获取token失败，退出测试")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Require-Role': 'admin'
    }
    
    # 测试分区统计API
    try:
        response = requests.get(f"{BASE_URL}/api/statistics/zone-details", headers=headers)
        print(f"分区统计API状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                zone_stats = data.get('data', [])
                print(f"分区统计获取成功，共 {len(zone_stats)} 个分区:")
                for zone in zone_stats:
                    print(f"  {zone['name']}: {zone['total']}个车位, {zone['occupied']}个占用, "
                          f"使用率{zone['usage']}%, 今日收入¥{zone['income']}, 状态:{zone['status']}")
            else:
                print(f"分区统计API返回失败: {data.get('message')}")
        else:
            print(f"分区统计API失败: {response.text}")
    except Exception as e:
        print(f"分区统计API请求失败: {e}")

if __name__ == '__main__':
    test_zone_statistics() 
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试账单API功能（带认证）
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
        print(f"登录响应状态码: {response.status_code}")
        print(f"登录响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            return data.get('data', {}).get('token')
        else:
            print(f"登录失败: {response.text}")
            return None
    except Exception as e:
        print(f"登录请求失败: {e}")
        return None

def test_bills_api_with_auth():
    """测试账单API（带认证）"""
    print("=== 测试账单API功能（带认证）===")
    
    # 获取管理员token
    print("\n1. 获取管理员token...")
    token = get_admin_token()
    if not token:
        print("获取token失败，退出测试")
        return
    
    print("获取token成功")
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Require-Role': 'admin'
    }
    
    # 2. 测试获取账单列表
    print("\n2. 测试获取账单列表...")
    try:
        response = requests.get(f"{BASE_URL}/api/bills", headers=headers)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"成功获取账单列表，共 {data.get('total', 0)} 条记录")
            if data.get('data'):
                print("第一条账单信息:")
                bill = data['data'][0]
                print(f"  账单ID: {bill.get('id')}")
                print(f"  用户名: {bill.get('user_name')}")
                print(f"  用户电话: {bill.get('user_phone')}")
                print(f"  订单编号: {bill.get('order_number')}")
                print(f"  金额: ¥{bill.get('amount')}")
                print(f"  状态: {bill.get('status')}")
                print(f"  支付方式: {bill.get('pay_method')}")
        else:
            print(f"获取账单列表失败: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 3. 测试获取账单统计
    print("\n3. 测试获取账单统计...")
    try:
        response = requests.get(f"{BASE_URL}/api/bills/statistics", headers=headers)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            stats = data.get('data', {})
            print(f"总账单数: {stats.get('total_bills', 0)}")
            print(f"已支付账单: {stats.get('paid_bills', 0)}")
            print(f"未支付账单: {stats.get('unpaid_bills', 0)}")
            print(f"总金额: ¥{stats.get('total_amount', 0):.2f}")
            print(f"已支付金额: ¥{stats.get('paid_amount', 0):.2f}")
            print(f"今日账单: {stats.get('today_bills', 0)}")
            print(f"今日金额: ¥{stats.get('today_amount', 0):.2f}")
            print(f"本月账单: {stats.get('month_bills', 0)}")
            print(f"本月金额: ¥{stats.get('month_amount', 0):.2f}")
        else:
            print(f"获取统计信息失败: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 4. 测试搜索功能
    print("\n4. 测试搜索功能...")
    try:
        params = {
            'status': '已支付',
            'page': 1,
            'per_page': 5
        }
        response = requests.get(f"{BASE_URL}/api/bills", params=params, headers=headers)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"搜索已支付账单，共找到 {data.get('total', 0)} 条记录")
        else:
            print(f"搜索失败: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 5. 测试导出功能
    print("\n5. 测试导出功能...")
    try:
        response = requests.get(f"{BASE_URL}/api/bills/export", headers=headers)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"导出成功，共 {len(data.get('data', []))} 条记录")
            print(f"文件名: {data.get('filename', 'unknown')}")
            # 显示前几条导出数据
            if data.get('data'):
                print("前3条导出数据:")
                for i, bill in enumerate(data['data'][:3]):
                    print(f"  {i+1}. {bill}")
        else:
            print(f"导出失败: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 6. 测试获取账单详情
    print("\n6. 测试获取账单详情...")
    try:
        # 先获取一个账单ID
        response = requests.get(f"{BASE_URL}/api/bills", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get('data'):
                bill_id = data['data'][0]['id']
                response = requests.get(f"{BASE_URL}/api/bills/{bill_id}", headers=headers)
                print(f"状态码: {response.status_code}")
                if response.status_code == 200:
                    detail_data = response.json()
                    bill_detail = detail_data.get('data', {})
                    print(f"账单详情获取成功:")
                    print(f"  账单ID: {bill_detail.get('id')}")
                    print(f"  用户名: {bill_detail.get('user_name')}")
                    print(f"  用户电话: {bill_detail.get('user_phone')}")
                    print(f"  用户邮箱: {bill_detail.get('user_email')}")
                    print(f"  订单编号: {bill_detail.get('order_number')}")
                    print(f"  金额: ¥{bill_detail.get('amount')}")
                    print(f"  状态: {bill_detail.get('status')}")
                    print(f"  支付方式: {bill_detail.get('pay_method')}")
                else:
                    print(f"获取账单详情失败: {response.text}")
        else:
            print("无法获取账单列表来测试详情")
    except Exception as e:
        print(f"请求失败: {e}")
    
    print("\n=== 测试完成 ===")

if __name__ == '__main__':
    test_bills_api_with_auth() 
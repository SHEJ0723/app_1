import axios from 'axios';
import { getToken } from '@/utils/auth';

// 创建axios实例
const licensePlatesApi = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
licensePlatesApi.interceptors.request.use(
    config => {
        // 使用认证工具获取token
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
licensePlatesApi.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        if (error.response) {
            // 服务器返回错误
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    console.error('请求参数错误:', data.message);
                    break;
                case 401:
                    console.error('未授权或Token过期:', data.message);
                    // 可以在这里处理token过期的逻辑，比如跳转到登录页
                    break;
                case 403:
                    console.error('禁止访问:', data.message);
                    break;
                case 404:
                    console.error('资源不存在:', data.message);
                    break;
                case 500:
                    console.error('服务器错误:', data.message);
                    break;
                default:
                    console.error('未知错误:', data.message);
            }
            return Promise.reject(data);
        } else if (error.request) {
            // 请求发出但没有收到响应
            console.error('网络错误，请检查您的网络连接');
            return Promise.reject(new Error('网络错误，请检查您的网络连接'));
        } else {
            // 请求配置出错
            console.error('请求配置错误:', error.message);
            return Promise.reject(error);
        }
    }
);

// 获取用户车牌列表
export const getUserLicensePlates = async () => {
    try {
        const response = await licensePlatesApi.get('/api/license-plates');
        return response;
    } catch (error) {
        console.error('获取车牌列表失败:', error);
        throw error;
    }
};

// 添加新车牌
export const addLicensePlate = async (data) => {
    try {
        const response = await licensePlatesApi.post('/api/license-plates', data);
        return response;
    } catch (error) {
        console.error('添加车牌失败:', error);
        throw error;
    }
};

// 更新车牌信息
export const updateLicensePlate = async (plateId, data) => {
    try {
        const response = await licensePlatesApi.put(`/api/license-plates/${plateId}`, data);
        return response;
    } catch (error) {
        console.error('更新车牌失败:', error);
        throw error;
    }
};

// 删除车牌
export const deleteLicensePlate = async (plateId) => {
    try {
        const response = await licensePlatesApi.delete(`/api/license-plates/${plateId}`);
        return response;
    } catch (error) {
        console.error('删除车牌失败:', error);
        throw error;
    }
};

// 设置默认车牌
export const setDefaultLicensePlate = async (plateId) => {
    try {
        const response = await licensePlatesApi.put(`/api/license-plates/set-default/${plateId}`);
        return response;
    } catch (error) {
        console.error('设置默认车牌失败:', error);
        throw error;
    }
}; 
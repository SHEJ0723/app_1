import axios from 'axios';
import { cacheManager } from '@/utils/cacheManager'

// 创建axios实例
const parkingApi = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
parkingApi.interceptors.request.use(
    config => {
        // 从localStorage获取token
        const token = localStorage.getItem('token');
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
parkingApi.interceptors.response.use(
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

// 获取停车位列表
export const getParkingSpots = async (params = {}) => {
    try {
        // 生成缓存键
        const cacheKey = `parking_spots_${JSON.stringify(params)}`
        
        // 尝试从缓存获取
        const cached = cacheManager.get(cacheKey, { useStorage: true, namespace: 'parking' })
        if (cached) {
            return cached
        }

        const response = await parkingApi.get('/api/parking-spots', { params });
        
        // 缓存结果（2分钟）
        cacheManager.set(cacheKey, response, 2 * 60 * 1000, { 
            useStorage: true, 
            namespace: 'parking' 
        })
        
        return response;
    } catch (error) {
        console.error('获取停车位列表失败:', error);
        throw error;
    }
};

// 获取停车场统计数据
export const getParkingStats = async () => {
    try {
        // 生成缓存键
        const cacheKey = 'parking_stats'
        
        // 尝试从缓存获取
        const cached = cacheManager.get(cacheKey, { useStorage: true, namespace: 'parking' })
        if (cached) {
            return cached
        }

        const response = await parkingApi.get('/api/parking-stats');
        
        // 缓存结果（1分钟，因为统计数据需要实时性）
        cacheManager.set(cacheKey, response, 1 * 60 * 1000, { 
            useStorage: true, 
            namespace: 'parking' 
        })
        
        return response;
    } catch (error) {
        console.error('获取停车场统计数据失败:', error);
        throw error;
    }
};

// 创建停车位
export const createParkingSpot = async (data) => {
    try {
        const response = await parkingApi.post('/api/parking-spots', data);
        return response;
    } catch (error) {
        console.error('创建停车位失败:', error);
        throw error;
    }
};

// 更新停车位
export const updateParkingSpot = async (spotId, data) => {
    try {
        const response = await parkingApi.put(`/api/parking-spots/${spotId}`, data);
        return response;
    } catch (error) {
        console.error('更新停车位失败:', error);
        throw error;
    }
};

// 删除停车位
export const deleteParkingSpot = async (spotId) => {
    try {
        const response = await parkingApi.delete(`/api/parking-spots/${spotId}`);
        return response;
    } catch (error) {
        console.error('删除停车位失败:', error);
        throw error;
    }
};
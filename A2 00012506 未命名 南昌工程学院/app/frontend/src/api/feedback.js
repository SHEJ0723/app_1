import axios from 'axios';

// 创建axios实例
const feedbackApi = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
feedbackApi.interceptors.request.use(
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
feedbackApi.interceptors.response.use(
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

// 提交反馈
export const submitFeedback = async (data) => {
    try {
        const response = await feedbackApi.post('/api/feedback', data);
        return response;
    } catch (error) {
        console.error('提交反馈失败:', error);
        throw error;
    }
};

// 获取用户反馈列表
export const getUserFeedback = async (params = {}) => {
    try {
        const response = await feedbackApi.get('/api/feedback', { params });
        return response;
    } catch (error) {
        console.error('获取反馈列表失败:', error);
        throw error;
    }
};

// 获取反馈详情
export const getFeedbackDetail = async (feedbackId) => {
    try {
        const response = await feedbackApi.get(`/api/feedback/${feedbackId}`);
        return response;
    } catch (error) {
        console.error('获取反馈详情失败:', error);
        throw error;
    }
};

// 更新反馈
export const updateFeedback = async (feedbackId, data) => {
    try {
        const response = await feedbackApi.put(`/api/feedback/${feedbackId}`, data);
        return response;
    } catch (error) {
        console.error('更新反馈失败:', error);
        throw error;
    }
};

// 删除反馈
export const deleteFeedback = async (feedbackId) => {
    try {
        const response = await feedbackApi.delete(`/api/feedback/${feedbackId}`);
        return response;
    } catch (error) {
        console.error('删除反馈失败:', error);
        throw error;
    }
}; 
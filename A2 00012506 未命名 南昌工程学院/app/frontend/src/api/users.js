import axios from 'axios';

// 创建axios实例
const usersApi = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
usersApi.interceptors.request.use(
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
usersApi.interceptors.response.use(
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

// 获取用户个人信息
export const getUserProfile = async () => {
    try {
        const response = await usersApi.get('/api/users/profile');
        return response;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
    }
};

// 更新用户个人信息
export const updateUserProfile = async (data) => {
    try {
        const response = await usersApi.put('/api/users/profile', data);
        return response;
    } catch (error) {
        console.error('更新用户信息失败:', error);
        throw error;
    }
};

// 修改密码
export const changePassword = async (data) => {
    try {
        const response = await usersApi.post('/api/users/change-password', data);
        return response;
    } catch (error) {
        console.error('修改密码失败:', error);
        throw error;
    }
};

// 上传头像
export const uploadAvatar = async (data) => {
    try {
        const response = await usersApi.post('/api/users/avatar', data);
        return response;
    } catch (error) {
        console.error('上传头像失败:', error);
        throw error;
    }
};

// 管理员功能：获取用户列表
export const getUsers = async (params = {}) => {
    try {
        const response = await usersApi.get('/api/admin/users', { params });
        return response;
    } catch (error) {
        console.error('获取用户列表失败:', error);
        throw error;
    }
};

// 管理员功能：添加用户
export const addUser = async (data) => {
    try {
        const response = await usersApi.post('/api/admin/users', data);
        return response;
    } catch (error) {
        console.error('添加用户失败:', error);
        throw error;
    }
};

// 管理员功能：更新用户
export const updateUser = async (userId, data) => {
    try {
        const response = await usersApi.put(`/api/admin/users/${userId}`, data);
        return response;
    } catch (error) {
        console.error('更新用户失败:', error);
        throw error;
    }
};

// 管理员功能：删除用户
export const deleteUser = async (userId) => {
    try {
        const response = await usersApi.delete(`/api/admin/users/${userId}`);
        return response;
    } catch (error) {
        console.error('删除用户失败:', error);
        throw error;
    }
};
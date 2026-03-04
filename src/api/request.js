import axios from 'axios';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    // 可以根据业务逻辑处理响应
    if (res.code !== 200) {
      console.error('请求失败:', res.message);
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  error => {
    console.error('网络错误:', error.message);
    return Promise.reject(error);
  }
);

export default service;
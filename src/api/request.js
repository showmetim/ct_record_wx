// 基础配置
const baseURL = import.meta.env.VITE_API_BASE_URL;
const timeout = 10000;
console.log(import.meta.env);
// 请求拦截器
function requestInterceptor(config) {
  // 可以在这里添加 token 等认证信息
  // const token = uni.getStorageSync('token');
  // if (token) {
  //   config.header.Authorization = `Bearer ${token}`;
  // }
  return config;
}

// 响应拦截器
function responseInterceptor(response) {
  const res = response.data;
  // 可以根据业务逻辑处理响应
  if (res.code !== 200) {
    console.error('请求失败:', res.message);
    return Promise.reject(new Error(res.message || '请求失败'));
  }
  return res;
}

// 创建请求服务
const service = {
  request(config) {
    // 合并默认配置
    const options = {
      url: baseURL + config.url,
      method: config.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      data: config.data,
      timeout
    };

    // 请求拦截
    const interceptedConfig = requestInterceptor(options);

    // 发送请求
    return new Promise((resolve, reject) => {
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          try {
            const result = responseInterceptor(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          console.error('网络错误:', error.errMsg);
          reject(error);
        }
      });
    });
  },
  get(url, config = {}) {
    return this.request({ ...config, url, method: 'GET' });
  },
  post(url, data, config = {}) {
    return this.request({ ...config, url, method: 'POST', data });
  },
  put(url, data, config = {}) {
    return this.request({ ...config, url, method: 'PUT', data });
  },
  delete(url, config = {}) {
    return this.request({ ...config, url, method: 'DELETE' });
  }
};

export default service;
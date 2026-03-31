// 基础配置
const baseURL = import.meta.env.VITE_API_BASE_URL;
const timeout = 10000;

// 防止重复登录
let loginPromise = null;

// 请求拦截器
function requestInterceptor(config) {
  // 可以在这里添加 token 等认证信息
  const token = uni.getStorageSync('token');
  if (token) {
    config.header.Authorization  = `Bearer ${token}`;
  }
  return config;
}

// 响应拦截器
function responseInterceptor(response, service, originalConfig) {
  const res = response.data;
  if (
    (response.statusCode === 401 || res.code === 401) &&
    !originalConfig._retry
  ) {
    originalConfig._retry = true;

    // 清掉旧 token
    uni.removeStorageSync('token');

    // 重新登录
    return login().then(() => {
      return service.request(originalConfig); // ✅ 自动重试
    });
  }

  if (res.code !== 200) {
    return Promise.reject(res.msg || '请求失败');
  }

  return res;
}
function login() {
  if (loginPromise) return loginPromise;

  loginPromise = new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        uni.request({
          url: baseURL + "users/login",
          method: "POST",
          data: { code: loginRes.code },
          success: (res) => {
            const result = res.data;
            if (result.code === 200) {
              const token = result.data.token;
              uni.setStorageSync('token', token);
              resolve(token);
            } else {
              reject(result.msg);
            }
          },
          fail: reject
        });
      },
      fail: reject
    });
  });

  return loginPromise.finally(() => {
    loginPromise = null;
  });
}


// 创建请求服务
const service = {
  async request(config) {
    let token = uni.getStorageSync('token');

    // ✅ 只有没 token 才登录
    if (!token) {
      await login();
      token = uni.getStorageSync('token');
    }

    const options = {
      url: baseURL + config.url,
      method: config.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...config.header
      },
      data: config.data,
      timeout
    };

    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success: (response) => {
          Promise.resolve(responseInterceptor(response, service, config))
            .then(resolve)
            .catch(reject);
        },
        fail: reject
      });
    });
  },
  get(url, config = {}) {
    return this.request({ ...config, url, method: 'GET', data: config.params });
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
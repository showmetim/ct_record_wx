import request from './request';

// 登录
export const login = (code) => {
  return request.post('users/login', {
    code
  });
};

// 获取用户信息
export const getUserInfo = (userId) => {
  return request.get(`users/detail/${userId}`);
};

// 更新用户信息
export const updateUserInfo = (data) => {
  return request.post(`users/edit`, data);
};
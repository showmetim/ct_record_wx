import request from './request';

// 登录
export const login = (code) => {
  return request.post('users/login', {
    code
  });
};
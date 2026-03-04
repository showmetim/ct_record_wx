import request from './request';

export const userApi = {
  // 获取用户列表
  userList: (params) => {
    return request({
      url: '/user/list',
      method: 'get',
      params
    });
  }
};
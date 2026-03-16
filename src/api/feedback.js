import request from './request';

// 新增反馈建议
export const addFeedback = (data) => {
  return request.post('feedback', data);
};

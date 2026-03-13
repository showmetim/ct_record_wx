import request from './request';

// 获取分类列表
export const getCategoryList = () => {
  return request.get('categories/list');
};

// 新增分类
export const addCategory = (data) => {
  return request.post('categories/add', data);
};

// 删除分类
export const deleteCategory = (categoryId) => {
  return request.delete(`categories/delete/${categoryId}`);
};
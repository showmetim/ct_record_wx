import request from './request';

// 用户下笔记列表
export const getNoteList = (params) => {
  return request.get(`notes/list`, {
    params
  });
};

// 新增笔记
export const addNote = (data) => {
  return request.post('notes/add', data);
};

// 笔记详情
export const getNoteDetail = (noteId) => {
  return request.get(`notes/detail/${noteId}`);
};

// 更新笔记
export const updateNote = (noteId, data) => {
  return request.post(`notes/update/${noteId}`, data);
};

// 删除笔记
export const deleteNote = (noteId) => {
  return request.delete(`notes/delete/${noteId}`);
};

// 复习笔记
export const reviewNote = (noteId) => {
  return request.post(`notes/review/${noteId}`);
};

// 已掌握笔记
export const masteredNote = (userId) => {
  return request.post(`notes/mastered/${userId}`);
};

// 统计
export const noteStats = () => {
  return request.get(`notes/stats`);
};

// 上传图片
export const uploadImage = (data) => {
  return request.post('upload/image', data);
};
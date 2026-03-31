<template>
  <view class="page flex flex-column">
    <!-- 初始状态：拍照/选择图片 -->
    <view v-if="photoList.length === 0" class="photo-contain">
      <view class="photo-main flex flex-column flex-center">
        <image src="/static/images/camera_gray.png" alt="" />
        <view class="photo-select flex">
          <view class="photo-text title-size" @click="takePhoto">拍照</view>
          <view class="img-select title-size" @click="choosePhoto">选择图片</view>
        </view>
      </view>
    </view>
    <!-- 选择图片后：使用 swiper 展示 -->
    <view v-if="photoList.length > 0" class="photo-select flex justify-end mb-30">
      <view class="photo-text title-size" @click="takePhoto">继续拍照</view>
      <view class="img-select title-size" @click="choosePhoto">继续选择</view>
    </view>
    <view v-if="photoList.length > 0" class="swiper-contain">
      <swiper :indicator-dots="true" indicator-active-color="#3a7afe" class="swiper">
        <swiper-item v-for="(item, index) in photoList" :key="index">
          <view class="swiper-item flex flex-center">
            <image mode="aspectFit" :src="item.url" alt="" class="swiper-image" @click="previewImage(index)" />
            <!-- 删除按钮 -->
            <view class="delete-btn" @click.stop="deletePhoto(index)">
              <text class="delete-icon">×</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <!-- 分类容器 -->
    <view class="classify" @longpress="toggleCategoryEditMode">
      <view class="title title-size font-bold">分类<text class="edit-tip text-size">（长按可编辑）</text></view>
      <!-- 横向滑动的分类列表 -->
      <scroll-view scroll-x="true" class="classify-scroll" show-scrollbar="false">
        <view class="classify-list flex">
          <view 
            v-for="category in categories" 
            :key="category.id"
            class="classify-item"
            :class="{ active: classify === category.id }"
            @click="isCategoryEditMode ? deleteCategoryItem(category.id) : selectCategory(category.id)"
          >
            <text class="classify-text">{{ category.name }}</text>
            <!-- 删除按钮 (仅在编辑模式显示) -->
            <view v-if="isCategoryEditMode" class="category-delete-btn" @click.stop="deleteCategoryItem(category.id)">
              <text class="category-delete-icon">×</text>
            </view>
          </view>
          <!-- 新增分类按钮 -->
          <view class="classify-item add-item" @click="addCategoryItem">
            <text class="classify-text">+</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 内容概述 -->
    <view class="textarea-container">
      <view class="title title-size font-bold">内容概述<text class="edit-tip">（选填）</text></view>
      <textarea 
        class="textarea" 
        placeholder="请输入内容概述" 
        v-model="content"
        placeholder-style="color: #999; font-size: 28rpx;"
      ></textarea>
    </view>
    
    <!-- 备注 -->
    <view class="textarea-container">
      <view class="title title-size font-bold">备注<text class="edit-tip">（选填）</text></view>
      <textarea 
        class="textarea" 
        placeholder="请输入备注" 
        v-model="note"
        placeholder-style="color: #999; font-size: 28rpx;"
      ></textarea>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-container">
      <button class="save-btn" @click="saveNote">保存错题</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCategoryList, addCategory as addCategoryApi, deleteCategory } from '../../../api/category'
import { addNote, getNoteDetail, updateNote, uploadImage } from '../../../api/note'

// 图片列表
const photoList = ref([])
// 新上传的图片列表
const newImages = ref([])
// 删除的图片id列表
const deleteImageIds = ref([])
// 分类数据
const categories = ref([])
// 当前选中的分类
const classify = ref('')
// 分类编辑模式状态
const isCategoryEditMode = ref(false)
// 内容概述
const content = ref('')
// 备注
const note = ref('')
// 笔记id（编辑模式时存在）
const noteId = ref('')
// 是否为编辑模式
const isEditMode = ref(false)
// 页面加载时获取分类列表
onLoad((options) => {
  if (options.id) {
    // 编辑模式
    isEditMode.value = true
    noteId.value = options.id
    // 获取笔记详情
    getNoteDetail(options.id).then(res => {
      if (res.isSuccess) {
        const noteData = res.data
        // 回显数据
        content.value = noteData.content || ''
        note.value = noteData.note || ''
        classify.value = noteData.categoryId || ''
        // 回显图片（存储完整的图片对象，包含id和url）
        if (noteData.images && noteData.images.length > 0) {
          photoList.value = noteData.images
        }
      }
    })
  }
  
  // 获取分类列表
  getCategoryList().then(res => {
    if (res.isSuccess) {
      categories.value = res.data
      // 如果没有选中的分类，默认选中第一个
      if (!classify.value && categories.value.length > 0) {
        classify.value = categories.value[0].id
      }
    }
  })
})

// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      uploadImageFile(res.tempFilePaths[0])
    }
  })
}

// 选择图片
const choosePhoto = () => {
  uni.chooseImage({
    count: 99, // 设置一个较大的值，实际上uni-app会根据设备能力限制
    sourceType: ['album'],
    success: (res) => {
      // 上传每张图片
      res.tempFilePaths.forEach(filePath => {
        console.log('上传图片路径:', filePath)
        uploadImageFile(filePath)
      })
    }
  })
}

// 上传图片
const uploadImageFile = (filePath) => {
  uni.uploadFile({
    url: `${import.meta.env.VITE_API_BASE_URL}upload/image`, // 使用相对路径，实际会通过 request.js 中的 baseURL 拼接
    filePath: filePath,
    name: 'file',
    success: (uploadRes) => {
      try {
        const response = JSON.parse(uploadRes.data)
        if (response.isSuccess) {
          // 上传成功，获取图片信息
          const imageData = response.data
          const imageObj = {
            id: imageData.id, // 假设接口返回的data中包含id
            url: imageData.url
          }
          photoList.value.push(imageObj)
          newImages.value.push(imageObj)
        } else {
          uni.showToast({
            title: '图片上传失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      }
    },
    fail: () => {
      uni.showToast({
        title: '图片上传失败',
        icon: 'none'
      })
    }
  })
}

// 删除图片
const deletePhoto = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        // 如果是编辑模式，需要记录删除的图片id
        if (isEditMode.value) {
          // 获取图片对象，包含id和url
          const deletedImage = photoList.value[index]
          if (deletedImage.id) {
            deleteImageIds.value.push(deletedImage.id)
          }
        }
        photoList.value.splice(index, 1)
      }
    }
  })
}

// 预览图片
const previewImage = (index) => {
  // 提取图片url数组用于预览
  const imageUrls = photoList.value.map(img => img.url)
  uni.previewImage({
    urls: imageUrls,
    current: index,
  })
}

// 选择分类
const selectCategory = (categoryId) => {
  classify.value = categoryId
  // 选择分类后退出编辑模式
  isCategoryEditMode.value = false
}

// 切换分类编辑模式
const toggleCategoryEditMode = () => {
  isCategoryEditMode.value = !isCategoryEditMode.value
}

// 删除分类
const deleteCategoryItem = (categoryId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个分类吗？',
    success: (res) => {
      if (res.confirm) {
        deleteCategory(categoryId).then(res => {
          if (res.isSuccess) {
            // 从本地列表中移除
            categories.value = categories.value.filter(cat => cat.id !== categoryId)
            // 如果删除的是当前选中的分类，重置选中状态
            if (classify.value === categoryId) {
              classify.value = categories.value.length > 0 ? categories.value[0].id : ''
            }
          } else {
            uni.showToast({
              title: res.msg || '删除分类失败',
              icon: 'none'
            })
          }
        }).catch(err => {
          uni.showToast({
            title: err || '删除分类失败',
            icon: 'none'
          })
        })
      }
    }
  })
}

// 新增分类
const addCategoryItem = () => {
  uni.showModal({
    title: '新增分类',
    placeholderText: '请输入分类名称',
    editable: true,
    success: (res) => {
      if (res.confirm && res.content) {
        addCategoryApi({ name: res.content }).then(res => {
          if (res.isSuccess) {
            // 添加到本地列表
            categories.value.push(res.data)
            // 确保分类id正确设置
            classify.value = res.data.id
            // 新增分类后退出编辑模式
            isCategoryEditMode.value = false
          } else {
            uni.showToast({
              title: '新增分类失败',
              icon: 'none'
            })
          }
        })
      }
    }
  })
}

// 保存错题
const saveNote = () => {
  // 表单验证
  if (!isEditMode.value && photoList.value.length === 0) {
    uni.showToast({
      title: '请至少选择一张图片',
      icon: 'none'
    })
    return
  }
  
  if (!classify.value) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none'
    })
    return
  }
  
  if (isEditMode.value) {
    // 编辑模式
    const updateData = {
      categoryId: classify.value,
      content: content.value,
      note: note.value
    }
    
    // 如果有新上传的图片
    if (newImages.value.length > 0) {
      updateData.newImages = newImages.value.map(img => img.url)
    }
    
    // 如果有删除的图片
    if (deleteImageIds.value.length > 0) {
      updateData.deleteImageIds = deleteImageIds.value
    }
    
    updateNote(noteId.value, updateData).then(res => {
      if (res.isSuccess) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    })
  } else {
    // 新增模式
    const addData = {
      images: photoList.value.map(img => img.url),
      categoryId: classify.value,
      content: content.value,
      note: note.value
    }
    
    console.log('新增错题数据:', addData)
    addNote(addData).then(res => {
      if (res.isSuccess) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    })
  }
}
</script>


<style scoped lang="scss">
.title-size {
  font-size: 30rpx;
}
.text-size {
  font-size: 24rpx;
}
.page {
  width: 750rpx;
  padding: 30rpx;
  background-color: #f5f6f8;
  box-sizing: border-box;
  .photo-select {
    gap: 30rpx;
    view {
      padding: 15rpx 30rpx;
      border-radius: 20rpx;
      background-color: #e5e7eb;
      color: #61666f;
    }
    .photo-text {
      color: #fff;
      font-weight: 500;
      background-color: #3a7afe;
    }
  }
  .edit-tip {
    color: #999;
    font-size: 21rpx;
  }
  .photo-contain {
    width: 630rpx;
    height: 360rpx;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    .photo-main {
      width: 100%;
      height: 100%;
      background-color: #f9fafb;
      border-radius: 20rpx;
      border: 2rpx dashed #e3e5e9;
      gap: 30rpx;
      image {
        width: 100rpx;
        height: 100rpx;
      }
    }
  }
  .swiper-contain {
    width: 690rpx;
    height: 360rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    .swiper {
      width: 100%;
      height: 100%;
    }
    .swiper-item {
      width: 100%;
      height: 100%;
      background-color: #f9fafb;
      position: relative;
    }
    .swiper-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .delete-btn {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      width: 40rpx;
      height: 40rpx;
      background-color: rgba(99, 98, 98, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .delete-icon {
      color: #fff;
      font-size: 31rpx;
      font-weight: bold;
      line-height: 1;
      text-align: center;
    }
  }
  .classify {
    width: 630rpx;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-top: 30rpx;
    .title {
      margin-bottom: 20rpx;
    }
    .classify-scroll {
      width: 100%;
      white-space: nowrap;
      .classify-list {
        gap: 20rpx;
        padding-top: 15rpx;
        padding-right: 15rpx;
        .classify-item {
          padding: 10rpx 25rpx;
          background-color: #f9fafb;
          border-radius: 20rpx;
          margin-right: 15rpx;
          position: relative;
          display: flex;
          align-items: center;
          &.active {
            background-color: #3a7afe;
          }
          .classify-text {
            font-size: 28rpx;
            color: #61666f;
          }
          &.active .classify-text {
            color: #fff;
            font-weight: 500;
          }
        }
        .add-item {
          border: 2rpx dashed #e3e5e9;
          background-color: transparent;
          .classify-text {
            font-size: 36rpx;
            color: #3a7afe;
          }
        }
        .category-delete-btn {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
          width: 30rpx;
          height: 30rpx;
          background-color: #ff4d4f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        .category-delete-icon {
          color: #fff;
          font-size: 22rpx;
          line-height: 1;
          font-weight: bold;
        }
      }
    }
  }
  .textarea-container {
    width: 630rpx;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-top: 30rpx;
    .title {
      margin-bottom: 20rpx;
    }
    .textarea {
      width: 100%;
      height: 120rpx;
      padding: 20rpx 0 0 10rpx;
      background-color: #f9fafb;
      border-radius: 15rpx;
      font-size: 26rpx;
      color: #333;
      line-height: 1.5;
      resize: none;
    }
  }
  .save-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
    margin-bottom: 30rpx;
    .save-btn {
      width: 630rpx;
      height: 80rpx;
      background-color: #3a7afe;
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
      border-radius: 20rpx;
      border: none;
      outline: none;
    }
  }
}
</style>

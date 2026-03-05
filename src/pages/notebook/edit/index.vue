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
      <swiper :indicator-dots="true" :autoplay="false" :interval="3000" :duration="1000" class="swiper">
        <swiper-item v-for="(item, index) in photoList" :key="index">
          <view class="swiper-item flex flex-center">
            <image mode="aspectFit" :src="item" alt="" class="swiper-image" @click="previewImage(index)" />
            <!-- 删除按钮 -->
            <view class="delete-btn" @click.stop="deletePhoto(index)">
              <text class="delete-icon">×</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <!-- 分类容器 -->
    <view class="classify" @longpress="toggleEditMode">
      <view class="title title-size font-bold">分类<text class="edit-tip text-size">（长按可编辑）</text></view>
      <!-- 横向滑动的分类列表 -->
      <scroll-view scroll-x="true" class="classify-scroll" show-scrollbar="false">
        <view class="classify-list flex">
          <view 
            v-for="(category, index) in categories" 
            :key="index"
            class="classify-item"
            :class="{ active: classify === category }"
            @click="isEditMode ? deleteCategory(index, category) : selectCategory(category)"
          >
            <text class="classify-text">{{ category }}</text>
            <!-- 删除按钮 (仅在编辑模式显示) -->
            <view v-if="isEditMode" class="category-delete-btn" @click.stop="deleteCategory(index, category)">
              <text class="category-delete-icon">×</text>
            </view>
          </view>
          <!-- 新增分类按钮 -->
          <view class="classify-item add-item" @click="addCategory">
            <text class="classify-text">+</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 知识概述 -->
    <view class="textarea-container">
      <view class="title title-size font-bold">知识概述<text class="edit-tip">（选填）</text></view>
      <textarea 
        class="textarea" 
        placeholder="请输入知识概述" 
        v-model="overview"
        placeholder-style="color: #999; font-size: 28rpx;"
      ></textarea>
    </view>
    
    <!-- 备注 -->
    <view class="textarea-container">
      <view class="title title-size font-bold">备注<text class="edit-tip">（选填）</text></view>
      <textarea 
        class="textarea" 
        placeholder="请输入备注" 
        v-model="remark"
        placeholder-style="color: #999; font-size: 28rpx;"
      ></textarea>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-container">
      <button class="save-btn" @click="saveNote">保存笔记</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const photoList = ref([])
// 分类数据
const categories = ref(['默认', '数学',  '专业课'])
// 当前选中的分类
const classify = ref('默认')
// 编辑模式状态
const isEditMode = ref(false)
// 知识概述
const overview = ref('')
// 备注
const remark = ref('')
// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      // 追加图片到现有列表
      photoList.value = [...photoList.value, ...res.tempFilePaths]
    }
  })
}
// 选择图片
const choosePhoto = () => {
  uni.chooseImage({
    count: 99, // 设置一个较大的值，实际上uni-app会根据设备能力限制
    sourceType: ['album'],
    success: (res) => {
      // 追加图片到现有列表
      photoList.value = [...photoList.value, ...res.tempFilePaths]
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
        photoList.value.splice(index, 1)
      }
    }
  })
}
// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: photoList.value,
    current: index,
  })
}
// 选择分类
const selectCategory = (category) => {
  classify.value = category
  // 选择分类后退出编辑模式
  isEditMode.value = false
}
// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}
// 删除分类
const deleteCategory = (index, category) => {
  categories.value.splice(index, 1)
  // 如果删除的是当前选中的分类，重置选中状态
  if (classify.value === category) {
    classify.value = categories.value.length > 0 ? categories.value[0] : ''
  }
}
// 新增分类
const addCategory = () => {
  uni.showModal({
    title: '新增分类',
    placeholderText: '请输入分类名称',
    editable: true,
    success: (res) => {
      if (res.confirm && res.content) {
        categories.value.push(res.content)
        classify.value = res.content
        // 新增分类后退出编辑模式
        isEditMode.value = false
      }
    }
  })
}
// 保存笔记
const saveNote = () => {
  // 表单验证
  if (photoList.value.length === 0) {
    uni.showToast({
      title: '请至少选择一张图片',
      icon: 'none'
    })
    return
  }
  
  // 准备提交数据
  const noteData = {
    imgList: photoList.value,
    classify: classify.value,
    overview: overview.value,
    remark: remark.value
  }
  
  // 模拟提交数据
  console.log('保存笔记数据:', noteData)
  
  // 显示保存成功提示
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
  
  // 保存成功后可以跳转回笔记列表页面
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
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
      font-size: 35rpx;
      font-weight: bold;
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
          padding: 15rpx 25rpx;
          background-color: #f9fafb;
          border-radius: 20rpx;
          margin-right: 15rpx;
          position: relative;
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
          font-size: 23rpx;
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

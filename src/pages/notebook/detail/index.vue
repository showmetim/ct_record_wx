<template>
  <view class="detail-container">
    <!-- 分类 -->
    <view class="category-section flex justify-between items-center">
      <view class="category-tag" :style="{ backgroundColor: mistakeData.classify?.bgColor || '#3a7afe' }">
        {{ mistakeData.classify?.name || '未分类' }}
      </view>
      <view class="action-buttons flex items-center">
        <view class="edit-button" @click="goToEdit">
          <text class="edit-button-text">编辑</text>
        </view>
        <view class="delete-button" @click="confirmDelete">
          <text class="delete-button-text">删除</text>
        </view>
      </view>
    </view>

    <!-- 题目图片 Swiper -->
    <view class="image-section" v-if="mistakeData.imgList && mistakeData.imgList.length > 0">
      <swiper class="swiper-container" indicator-dots="true" indicator-active-color="#3a7afe">
        <swiper-item v-for="(image, index) in mistakeData.imgList" :key="index">
          <image class="swiper-image" :src="image" mode="aspectFill" @click="previewImage(image, index)" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 内容概述 -->
    <view class="content-section" v-if="mistakeData.overview">
      <view class="section-title">内容概述</view>
      <view class="content-text">{{ mistakeData.overview }}</view>
    </view>

    <!-- 备注 -->
    <view class="notes-section" v-if="mistakeData.remark">
      <view class="section-title">我的备注</view>
      <view class="notes-content">{{ mistakeData.remark }}</view>
    </view>

    <!-- 记录 -->
    <view class="record-section">
      <view class="section-title">记录</view>
      <view class="record-item">
        <text class="record-label">创建时间</text>
        <text class="record-value">{{ formatTime(mistakeData.createdAt) }}</text>
      </view>
      <view class="record-item">
        <text class="record-label">最近复习</text>
        <text class="record-value">{{ formatTime(mistakeData.lastReviewTime) }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <view class="button mastered" @click="markAsMastered">已掌握</view>
      <view class="button reviewed" @click="markAsReviewed">复习+1</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getNoteDetail, reviewNote, masteredNote, deleteNote } from '../../../api/note'

// 路由参数
const routeParams = ref({ id: '' })
// 是否首次加载
const isFirstLoad = ref(true)

// 获取错题详情
const fetchNoteDetail = (id) => {
  getNoteDetail(id).then(res => {
    if (res.isSuccess) {
      const data = res.data
      mistakeData.value = {
        id: data.id,
        classify: {
          name: data.category ? data.category.name : '未分类',
          bgColor: data.category ? data.category.color : '#3a7afe'
        },
        imgList: data.images ? data.images.map(img => img.url) : [],
        remark: data.note || '',
        overview: data.content || '',
        createdAt: data.createdAt,
        lastReviewTime: data.lastReviewTime
      }
    }
    // 首次加载完成后设置为非首次加载
    if (isFirstLoad.value) {
      isFirstLoad.value = false
    }
  })
}

// 页面加载时获取数据
onLoad((options) => {
  routeParams.value = options
  // 获取错题详情
  fetchNoteDetail(options.id)
})

// 页面显示时重新获取数据
onShow(() => {
  // 非首次加载且有id时才重新获取数据
  if (!isFirstLoad.value && routeParams.value.id) {
    fetchNoteDetail(routeParams.value.id)
  }
})

// 错题数据
const mistakeData = ref({
  id: '1',
  classify: {
    name: '数学',
    bgColor: '#3a7afe'
  },
  imgList: [],
  remark: '',
  overview: '',
  createdAt: '',
  lastReviewTime: ''
})

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 预览图片
const previewImage = (current, index) => {
  uni.previewImage({
    current,
    urls: mistakeData.value.imgList
  })
}

// 标记为已复习
const markAsReviewed = () => {
  reviewNote(routeParams.value.id).then(res => {
    if (res.isSuccess) {
      mistakeData.value.lastReviewTime = res.data.lastReviewTime
      uni.showToast({
        title: res.msg,
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  })
}

// 标记为已掌握
const markAsMastered = () => {
  uni.showModal({
    title: '确认',
    content: '确定要标记为已掌握吗？标记后将从错题集中移除。',
    success: (res) => {
      if (res.confirm) {
        masteredNote(routeParams.value.id).then(res => {
          if (res.isSuccess) {
            uni.showToast({
              title: '已标记为已掌握',
              icon: 'success'
            })
            // 延时返回上一页
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            uni.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            })
          }
        })
      }
    }
  })
}

// 跳转到编辑页面
const goToEdit = () => {
  uni.navigateTo({
    url: `/pages/notebook/edit/index?id=${routeParams.value.id}`
  })
}

// 确认删除
const confirmDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这道错题吗？',
    success: (res) => {
      if (res.confirm) {
        deleteNote(routeParams.value.id).then(res => {
          if (res.isSuccess) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            // 延时返回上一页
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            uni.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            })
          }
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.detail-container {
  background-color: #f5f6f8;
  padding: 30rpx;
  min-height: 100vh;
}

.category-section {
    padding: 20rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    .category-tag {
      display: inline-block;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      color: #fff;
      font-size: 28rpx;
    }
    .action-buttons {
      gap: 15rpx;
    }
    .edit-button {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      background-color: #f0f0f0;
      .edit-button-text {
        font-size: 28rpx;
        color: #333;
      }
    }
    .delete-button {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      background-color: #f0f0f0;
      .delete-button-text {
        font-size: 28rpx;
        color: #ff3b30;
      }
    }
  }

.image-section {
  background-color: #fff;
  margin-bottom: 20rpx;
  .swiper-container {
    height: 500rpx;
    .swiper-image {
      width: 100%;
      height: 100%;
    }
  }
}

.notes-section,
.content-section,
.record-section {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 15rpx;
    color: #333;
  }
}

.notes-content,
.content-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #666;
  white-space: pre-wrap;
}

.record-section {
  .record-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10rpx;
    .record-label {
      font-size: 28rpx;
      color: #666;
    }
    .record-value {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: #fff;
  padding: 30rpx 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  .button {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 600;
  }
  .reviewed {
    background-color: #f0f0f0;
    color: #333;
  }
  .mastered {
    background-color: #3a7afe;
    margin-right: 20rpx;
    color: #fff;
  }
}
</style>
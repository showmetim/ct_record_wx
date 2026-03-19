<template>
  <view class="detail-container">
    <!-- 进度条 -->
    <view class="progress-section" v-if="reviewMode">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
      </view>
      <view class="progress-text">{{ currentIndex + 1 }} / {{ totalQuestions }}</view>
    </view>
    
    <!-- 分类 -->
    <view class="category-section flex justify-between items-center">
      <view class="category-tag" :style="{ backgroundColor: mistakeData.classify?.bgColor || '#3a7afe' }">
        {{ mistakeData.classify?.name || '未分类' }}
      </view>
      <view class="action-buttons flex items-center" v-if="!reviewMode">
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
      <view class="content-text">
        <text user-select>{{ mistakeData.overview }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="notes-section" v-if="mistakeData.remark">
      <view class="section-title">我的备注</view>
      <view class="notes-content">
        <text user-select>{{ mistakeData.remark }}</text>
      </view>
    </view>

    <!-- 记录 -->
    <view class="record-section">
      <view class="section-title">记录</view>
      <view class="record-item">
        <text class="record-label">创建时间</text>
        <text class="record-value">{{ mistakeData.createdAt }}</text>
      </view>
      <view class="record-item">
        <text class="record-label">最近复习</text>
        <text class="record-value">{{ mistakeData.lastReviewTime }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons" v-if="!reviewMode">
      <view class="button mastered" @click="markAsMastered">已掌握</view>
    </view>
    
    <!-- 复习模式底部按钮 -->
    <view class="review-bottom-buttons" v-if="reviewMode">
      <view class="review-buttons-container">
        <view class="review-button not-know" @click="handleReviewAction('dontKnow')">不会</view>
        <view class="review-button fuzzy" @click="handleReviewAction('fuzzy')">模糊</view>
        <view class="review-button know" @click="handleReviewAction('know')">会了</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getNoteDetail, reviewNote, masteredNote, deleteNote } from '../../../api/note'

// 路由参数
const routeParams = ref({ id: '', reviewIds: '', currentIndex: 0 })
// 是否首次加载
const isFirstLoad = ref(true)
// 动画数据
const animationData = ref({})
// 复习模式相关
const reviewMode = ref(false)
const reviewIds = ref([])
const currentIndex = ref(0)
const reviewQuestions = ref([])
const loading = ref(false)

// 计算属性
const totalQuestions = computed(() => reviewIds.value.length)
const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return ((currentIndex.value + 1) / totalQuestions.value) * 100
})
// 获取错题详情
const fetchNoteDetail = (id) => {
  return new Promise((resolve) => {
    getNoteDetail(id).then(res => {
      if (res.isSuccess) {
        const data = res.data
        resolve({
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
        })
      } else {
        resolve(null)
      }
    }).catch(() => {
      resolve(null)
    })
  })
}

// 批量获取复习题目数据
const fetchReviewQuestions = async () => {
  loading.value = true
  try {
    const promises = reviewIds.value.map(id => fetchNoteDetail(id))
    const results = await Promise.all(promises)
    reviewQuestions.value = results.filter(item => item !== null)
    // 加载第一个题目
    if (reviewQuestions.value.length > 0) {
      mistakeData.value = reviewQuestions.value[0]
    }
  } catch (error) {
    console.error('获取复习题目失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onLoad((options) => {
  routeParams.value = options
  // 检查是否是复习模式
  if (options.reviewIds) {
    reviewMode.value = true
    reviewIds.value = options.reviewIds.split(',')
    currentIndex.value = parseInt(options.currentIndex) || 0
    // 批量获取所有复习题目数据
    fetchReviewQuestions().finally(() => {
      // 首次加载完成后设置为非首次加载
      isFirstLoad.value = false
    })
  } else {
    // 获取单个错题详情
    fetchNoteDetail(options.id).then(data => {
      if (data) {
        mistakeData.value = data
      }
    }).finally(() => {
      // 首次加载完成后设置为非首次加载
      isFirstLoad.value = false
    })
  }
})

// 页面显示时重新获取数据
onShow(() => {
  // 非首次加载且有id时才重新获取数据
  if (!isFirstLoad.value && routeParams.value.id && !reviewMode.value) {
    fetchNoteDetail(routeParams.value.id).then(data => {
      if (data) {
        mistakeData.value = data
      }
    })
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

// 预览图片
const previewImage = (current, index) => {
  uni.previewImage({
    current,
    urls: mistakeData.value.imgList
  })
}


// 标记为已掌握
const markAsMastered = () => {
  
  uni.showModal({
    title: '确认',
    content: '确定要标记为已掌握吗？',
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

// 处理复习模式下的按钮点击
const handleReviewAction = (action) => {
  // 标记为已复习
  const currentNoteId = reviewMode.value ? reviewIds.value[currentIndex.value] : routeParams.value.id
  reviewNote(currentNoteId, { click: action }).then(res => {
    if (res.isSuccess) {
      // 跳转到下一题
      const nextIndex = currentIndex.value + 1
      if (nextIndex < reviewIds.value.length) {
        // 在同一页面内切换题目，不跳转页面
        currentIndex.value = nextIndex
        if (reviewQuestions.value[nextIndex]) {
          mistakeData.value = reviewQuestions.value[nextIndex]
        } else {
          // 如果本地没有数据，重新获取
          fetchNoteDetail(reviewIds.value[nextIndex]).then(data => {
            if (data) {
              mistakeData.value = data
              // 更新本地数据
              reviewQuestions.value[nextIndex] = data
            }
          })
        }
      } else {
        // 复习完成，跳转到海报页
        uni.showToast({
          title: '复习完成',
          icon: 'success'
        })
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/notebook/poster/index?todayReview=${reviewIds.value.length}&mastered=${Math.floor(reviewIds.value.length * 0.6)}&consecutiveDays=3`
          })
        }, 800)
      }
    } else {
      uni.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.detail-container {
  background-color: #f5f6f8;
  padding: 30rpx;
  min-height: 100vh;
  
  .progress-section {
    margin-bottom: 20rpx;
    .progress-bar {
      height: 10rpx;
      background-color: #e0e0e0;
      border-radius: 5rpx;
      overflow: hidden;
      .progress-fill {
        height: 100%;
        background-color: #3a7afe;
        border-radius: 5rpx;
        transition: width 0.3s ease;
      }
    }
    .progress-text {
      text-align: right;
      margin-top: 10rpx;
      font-size: 24rpx;
      color: #666;
    }
  }
}

.category-section {
    padding: 20rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    .category-tag {
      display: flex;
      align-items: center;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      color: #fff;
      font-size: 28rpx;
    }
    .action-buttons {
      gap: 15rpx;
    }
    .edit-button {
      padding: 10rpx 24rpx;
      border-radius: 24rpx;
      background-color: #e6f0ff;
      border: 1rpx solid #c8e0ff;
      transition: all 0.3s ease;
      .edit-button-text {
        font-size: 28rpx;
        color: #3a7afe;
        font-weight: 500;
      }
    }
    .edit-button:active {
      background-color: #d6e8ff;
      transform: scale(0.95);
    }
    .delete-button {
      padding: 10rpx 24rpx;
      border-radius: 24rpx;
      background-color: #fff2f2;
      border: 1rpx solid #ffd6d6;
      transition: all 0.3s ease;
      .delete-button-text {
        font-size: 28rpx;
        color: #ff3b30;
        font-weight: 500;
      }
    }
    .delete-button:active {
      background-color: #ffe6e6;
      transform: scale(0.95);
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
  padding: 30rpx 30rpx 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  .button {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    &:active {
      transform: scale(0.95);
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
    }
  }
  .reviewed {
    background-color: #f8f9fa;
    color: #333;
    border: 1rpx solid #e9ecef;
  }
  .mastered {
    background: linear-gradient(135deg, #3a7afe 0%, #2c64e6 100%);
    margin-right: 20rpx;
    color: #fff;
    box-shadow: 0 6rpx 16rpx rgba(58, 122, 254, 0.4);
  }
}

.review-bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 30rpx 30rpx 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  
  .review-buttons-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    
    .review-button {
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 44rpx;
      font-size: 30rpx;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.6s;
      }
      
      &:hover:before {
        left: 100%;
      }
      
      &:active {
        transform: scale(0.95);
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }
    }
    
    .not-know {
      background: linear-gradient(135deg, #ffe6e6 0%, #fff2f2 100%);
      color: #ff3b30;
      border: 1rpx solid #ffd6d6;
      box-shadow: 0 4rpx 12rpx rgba(255, 59, 48, 0.1);
    }
    
    .fuzzy {
      background: linear-gradient(135deg, #fff3cd 0%, #fff9e6 100%);
      color: #ff9500;
      border: 1rpx solid #ffd699;
      box-shadow: 0 4rpx 12rpx rgba(255, 149, 0, 0.1);
    }
    
    .know {
      background: linear-gradient(135deg, #d4edda 0%, #e6f7ee 100%);
      color: #4cd964;
      border: 1rpx solid #b3e6c4;
      box-shadow: 0 4rpx 12rpx rgba(76, 217, 100, 0.1);
    }
  }
}
</style>
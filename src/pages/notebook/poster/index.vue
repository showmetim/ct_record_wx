<template>
  <view class="poster-container">
    <view class="poster-content">
      <view class="icon-container">
        <view class="icon">
          <text class="icon-text">✨</text>
        </view>
      </view>
      
      <view class="title">今日复习完成</view>
      <view class="subtitle">恭喜你完成了今天的学习目标！</view>
      
      <view class="stats-container">
        <view class="stat-item">
          <view class="stat-icon blue">
            <text class="stat-icon-text">📚</text>
          </view>
          <view class="stat-content">
            <view class="stat-label">总错题</view>
            <view class="stat-value">{{ totalMistakes }}</view>
          </view>
          <view class="stat-unit">题</view>
        </view>
        
        <view class="stat-item">
          <view class="stat-icon green">
            <text class="stat-icon-text">🎯</text>
          </view>
          <view class="stat-content">
            <view class="stat-label">今日复习</view>
            <view class="stat-value">{{ todayReview }}</view>
          </view>
          <view class="stat-unit">题</view>
        </view>
        
        <view class="stat-item">
          <view class="stat-icon orange">
            <text class="stat-icon-text">🔥</text>
          </view>
          <view class="stat-content">
            <view class="stat-label">连续学习</view>
            <view class="stat-value">{{ consecutiveDays }}</view>
          </view>
          <view class="stat-unit">天</view>
        </view>
      </view>
      
      <view class="quote-container">
        <text class="quote">"你已经超过了昨天的自己"</text>
      </view>
      
      <view class="share-text">
        <text class="share-icon">📤</text>
          <button open-type="share" class="share-btn">
            <text class="share-label">晒一下今天的学习成果</text>
          </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShareTimeline, onShareAppMessage } from '@dcloudio/uni-app'
import { noteStats } from '../../../api/note'
import { getUserInfo } from '../../../api/user'

// 统计数据
const totalMistakes = ref(0)
const todayReview = ref(0)
const consecutiveDays = ref(0)

// 页面加载时获取数据
onLoad((options) => {
  // 从路由参数中获取今日复习数据
  if (options.todayReview) {
    todayReview.value = parseInt(options.todayReview)
  }
  
  // 获取总错题数据
  noteStats({}).then(res => {
    if (res.isSuccess) {
      totalMistakes.value = res.data.total || 0
    }
  })
  
  // 获取连续学习天数
  getUserInfo().then(res => {
    if (res.isSuccess) {
      consecutiveDays.value = res.data.streakDays || 0
    }
  })
})

// 处理分享
onShareAppMessage(() => {
  {
    return {
      title: `我今天复习了 ${todayReview.value} 道题，连续学习 ${consecutiveDays.value} 天！`,
      path: '/pages/notebook/poster/index'
    }
  }
})
</script>

<style scoped lang="scss">
.poster-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  
  .poster-content {
    width: 100%;
    max-width: 550rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .icon-container {
      margin-bottom: 40rpx;
      .icon {
        width: 200rpx;
        height: 200rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        .icon-text {
          font-size: 80rpx;
        }
      }
    }
    
    .title {
      font-size: 50rpx;
      font-weight: 600;
      color: #fff;
      margin-bottom: 20rpx;
    }
    
    .subtitle {
      font-size: 31rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 60rpx;
    }
    
    .stats-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 30rpx;
      margin-bottom: 60rpx;
      
      .stat-item {
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .stat-icon {
          width: 70rpx;
          height: 70rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.blue {
            background-color: #e6f0ff;
          }
          &.green {
            background-color: #e6f7ee;
          }
          &.orange {
            background-color: #fff9e6;
          }
          
          .stat-icon-text {
            font-size: 33rpx;
          }
        }
        
        .stat-content {
          flex: 1;
          
          .stat-label {
            font-size: 28rpx;
            color: #666;
            margin-bottom: 5rpx;
          }
          
          .stat-value {
            font-size: 38rpx;
            font-weight: 600;
            color: #333;
          }
        }
        
        .stat-unit {
          font-size: 30rpx;
          color: #999;
        }
      }
    }
    
    .quote-container {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20rpx;
      padding: 30rpx;
      margin-bottom: 60rpx;
      
      .quote {
        font-size: 28rpx;
        color: #fff;
        text-align: center;
        font-style: italic;
      }
    }
    
    .share-text {
      display: flex;
      align-items: center;
      gap: 10rpx;
      
      .share-icon {
        font-size: 24rpx;
      }
      .share-btn {
        background-color: transparent;
        border: none;
      }
      .share-btn::after {
        border: none;
      }
      .share-label {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}
</style>
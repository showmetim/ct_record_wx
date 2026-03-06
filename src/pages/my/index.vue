<template>
  <view class="my-page">
    <!-- 用户信息 -->
    <view class="user-info" @click="handleLogin">
      <view v-if="!isLoggedIn" class="login-prompt">
        <view class="avatar">
          <text class="avatar-text">登</text>
        </view>
        <text class="login-text">点击登录</text>
        <text class="login-desc">登录后同步学习数据</text>
      </view>
      <view v-else class="user-details">
        <view class="avatar">
          <text class="avatar-text">{{ userInfo.nickName.charAt(0) }}</text>
        </view>
        <text class="user-name">{{ userInfo.nickName }}</text>
        <text class="user-desc">{{ userInfo.slogan }}</text>
      </view>
    </view>
    
    <!-- 学习数据 -->
    <view class="study-data">
      <view class="data-item">
        <view class="data-left">
					<view class="data-icon">
          	<image src="/static/images/target_icon.png" alt="目标"  />
					</view>
          <text class="data-label">学习目标</text>
        </view>
        <text class="data-value">{{ userInfo.learningGoal }}</text>
      </view>
      <view class="data-item">
        <view class="data-left">
					<view class="data-icon">
          	<image src="/static/images/calendar_icon.png" alt="天数"  />
					</view>
          <text class="data-label">学习天数</text>
        </view>
        <text class="data-value">已坚持 67 天</text>
      </view>
      <view class="data-item">
        <view class="data-left">
					<view class="data-icon">
          	<image src="/static/images/progress_icon.png" alt="进度"  />
					</view>
          <text class="data-label">复习进度</text>
        </view>
        <text class="data-value">67%</text>
      </view>
    </view>
    
    <!-- 设置 -->
    <view class="settings">
      <text class="settings-title">设置</text>
    </view>
		
		<view class="study-data">
      <view class="setting-item">
        <text class="setting-label">复习提醒设置</text>
      </view>
		</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式变量
const isLoggedIn = ref(false)
const userInfo = ref({
  nickName: '学习者',
  slogan: '持续进步，稳步前行',
  learningGoal: '考研上岸',
})

// 检查登录状态
const checkLoginStatus = () => {
  // 这里可以从本地存储或后端检查登录状态
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (storedUserInfo) {
    isLoggedIn.value = true
    userInfo.value = storedUserInfo
  }
}

// 处理登录
const handleLogin = () => {
  if (isLoggedIn.value) {
    // 已登录状态跳转到个人信息编辑页面
    uni.navigateTo({
      url: '/pages/my/edit/index'
    })
    return
  }
  
  // 调用微信登录
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      console.log('登录成功', loginRes)
      // 这里可以根据登录凭证获取用户信息
      isLoggedIn.value = true
      // 存储用户信息到本地
      uni.setStorageSync('userInfo', userInfo.value)
    },
  })
}

// 页面加载时检查登录状态
onMounted(() => {
  checkLoginStatus()
})
</script>

<style scoped lang="scss">
.my-page {
  padding: 50rpx 40rpx;
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    padding: 30rpx;
    border-radius: 15rpx;
    background-color: #fff;
    .login-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      .avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        background-color: #3a7afe;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20rpx;
        .avatar-text {
          font-size: 52rpx;
          font-weight: 600;
          color: #fff;
        }
      }
      .login-text {
        font-size: 32rpx;
        font-weight: 500;
        color: #1c2636;
        margin-bottom: 10rpx;
      }
      .login-desc {
        font-size: 24rpx;
        color: #9ca4b1;
      }
    }
    .user-details {
      display: flex;
      flex-direction: column;
      align-items: center;
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background-color: #3a7afe;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20rpx;
        overflow: hidden;
        .avatar-text {
          font-size: 48rpx;
          font-weight: 600;
          color: #fff;
        }
      }
      .user-name {
        font-size: 32rpx;
        font-weight: 500;
        color: #1c2636;
        margin-bottom: 10rpx;
      }
      .user-desc {
        font-size: 24rpx;
        color: #9ca4b1;
      }
    }
  }
  
  .study-data {
    background-color: #f8f9fa;
    border-radius: 15rpx;
    padding: 25rpx;
    margin-bottom: 15rpx;
    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25rpx 0;
      .data-left {
        display: flex;
        align-items: center;
        .data-icon {
          width: 35rpx;
          height: 35rpx;
          margin-right: 15rpx;
					background: #fff;
					border-radius: 15rpx;
					padding: 5rpx;
					image {
						width: 100%;
						height: 100%;
					}
        }
        .data-label {
          font-size: 30rpx;
          color: #364153;
        }
      }
      .data-value {
        font-size: 30rpx;
        color: #9ca4b1;
      }
    }
  }
  
  .settings {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 15rpx 0;
    .settings-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #364153;
      margin-bottom: 20rpx;
    }
  }
	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		&:not(:last-child) {
			border-bottom: 1rpx solid #f0f0f0;
		}
		.setting-label {
			font-size: 28rpx;
			color: #364153;
		}
	}
}
</style>
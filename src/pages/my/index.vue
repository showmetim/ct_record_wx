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
        <text class="data-value">{{ userInfo.studyGoal }}</text>
      </view>
      <view class="data-item">
        <view class="data-left">
					<view class="data-icon">
          	<image src="/static/images/calendar_icon.png" alt="天数"  />
					</view>
          <text class="data-label">学习天数</text>
        </view>
        <text class="data-value">已坚持 {{ userInfo.streakDays }} 天</text>
      </view>
      <view class="data-item">
        <view class="data-left">
					<view class="data-icon">
          	<image src="/static/images/progress_icon.png" alt="进度"  />
					</view>
          <text class="data-label">复习进度</text>
        </view>
        <text class="data-value">{{ userInfo.progress }}%</text>
      </view>
    </view>
    
    <!-- 设置 -->
    <view class="settings">
      <text class="settings-title">设置</text>
    </view>
		
		<view class="study-data">
      <view class="setting-item" @click="showFeedbackDialog">
        <view class="data-icon">
          <image src="/static/images/question_icon.png" alt="反馈建议"  />
        </view>
        <text class="setting-label">反馈建议</text>
      </view>
		</view>
		
		<!-- 反馈建议弹窗 -->
		<view v-if="showDialog" class="dialog-overlay" @click="closeDialog">
			<view class="dialog-content" @click.stop>
				<view class="dialog-header">
					<text class="dialog-title">反馈建议</text>
					<text class="dialog-close" @click="closeDialog">×</text>
				</view>
				<view class="dialog-body">
					<view class="form-item">
						<text class="form-label">反馈内容 *</text>
						<textarea 
							class="form-textarea" 
							placeholder="请输入您的反馈建议" 
							v-model="feedbackForm.content"
							@input="handleInput"
						></textarea>
					</view>
					<view class="form-item">
						<text class="form-label">联系方式</text>
						<input 
							class="form-input" 
							placeholder="请输入您的微信或邮箱" 
							v-model="feedbackForm.contact"
						></input>
					</view>
				</view>
				<view class="dialog-footer">
					<view class="dialog-button cancel" @click="closeDialog">取消</view>
					<view class="dialog-button confirm" @click="submitFeedback" :class="{ disabled: !feedbackForm.content.trim() }">提交</view>
				</view>
			</view>
		</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { login, getUserInfo } from '../../api/user'
import { noteStats } from '../../api/note'
import { addFeedback } from '../../api/feedback'

onShareAppMessage(() => {
  return {
    title: '一款轻量的错题笔记本，快来试试吧！',
    path: '/pages/my/index'
  }
})

// 响应式变量
const isLoggedIn = ref(false)
const userInfo = ref({
  nickName: '',
  slogan: '',
  studyGoal: '',
  streakDays: 0,
  progress: 0,
})
// 反馈建议相关
const showDialog = ref(false)
const feedbackForm = ref({
  content: '',
  contact: ''
})

// 检查登录状态
const checkLoginStatus = () => {
  // 这里可以从本地存储或后端检查登录状态
  const token = uni.getStorageSync('token')
  if (token) {
    isLoggedIn.value = true
    // 获取用户详情
    getUserInfo().then(userRes => {
      if (userRes.isSuccess) {
        // 只更新需要的字段
        userInfo.value.nickName = userRes.data.nickName
        userInfo.value.slogan = userRes.data.slogan
        userInfo.value.studyGoal = userRes.data.studyGoal
        userInfo.value.streakDays = userRes.data.streakDays
      }
    })
    // 获取统计数据
    noteStats().then(res => {
      if (res.isSuccess) {
        userInfo.value.progress = res.data.progress
      }
    })
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
      const code = loginRes.code
      // 这里可以根据登录凭证获取用户信息
      login(code).then(res => {
        if (res.isSuccess) {
          isLoggedIn.value = true
          // 只存储用户id到本地
          uni.setStorageSync('userInfoId', res.data.id)
          // 获取用户详情
          getUserInfo(res.data.id).then(userRes => {
            if (userRes.isSuccess) {
              // 只更新需要的字段
              userInfo.value = {
                ...userInfo.value,
                nickName: userRes.data.nickName,
                slogan: userRes.data.slogan,
                studyGoal: userRes.data.studyGoal,
                streakDays: userRes.data.streakDays
              }
            }
          })
        }
      })
    },
  })
}

// 页面显示时检查登录状态
onShow(() => {
  checkLoginStatus()
})

// 显示反馈建议弹窗
const showFeedbackDialog = () => {
  showDialog.value = true
  // 重置表单
  feedbackForm.value = {
    content: '',
    contact: ''
  }
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 处理输入
const handleInput = () => {
  // 可以在这里添加输入验证逻辑
}

// 提交反馈
const submitFeedback = () => {
  // 验证必填项
  if (!feedbackForm.value.content.trim()) {
    uni.showToast({
      title: '请输入反馈内容',
      icon: 'none'
    })
    return
  }
  
  // 调用反馈接口
  addFeedback(feedbackForm.value).then(res => {
    if (res.isSuccess) {
      uni.showToast({
        title: '提交成功，感谢您的反馈',
        icon: 'success'
      })
      
      // 关闭弹窗
      setTimeout(() => {
        closeDialog()
      }, 1500)
    } else {
      uni.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  })
}
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
        width: 230rpx;
        height: 230rpx;
        border-radius: 50%;
        background-color: #3a7afe;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20rpx;
        overflow: hidden;
        .avatar-text {
          font-size: 70rpx;
          font-weight: 600;
          color: #fff;
        }
      }
      .user-name {
        font-size: 45rpx;
        font-weight: 500;
        color: #1c2636;
        margin-bottom: 10rpx;
      }
      .user-desc {
        font-size: 28rpx;
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
		&:not(:last-child) {
			border-bottom: 1rpx solid #f0f0f0;
		}
		.setting-label {
			font-size: 28rpx;
			color: #364153;
		}
	}
	
	/* 反馈建议弹窗样式 */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
	
	.dialog-content {
		width: 80%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		
		.dialog-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;
			
			.dialog-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #364153;
			}
			
			.dialog-close {
				font-size: 40rpx;
				color: #9ca4b1;
				cursor: pointer;
			}
		}
		
		.dialog-body {
			padding: 30rpx;
			
			.form-item {
				margin-bottom: 30rpx;
				
				.form-label {
					display: block;
					font-size: 28rpx;
					color: #364153;
					margin-bottom: 10rpx;
				}
				
				.form-textarea {
					width: 98%;
					height: 200rpx;
          padding: 15rpx 0 15rpx 15rpx;
					border: 1rpx solid #e0e0e0;
					border-radius: 10rpx;
					font-size: 26rpx;
					color: #364153;
					resize: none;
				}
				
				.form-input {
					width: 98%;
					height: 80rpx;
          padding: 15rpx 0 15rpx 15rpx;
					border: 1rpx solid #e0e0e0;
					border-radius: 10rpx;
					font-size: 26rpx;
					color: #364153;
				}
			}
		}
		
		.dialog-footer {
			display: flex;
			padding: 30rpx;
			border-top: 1rpx solid #f0f0f0;
			gap: 20rpx;
			
			.dialog-button {
				flex: 1;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 10rpx;
				font-size: 28rpx;
				font-weight: 500;
				cursor: pointer;
				
				&.cancel {
					background-color: #f0f0f0;
					color: #364153;
				}
				
				&.confirm {
					background-color: #3a7afe;
					color: #fff;
					
					&.disabled {
						background-color: #e0e0e0;
						color: #9ca4b1;
						cursor: not-allowed;
					}
				}
			}
		}
	}
}
</style>
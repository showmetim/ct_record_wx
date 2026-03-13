<template>
  <view class="edit-page">
    <view class="form-container">
      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input type="text" v-model="formData.nickName" class="form-input" placeholder="请输入昵称" />
      </view>
      
      <!-- 个人签名 -->
      <view class="form-item">
        <text class="form-label">个人签名</text>
        <input type="text" v-model="formData.slogan" class="form-input" placeholder="请输入个人签名" />
      </view>
      
      <!-- 学习目标 -->
      <view class="form-item">
        <text class="form-label">学习目标</text>
        <input type="text" v-model="formData.studyGoal" class="form-input" placeholder="请输入学习目标" />
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <view class="cancel-btn" @click="handleCancel">取消</view>
      <view class="save-btn" @click="handleSave">保存</view>
    </view>
    
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserInfo, updateUserInfo } from '../../../api/user'

// 表单数据
const formData = ref({
  id: '',
  nickName: '',
  slogan: '',
  studyGoal: ''
})

// 页面加载时获取用户信息
onLoad(() => {
  const userId = uni.getStorageSync('userInfoId')
  if (userId) {
    // 调用接口获取最新用户信息
    getUserInfo(userId).then(res => {
      if (res.isSuccess) {
        formData.value = {
          id: res.data.id || '',
          nickName: res.data.nickName || '',
          slogan: res.data.slogan || '',
          studyGoal: res.data.studyGoal || ''
        }
      }
    })
  }
})

// 取消编辑
const handleCancel = () => {
  uni.navigateBack()
}

// 保存编辑
const handleSave = () => {
  // 验证表单
  if (!formData.value.nickName) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }
  
  const userId = uni.getStorageSync('userInfoId')
  if (userId) {
    // 调用接口更新用户信息
    updateUserInfo(formData.value).then(res => {
      if (res.isSuccess) {
        // 显示成功提示
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 跳转回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        // 显示错误提示
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
.edit-page {
  padding: 30rpx;
  height: 100vh;
  background-color: #f5f6f8;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  .form-container {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    flex: 1;
    .form-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 30rpx;
      &:last-child {
        margin-bottom: 0;
      }
      .form-label {
        font-size: 28rpx;
        color: #364153;
        margin-bottom: 15rpx;
      }
      .form-input {
        font-size: 28rpx;
        color: #1c2636;
        padding: 15rpx;
        border-radius: 10rpx;
        background-color: #fbfbfb;
      }
    }
  }
  
  .bottom-buttons {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    position: absolute;
    bottom: 70rpx;
    left: 60rpx;
    right: 30rpx;
    .cancel-btn {
      width: 35%;
      height: 80rpx;
      background-color: #f8f9fa;
      color: #364153;
      font-size: 28rpx;
      font-weight: 500;
      border-radius: 15rpx;
      border: 1rpx solid #c7c9ce;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .save-btn {
      width: 35%;
      height: 80rpx;
      background-color: #3a7afe;
      color: #fff;
      font-size: 28rpx;
      font-weight: 500;
      border-radius: 15rpx;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
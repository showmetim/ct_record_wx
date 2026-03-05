<template>
  <view class="my-page">
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar">
        <text class="avatar-text">学</text>
      </view>
      <text class="user-name">学习者</text>
      <text class="user-desc">持续进步，稳步前行</text>
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
        <text class="data-value">考研上岸</text>
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

<script>
export default {
  data() {
    return {
    }
  },
  onLoad() {},
  methods: {}
}
</script>

<style scoped lang="scss">
.my-page {
  padding: 50rpx 40rpx;
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50rpx;
    .avatar {
      width: 150rpx;
      height: 150rpx;
      border-radius: 50%;
      background-color: #3a7afe;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
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
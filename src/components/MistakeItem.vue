<template>
  <view class="mistake-item flex">
    <view class="mistake-image">
      <image mode="aspectFill" :src="image" alt="" />
    </view>
    <view class="mistake-content flex-1">
      <view class="mistake-top flex justify-between">
        <view class="category-tag" :style="{ backgroundColor: bgColor }">{{ category }}</view>
        <text class="time">{{ time }}</text>
      </view>
      <text class="mistake-text">{{ text }}</text>
      <text class="mistake-count">复习{{ errorCount }}次</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  errorCount: {
    type: Number,
    required: true
  }
})
</script>

<style scoped lang="scss">
.mistake-item {
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  gap: 30rpx;
  box-shadow: 0 0 8rpx rgba(0, 0, 0, 0.1);
  .mistake-image {
    width: 100rpx;
    height: 100rpx;
    border-radius: 10rpx;
    overflow: hidden;
    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .mistake-content {
    .mistake-top {
      margin-bottom: 10rpx;
      .category-tag {
              padding: 4rpx 12rpx;
              border-radius: 10rpx;
              font-size: 20rpx;
              color: #fff;
            }
      .time {
        font-size: 20rpx;
        color: #9ca4b1;
      }
    }
    .mistake-text {
      font-size: 24rpx;
      color: #364153;
      line-height: 1.4;
      margin-bottom: 10rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    .mistake-count {
      font-size: 23rpx;
      color: #364153;
    }
  }
}
</style>
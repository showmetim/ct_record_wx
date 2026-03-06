<template>
  <view class="mistake-item flex" @click="$emit('click')">
    <view class="mistake-image">
      <image mode="aspectFill" :src="image" alt="" class="mistake-image-img" />
    </view>
    <view class="mistake-content flex-1">
      <view class="mistake-top flex justify-between">
        <view class="category-tag" :style="{ backgroundColor: bgColor }">{{ category }}</view>
        <text class="time">{{ time }}</text>
      </view>
      <text class="mistake-text">{{ text }}</text>
      <view class="mistake-footer flex justify-between items-center">
        <text class="mistake-count">复习{{ errorCount }}次</text>
        <view class="status-tag" :class="status">
          {{ statusText }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

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
  },
  status: {
    type: String,
    default: 'pending', // pending: 待复习, reviewed: 已复习, mastered: 已掌握
    validator: (value) => {
      return ['pending', 'reviewed', 'mastered'].includes(value)
    }
  }
})

const emit = defineEmits(['click'])

// 根据状态值获取中文文本
const statusText = computed(() => {
  const statusMap = {
    pending: '待复习',
    reviewed: '已复习',
    mastered: '已掌握'
  }
  return statusMap[props.status] || '待复习'
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
    .mistake-image-img {
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
    .mistake-footer {
      margin-top: 10rpx;
    }
    .status-tag {
      border-radius: 10rpx;
      font-size: 20rpx;
      &.pending {
        color: #ff9500;
      }
      &.reviewed {
        color: #8b93fe;
      }
      &.mastered {
        color: #4cd964;
      }
    }
  }
}
</style>
<template>
  <view class="page">
    <view class="header">
      <text class="title">{{ title }}</text>
    </view>
    <view class="photo flex flex-column flex-center">
      <view class="photo-item flex flex-center" @click="toEditNotebook">
        <image src="/static/images/camera.png" alt="" />
      </view>
      <view class="photo-text">记录笔记</view>
    </view>
    <view >

    </view>
    
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '稳定发挥',
    }
  },
  onLoad() {},
  methods: {
    toEditNotebook() {
      uni.navigateTo({
        url: '/pages/notebook/edit/index',
      })
    }
  },
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  padding: 30rpx;
  .title {
    font-size: 38rpx;
    color: #1c2636;
    font-weight: 500;
  }
  .photo {
    padding: 50rpx 0 30rpx;
    gap: 30rpx;
    .photo-item {
      width: 300rpx;
      height: 300rpx;
      border-radius: 50%;
      background-color: #3a7afe;
      image {
        width: 100rpx;
        height: 100rpx;
      }
    }
    .photo-text {
      font-size: 30rpx;
      color: #364153;
      font-weight: 500;
    }

  }

}
</style>

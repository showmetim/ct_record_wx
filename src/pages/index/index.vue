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
    <view class="recent-mistakes">
      <view class="mistakes-header flex justify-between items-center">
        <text class="mistakes-title">最近错题</text>
        <text class="view-all">查看全部</text>
      </view>
      <view class="mistakes-list">
        <!-- 使用组件展示错题 -->
        <MistakeItem 
          v-for="(item, index) in mistakeList" 
          :key="index"
          :image="item.image"
          :category="item.category"
          :bg-color="item.bgColor"
          :time="item.time"
          :text="item.text"
          :error-count="item.errorCount"
        />
      </view>
    </view>
  </view>
</template>

<script>
import MistakeItem from '../../components/MistakeItem.vue'

export default {
  components: {
    MistakeItem
  },
  data() {
    return {
      title: '稳定发挥',
      mistakeList: [
        {
          image: '/static/images/note1.png',
          category: '数学',
          bgColor: '#3a7afe',
          time: '3天前',
          text: '设函数 f(x) 在区间 [a,b] 上连续，在 (a,b)...',
          errorCount: 2
        },
        {
          image: '/static/images/note1.png',
          category: '英语',
          bgColor: '#4cd964',
          time: '5天前',
          text: 'The phenomenon of global warming ha...',
          errorCount: 1
        },
        {
          image: '/static/images/note1.png',
          category: '政治',
          bgColor: '#ff9500',
          time: '1周前',
          text: '马克思主义哲学认为，实践是认识的基础，...',
          errorCount: 3
        }
      ]
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

  .recent-mistakes {
    margin-top: 30rpx;
    .mistakes-header {
      margin-bottom: 25rpx;
      .mistakes-title {
        font-size: 30rpx;
        color: #1c2636;
        font-weight: 500;
      }
      .view-all {
        font-size: 24rpx;
        color: #9ca4b1;
      }
    }
    .mistakes-list {
      /* 样式由组件内部管理 */
    }
  }

}
</style>

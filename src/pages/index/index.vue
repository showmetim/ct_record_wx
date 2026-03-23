<template>
  <view class="page">
    <view class="header">
      <text class="title">{{ title }}</text>
    </view>
    <view class="review-info">
      <text class="review-text">今日待复习{{ todayReview }}题</text>
    </view>
    <view class="photo flex flex-column flex-center">
      <view class="photo-item flex flex-center" @click="toEditNotebook">
        <image src="/static/images/camera.png" alt="" />
      </view>
      <view class="photo-text">拍照记录错题</view>
    </view>
    <view class="recent-mistakes">
      <view class="mistakes-header flex justify-between items-center">
        <text class="mistakes-title">最近错题</text>
        <text class="view-all" @click="toViewAll">查看全部</text>
      </view>
      <view class="mistakes-list">
        <!-- 使用组件展示错题 -->
        <MistakeItem 
          v-for="(item, index) in mistakeList" 
          :key="item.id"
          :image="item.image"
          :category="item.category"
          :bg-color="item.bgColor"
          :time="item.time"
          :content="item.content"
          :review-count="item.reviewCount"
          :status="item.status"
          @click="goToDetail(item.id)"
        />
        <!-- 无数据提示 -->
        <view v-if="mistakeList.length === 0" class="no-data">
          <text>没有更多数据了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow,onLoad,onShareAppMessage } from '@dcloudio/uni-app'
import MistakeItem from '../../components/MistakeItem.vue'
import { getNoteList, noteStats } from '../../api/note'

// 响应式变量
const title = ref('今天也要好好复习')
const mistakeList = ref([])
const todayReview = ref(0)

// 格式化时间
const formatTime = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '1天前'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`
  } else {
    return `${Math.floor(diffDays / 30)}个月前`
  }
}

// 跳转到编辑错题页面
const toEditNotebook = () => {
  uni.navigateTo({
    url: '/pages/notebook/edit/index',
  })
}

// 跳转到查看全部错题页面
const toViewAll = () => {
  uni.switchTab({
    url: '/pages/notebook/index',
  })
}
// 跳转到错题详情页面
const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/notebook/detail/index?id=${id}`,
  })
}

// 分享应用
onShareAppMessage(() => {
  return {
    title: '一款轻量的错题笔记本，快来试试吧！',
    path: '/pages/index/index'
  }
})

const fetchData = () => {
  if (!firstLoad.value) {
    return
  }
  // 获取统计数据
  noteStats().then(res => {
    if (res.isSuccess) {
      todayReview.value = res.data.todayReview
    }
  })
  
  // 获取错题列表
  getNoteList({ page: 1, pageSize: 3 }).then(res => {
    if (res.isSuccess) {
      const list = res.data.list
      // 转换数据格式
      mistakeList.value = list.map(item => ({
        id: item.id,
        image: item.images && item.images.length > 0 ? item.images[0].url : '/static/images/note1.png',
        category: item.category ? item.category.name : '未分类',
        bgColor: item.category ? item.category.color : '#3a7afe',
        time: formatTime(item.createdAt),
        content: item.content || '无内容概述',
        reviewCount: item.reviewCount || 0,
        status: item.status
      }))
    }
  })
}
const firstLoad = ref(false)
onLoad(() => {
  fetchData()
  firstLoad.value = true
})

// 页面加载时的逻辑
onShow(() => {
  fetchData()
})
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
    .review-info {
      margin-top: 5rpx;
      .review-text {
        font-size: 26rpx;
        color: #b3b9c3;
        font-weight: 500;
      }
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
      .no-data {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 60rpx 0;
        text {
          font-size: 26rpx;
          color: #9ca4b1;
        }
      }
    }
  }

}
</style>

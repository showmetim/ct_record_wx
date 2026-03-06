<template>
  <view class="notebook-page">
    <!-- 标题和Tab切换 -->
    <view class="page-header">
      <view class="tab-container">
        <view class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          全部
        </view>
        <view class="tab-item" :class="{ active: activeTab === 'today' }" @click="activeTab = 'today'">
          今日复习
          <view class="badge">3</view>
        </view>
      </view>
    </view>
    
    <!-- 搜索和筛选 -->
    <view class="search-container" v-if="activeTab === 'all'">
      <view class="search-box flex items-center">
        <input type="text" placeholder="错题搜索" class="search-input" />
      </view>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-container" v-if="activeTab === 'all'">
      <view class="stat-item">
        <text class="stat-number">156</text>
        <text class="stat-label">总习题</text>
      </view>
      <view class="stat-item">
        <text class="stat-number blue">12</text>
        <text class="stat-label">待复习</text>
      </view>
      <view class="stat-item">
        <text class="stat-number green">89</text>
        <text class="stat-label">已掌握</text>
      </view>
    </view>
    
    <!-- 错题列表 -->
    <view class="mistakes-container">
      <MistakeItem 
        v-for="(item, index) in filteredMistakes" 
        :key="index"
        :image="item.image"
        :category="item.category"
        :bg-color="item.bgColor"
        :time="item.time"
        :text="item.text"
        :error-count="item.errorCount"
        :status="item.status"
        @click="goToDetail(item.id)"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MistakeItem from '../../components/MistakeItem.vue'


// 响应式变量
const activeTab = ref('all')
const mistakeList = ref([
  {
    id: '1',
    image: '/static/images/note1.png',
    category: '数学',
    bgColor: '#3a7afe',
    time: '3天前',
    text: '设函数 f(x) 在区间 [a,b] 上连续，在 (a,b)...',
    errorCount: 2,
    status: 'pending'
  },
  {
    id: '2',
    image: '/static/images/note1.png',
    category: '英语',
    bgColor: '#4cd964',
    time: '5天前',
    text: 'The phenomenon of global warming ha...',
    errorCount: 1,
    status: 'reviewed'
  },
  {
    id: '3',
    image: '/static/images/note1.png',
    category: '政治',
    bgColor: '#ff9500',
    time: '1周前',
    text: '马克思主义哲学认为，实践是认识的基础，...',
    errorCount: 3,
    status: 'mastered'
  },
  {
    id: '4',
    image: '/static/images/note1.png',
    category: '数学',
    bgColor: '#3a7afe',
    time: '1周前',
    text: '求极限 lim(x→0) (sin x - x) / x³ 的值',
    errorCount: 1,
    status: 'pending'
  },
  {
    id: '5',
    image: '/static/images/note1.png',
    category: '专业课',
    bgColor: '#9c27b0',
    time: '2周前',
    text: '简述操作系统中进程和线程的区别，以及...',
    errorCount: 2,
    status: 'reviewed'
  }
])

// 点击错题项进入详情页
const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/notebook/detail/index?id=${id}`
  })
}

// 计算属性：根据当前tab过滤数据
const filteredMistakes = computed(() => {
  if (activeTab.value === 'today') {
    // 这里可以根据实际需求过滤今日需要复习的错题
    // 现在返回前3条作为示例
    return mistakeList.value.slice(0, 3)
  }
  return mistakeList.value
})

// 页面加载时的逻辑
onMounted(() => {
  // 可以在这里添加页面加载时的逻辑
})
</script>

<style scoped lang="scss">
.notebook-page {
  padding: 30rpx;
  min-height: 100vh;
  
  .page-header {
    margin-bottom: 30rpx;
    .page-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #1c2636;
      margin-bottom: 20rpx;
    }
    .tab-container {
      display: flex;
      border-radius: 10rpx;
      background-color: #f0f0f0;
      padding: 4rpx;
      .tab-item {
        flex: 1;
        text-align: center;
        padding: 12rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #666;
        transition: all 0.3s;
        position: relative;
        &.active {
          background-color: #fff;
          color: #3a7afe;
          font-weight: 600;
        }
        .badge {
          position: absolute;
          top: -8rpx;
          right: 20rpx;
          background-color: #ff3b30;
          color: #fff;
          font-size: 20rpx;
          font-weight: 600;
          padding: 2rpx 8rpx;
          border-radius: 10rpx;
          min-width: 24rpx;
          text-align: center;
        }
      }
    }
  }
  
  .search-container {
    margin-bottom: 30rpx;
    .search-box {
      border-radius: 15rpx;
      padding: 15rpx 20rpx;
			background-color: #f8f9fa;
      .search-icon {
        width: 24rpx;
        height: 24rpx;
        margin-right: 15rpx;
      }
      .search-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      .filter-icon {
        width: 24rpx;
        height: 24rpx;
        margin-left: 15rpx;
      }
    }
  }
  
  .stats-container {
    display: flex;
    justify-content: space-between;
    border-radius: 15rpx;
    margin-bottom: 30rpx;
		gap: 30rpx;
    .stat-item {
      flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
    	padding: 40rpx 30rpx;
			background-color: #f8f9fa;
			border-radius: 30rpx;

      .stat-number {
        font-size: 36rpx;
        font-weight: 600;
        color: #364153;
        margin-bottom: 10rpx;
        &.green {
          color: #4cd964;
        }
				&.blue {
					color: #8b93fe;
				}
      }
      .stat-label {
        font-size: 24rpx;
        color: #9ca4b1;
      }
    }
  }
}
</style>

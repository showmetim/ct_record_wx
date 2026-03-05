<template>
  <view class="notebook-page">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">笔记本</text>
    </view>
    
    <!-- 搜索和筛选 -->
    <view class="search-container">
      <view class="search-box flex items-center">
        <input type="text" placeholder="笔记搜索" class="search-input" />
      </view>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-container">
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
</template>

<script>
import MistakeItem from '../../components/MistakeItem.vue'

export default {
  components: {
    MistakeItem
  },
  data() {
    return {
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
        },
        {
          image: '/static/images/note1.png',
          category: '数学',
          bgColor: '#3a7afe',
          time: '1周前',
          text: '求极限 lim(x→0) (sin x - x) / x³ 的值',
          errorCount: 1
        },
        {
          image: '/static/images/note1.png',
          category: '专业课',
          bgColor: '#9c27b0',
          time: '2周前',
          text: '简述操作系统中进程和线程的区别，以及...',
          errorCount: 2
        }
      ]
    }
  },
  onLoad() {},
  methods: {}
}
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
  
  .mistakes-container {
    // 样式由组件内部管理
  }
}
</style>

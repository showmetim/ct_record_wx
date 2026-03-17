<template>
  <view class="notebook-page" @scrolltolower="onReachBottom">
    <!-- 标题和Tab切换 -->
    <view class="page-header">
      <view class="tab-container">
        <view class="tab-item" :class="{ active: activeTab === 'all' }" @click="switchTab('all')">
          全部
        </view>
        <view class="tab-item" :class="{ active: activeTab === 'today' }" @click="switchTab('today')">
          今日待复习
          <view class="badge">{{ todayReview }}</view>
        </view>
      </view>
    </view>
    
    <!-- 搜索和筛选 -->
    <view class="search-container" v-if="activeTab === 'all'">
      <view class="search-row flex items-center">
        <input 
          type="text" 
          placeholder="搜索内容或备注" 
          class="search-input" 
          v-model="keyword"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">
          <image src="/static/images/search_icon.png" mode="aspectFit" class="icon" />
        </view>
        <view class="category-btn" @click="toggleCategoryList">
          <image src="/static/images/classify_icon.png" mode="aspectFit" class="icon" />
        </view>
      </view>
      
      <!-- 分类tab -->
      <scroll-view v-if="showCategoryList" class="category-tabs" scroll-x="true" show-scrollbar="false">
        <view class="category-tab-list">
          <view 
            class="category-tab-item" 
            :class="{ active: selectedCategoryId === '' }" 
            @click="selectCategory('')"
          >
            全部
          </view>
          <view 
            v-for="category in categories" 
            :key="category.id"
            class="category-tab-item" 
            :class="{ active: selectedCategoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-container" v-if="activeTab === 'all'">
      <view class="stat-item" :class="{ active: activeStat === '' }" @click="handleStatClick('')">
        <text class="stat-number">{{ total }}</text>
        <text class="stat-label">总习题</text>
      </view>
      <view class="stat-item" :class="{ active: activeStat === 'LEARNING' }" @click="handleStatClick('LEARNING')">
        <text class="stat-number blue">{{ learning }}</text>
        <text class="stat-label">复习中</text>
      </view>
      <view class="stat-item" :class="{ active: activeStat === 'MASTERED' }" @click="handleStatClick('MASTERED')">
        <text class="stat-number green">{{ mastered }}</text>
        <text class="stat-label">已掌握</text>
      </view>
    </view>
    
    <!-- 错题列表 -->
    <scroll-view 
      class="mistakes-container" 
      scroll-y="true" 
      @scrolltolower="onReachBottom"
    >
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
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="load-more" v-else-if="finished">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import MistakeItem from '../../components/MistakeItem.vue'
import { getNoteList, noteStats } from '../../api/note'
import { getCategoryList } from '../../api/category'

onShareAppMessage(() => {
  return {
    title: '一款轻量的错题笔记本，快来试试吧！',
    path: '/pages/notebook/index'
  }
})

// 响应式变量
const activeTab = ref('all')
const mistakeList = ref([])
const total = ref(0)
const learning = ref(0)
const mastered = ref(0)
const todayReview = ref(0)
const progress = ref(0)
const keyword = ref('')
const status = ref('')
const reviewToday = ref(false)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const finished = ref(false)
const activeStat = ref('')
// 分类相关
const categories = ref([])
const showCategoryList = ref(false)
const selectedCategoryId = ref('')

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time.replace(/-/g, '/'))
  const diff = Date.now() - date.getTime()
  const times = [
    { unit: '年', value: 365 * 24 * 60 * 60 * 1000 },
    { unit: '个月', value: 30 * 24 * 60 * 60 * 1000 },
    { unit: '周', value: 7 * 24 * 60 * 60 * 1000 },
    { unit: '天', value: 24 * 60 * 60 * 1000 },
    { unit: '小时', value: 60 * 60 * 1000 },
    { unit: '分钟', value: 60 * 1000 }
  ]
  for (const t of times) {
    const num = Math.floor(diff / t.value)
    if (num > 0) return `${num}${t.unit}前`
  }

  return '刚刚'
}

// 点击错题项进入详情页
const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/notebook/detail/index?id=${id}`
  })
}

// 获取统计数据
const getStats = () => {
  noteStats({
    categoryId: selectedCategoryId.value
  }).then(res => {
    if (res.isSuccess) {
      total.value = res.data.total
      learning.value = res.data.learning
      mastered.value = res.data.mastered
      todayReview.value = res.data.todayReview
      progress.value = res.data.progress
    }
  })
}

// 获取错题列表
const getMistakes = (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  
  const params = {
    page: isLoadMore ? page.value : 1,
    pageSize: pageSize.value,
    keyword: keyword.value,
    status: status.value,
    reviewToday: reviewToday.value,
    categoryId: selectedCategoryId.value
  }
  
  getNoteList(params).then(res => {
    if (res.isSuccess) {
      const list = res.data.list
      // 转换数据格式
      const transformedList = list.map(item => ({
        id: item.id,
        image: item.images && item.images.length > 0 ? item.images[0].url : '/static/images/note1.png',
        category: item.category ? item.category.name : '未分类',
        bgColor: item.category ? item.category.color : '#3a7afe',
        time: formatTime(item.createdAt),
        content: item.content || '无内容概述',
        reviewCount: item.reviewCount || 0,
        status: item.status
      }))
      
      if (isLoadMore) {
        mistakeList.value = [...mistakeList.value, ...transformedList]
      } else {
        mistakeList.value = transformedList
      }
      
      // 判断是否还有更多数据
      if (list.length < pageSize.value) {
        finished.value = true
      } else {
        page.value++
      }
    }
    loading.value = false
  })
}

// 切换tab
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'today') {
    reviewToday.value = true
    status.value = ''
    keyword.value = ''
    activeStat.value = ''
    selectedCategoryId.value = ''
  } else {
    reviewToday.value = false
  }
  // 重置参数
  page.value = 1
  finished.value = false
  // 隐藏分类列表
  showCategoryList.value = false
  // 获取数据
  getMistakes()
}

// 点击统计项
const handleStatClick = (statStatus) => {
  status.value = statStatus
  activeStat.value = statStatus
  // 重置参数
  page.value = 1
  finished.value = false
  // 获取数据
  getMistakes()
}

// 切换分类列表显示/隐藏
const toggleCategoryList = () => {
  showCategoryList.value = !showCategoryList.value
  // 如果要显示分类列表，先获取分类数据
  if (showCategoryList.value) {
    getCategories()
  }
}

// 选择分类
const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId
  // 重置参数
  page.value = 1
  finished.value = false
  // 获取数据
  getMistakes()
  // 获取统计数据
  getStats()
}

// 获取分类列表
const getCategories = () => {
  getCategoryList().then(res => {
    if (res.isSuccess) {
      categories.value = res.data
    }
  })
}

// 搜索
const handleSearch = () => {
  // 重置参数
  page.value = 1
  finished.value = false
  // 隐藏分类列表
  showCategoryList.value = false
  // 获取数据
  getMistakes()
}

// 上拉加载
const onReachBottom = () => {
  if (!finished.value) {
    getMistakes(true)
  }
}

// 页面加载时的逻辑
onShow(() => {
  // 获取统计数据
  getStats()
  // 获取分类列表
  getCategories()
  // 获取错题列表
  getMistakes()
})
</script>

<style scoped lang="scss">
.notebook-page {
  padding: 30rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
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
    .search-row {
      display: flex;
      align-items: center;
      gap: 15rpx;
      
      .search-input {
        flex: 1;
        border-radius: 15rpx;
        padding: 15rpx 20rpx;
        font-size: 28rpx;
        color: #333;
        border: none;
        outline: none;
        background-color: #f8f9fa;
      }
      
      .category-btn, .search-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 15rpx;
        background-color: #f8f9fa;
        border-radius: 15rpx;
        
        .icon {
          width: 36rpx;
          height: 36rpx;
        }
      }
    }
    
    .category-tabs {
      margin-top: 15rpx;
      width: 100%;
      white-space: nowrap;
      
      .category-tab-list {
        display: flex;
        gap: 15rpx;
        padding-bottom: 10rpx;
        
        .category-tab-item {
          padding: 10rpx 20rpx;
          font-size: 26rpx;
          color: #666;
          background-color: #f0f0f0;
          border-radius: 20rpx;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
          
          &:hover {
            background-color: #e0e0e0;
          }
          
          &.active {
            background-color: #3a7afe;
            color: #fff;
          }
        }
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
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        background-color: #e9ecef;
      }
      &.active {
        background-color: #3a7afe;
        .stat-number {
          color: #fff !important;
        }
        .stat-label {
          color: #fff;
        }
      }

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
    flex: 1;
    overflow-y: auto;
    .load-more {
      text-align: center;
      padding: 30rpx 0;
      font-size: 24rpx;
      color: #9ca4b1;
    }
  }
}
</style>

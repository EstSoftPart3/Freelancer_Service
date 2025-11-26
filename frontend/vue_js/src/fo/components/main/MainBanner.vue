<template>
  <!-- 광고 배너 -->
    <section class="banner-carousel-section">
      <div class="carousel-wrapper">
      
        <!-- 왼쪽 버튼 -->  
        <button 
          v-if="banners.length > 1"
          class="carousel-arrow left-arrow" 
          @click="goToPrevSlide" 
          aria-label="이전 배너"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <!-- 슬라이드 -->
        <div class="carousel-track">

          <!-- 슬라이드 1: 캘린더 배너 -->
          <div 
            v-for="(banner, index) in banners"  
            :key="index"
            class="carousel-slide" 
            :class="{ 
              'active': currentSlideIndex === index,
              [banner.slideClass]: banner.slideClass 
            }"
          >
            <img
              v-if="banner.type === 'image'"
              :src="banner.imagePath"
              :alt="banner.alt"
              class="banner-image"
            >

            <!-- 커스텀 컨텐츠 배너 -->
            <template v-else-if="banner.type === 'custom'">
              <component :is="banner.component" v-bind="banner.props"/>
            </template>

            <!-- 텍스트 + 버튼 타입 배너 -->
            <template v-else-if="banner.type === 'text'">
              <div class="left-text-area">
                <h1 class="hero-title" v-html="banner.title"></h1>
                <p class="hero-subtitle">{{  banner.subtitle }}</p>
                <button
                  v-if="banner.button"
                  class="btn btn-rounded btn-primary btn-lg"
                  @click="handleBannerAction(banner.button.action)"
                >
                  {{ banner.button.text }}
                </button>
              </div>
            </template>
          </div>  
        </div>

        
        <!-- 우측 버튼 -->
        <button 
          v-if="banners.length > 1"
          class="carousel-arrow right-arrow" 
          @click="goToNextSlide" 
          aria-label="다음 배너"
        >
          <i class="bi bi-chevron-right"></i>
        </button>

        <!-- 인디케이터 점 -->
        <div v-if="banners.length > 1" class="carousel-dots">
          <button 
            v-for="(banner, index) in banners"
            :key="index"
            class="dot" 
            :class="{ 
              'active': currentSlideIndex === index,
              'dot-dark': banners[currentSlideIndex].dotColor === 'skyBlue'
            }" 
            @click="jumpToSlide(index)"
            :aria-label="`${index+1}번째 배너`"
          ></button>
        </div>
      </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';


// 이벤트 정의
const emit = defineEmits(['scroll-to-map']);

// 배너 설정 - 여기서 배너 추가/삭제 가능
const banners = ref([
  {
    type: 'image',
    imagePath: new URL('@/assets/main-calendar.png', import.meta.url).href,
    alt: '캘린더 배너',
    slideClass: '',
    dotColor: 'white'
  },
  {
    type: 'text',
    title: '나와 가까운 일자리<br>지금 바로 찾아드릴게요.',
    subtitle: '내 위치 반경을 설정해 빠르게 찾기',
    button: {
      text: '내 주변 공고',
      action: 'scroll-to-map'
    },
    slideClass: 'map-slide-white',
    dotColor: 'skyBlue'
  },
  {
    type: 'image',
    imagePath: new URL('@/assets/main-map.png', import.meta.url).href,
    alt: '맵',
    slideClass: '',
    dotColor: 'skyBlue'
  },
  {
    type: 'text',
    title: '새로운 프로모션 출시<br> 지금 당장 확인하세요.',
    subtitle: '수수료 할인 특가 진행 중',
    button: {
      text: '자세히 보기',
      action: 'show-promotion'
    },
    slideClass: 'promotion-slide center-layout',
    dotColor: 'skyBlue'
  }
]);


// 캐러셀 상태
const currentSlideIndex = ref(0);
const autoPlayInterval = ref(null);

// 캐러셀 함수들
const goToNextSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % banners.value.length;
};

const goToPrevSlide = () => {
  currentSlideIndex.value = currentSlideIndex.value === 0 
    ? banners.value.length - 1
    : currentSlideIndex.value - 1;
};

const jumpToSlide = (index) => {
  currentSlideIndex.value = index;
};

// 배너 액션 핸들러
const handleBannerAction = (action) => {
  emit('banner-action', action);
};

// 자동 재생
const startAutoPlay = () => {
  if (banners.value.length <= 1) return;
  autoPlayInterval.value = setInterval(() => {
    goToNextSlide();
  }, 10000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
  }
};

// 컴포넌트 마운트
onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

</script>

<style scoped>

.btn-rounded {
  border-radius: 6px;
}

/* 캐러셀 배너 */
.banner-carousel-section {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  margin-bottom: 0;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 65vh;
  overflow: hidden;
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.6s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
  visibility: visible;
  z-index: 1;
}

.banner-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 지도 슬라이드 흰 배경 */
.map-slide-white {
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 140px;
}

/* 왼쪽 텍스트 영역 */
.left-text-area {
  flex: 0 0 auto;
  z-index: 5;
  max-width: 600px;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: none;
  border: none;
  color: lightblue;
  font-size: 50px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.carousel-arrow:hover {
  color: skyblue; 
  transform: translateY(-50%) scale(1.2);
}

.left-arrow {
  left: 30px;
}

.right-arrow {
  right: 30px;
}

.carousel-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 12px;
}

.carousel-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-dots .dot.active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

.carousel-dots .dot.dot-dark {
  border-color: skyblue;
}

.carousel-dots .dot.dot-dark.active {
  background: skyblue;
}

.center-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

@media (max-width: 768px) {
  .carousel-wrapper {
    height: auto;
    min-height: 300px;
    aspect-ratio: 16 / 9;
  }

  .banner-image {
    object-fit: contain;
    background-color: #f8f9fa;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .left-arrow {
    left: 15px;
  }

  .right-arrow {
    right: 15px;
  }

  .map-slide-white {
    padding: 40px 20px;
  }

  .left-text-area {
    max-width: 100%;}

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .carousel-wrapper {
    aspect-ratio: 4 / 3;  
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .carousel-wrapper {
    height: 60vh;
    min-height: 400px;
  }
}
</style>
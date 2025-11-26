<template>
  <section class="FAQ-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="faq-header text-center mb-5">
            <h2>자주 묻는 질문</h2>
            <p class="text-muted">궁금한 점은 FAQ를 확인해 보세요.</p>
          </div>

          <div class="accordion" id="faqAccordion">
            <div
              v-for="(faq, index) in faqList"
              :key="index"
              class="accordion-item"
            >
              <h2 class="accordion-header" :id="`heading${index}`">
                <button
                  class="accordion-button"
                  :class="{ collapsed: activeFaq !== index }"
                  type="button"
                  @click="toggleFaq(index)"
                >
                  {{ faq.question }}
                </button>
              </h2>
              <transition name="slide">
                <div
                  v-show="activeFaq === index"
                  class="accordion-collapse"
                >
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const faqList = ref([
  {
    question: '프리랜서로 등록하려면 어떻게 해야 하나요?',
    answer: '회원가입 후 프로필을 작성하고 포트폴리오를 등록하시면 됩니다. 검증 과정을 거쳐 승인되면 프리랜서로 활동할 수 있습니다.'
  },
  {
    question: '프로젝트 등록 비용이 있나요?',
    answer: '프로젝트 등록은 무료입니다. 성공적인 매칭 후에만 수수료가 발생합니다.'
  },
  {
    question: '거래는 어떻게 진행되나요?',
    answer: '안전한 거래를 위해 에스크로 시스템을 제공합니다. 프로젝트 완료 후 결제가 진행됩니다.'
  },
  {
    question: '분쟁이 발생하면 어떻게 해결하나요?',
    answer: '전담 고객지원팀이 중재하여 공정하게 해결해드립니다.'
  },
  {
    question: '수수료는 얼마인가요?',
    answer: '프로젝트 성공 시 거래 금액의 5% 수수료가 발생합니다.'
  }
]);

const activeFaq = ref(null);

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
}
</script>

<style scoped>
.faq-section {
  padding: 80px 0;
  padding-top: 100px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.faq-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.faq-header p {
  font-size: 1.125rem;
}

.accordion-item {
  border: 1px solid #e9ecef;
  border-radius: 10px !important;
  margin-bottom: 1rem;
  overflow: hidden;
}

.accordion-button {
  background: #f9fcff;
  border: none;
  font-weight: 600;
  color: #1976d2;
  padding: 1.5rem;
  padding-right: 3rem;
  font-size: 1.25rem;
  width: 100%;
  text-align: left;
  cursor: pointer;
  position: relative;
}

.accordion-button:not(.collapsed) {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: none;
}

.accordion-button::after {
  all: unset;
  content: '';
  position: absolute;
  right: 1.5rem;
  top: 50%;
  margin-top: -0.375rem;
  width: 0.75rem;
  height: 0.75rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  /* transition: transform 0.4s ease; */
}

.accordion-button.collapsed::after {
  transform: rotate(45deg);
}

.accordion-button:not(.collapsed)::after {
  transform: rotate(225deg);
}


.accordion-button:focus {
  outline: none;
  box-shadow: none;
  border: none;
}

.accordion-collapse {
  overflow: hidden;
}

.accordion-body {
  padding: 1.5rem;
  background: #f8f9fa;
  color: #666;
  line-height: 1.8;
  font-size: 1.125rem;
  font-weight: 500;
}

/* 슬라이드 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}

@media (max-width: 768px) {
  .faq-header h2 {
    font-size: 2rem;
  }

  .accordion-button {
    font-size: 1.1rem;
    padding: 1.25rem;
    padding-right: 2.5rem;
  }

  .accordion-body {
    font-size: 1rem;
    padding: 1.25rem;
  }
}

@media (max-width: 576px) {
  .faq-section {
    padding: 60px 0;
    padding-top: 80px;
  }
  
  .faq-header h2 {
    font-size: 1.75rem;
  }

  .accordion-button {
    font-size: 1rem;
  }

  .accordion-body {
    font-size: 1rem;
  }
}

</style>
<template>
  <div
    ref="containerRef"
    class="mt-2 d-flex justify-content-start flex-wrap gap-1"
  >
    <span
      v-for="(tagInfo, index) in visibleTags"
      :key="index"
      ref="tagRefs"
      class="btn btn-rounded btn-3d py-0 px-2 tag-btn d-flex align-items-center"
      :class="tagInfo.type === 'skill' ? 'btn-primary' : 'btn-light'"
      @click="clickTag(tagInfo)"
    >
      <img
        v-if="tagInfo.type === 'skill'"
        :src="getSkillIcon(tagInfo.tag_nm.skillTagNm)"
        class="skill-icon-sm"
      />

      {{
        tagInfo.type === 'skill'
          ? tagInfo.tag_nm.skillTagNm
          : '#' + tagInfo.tag_nm
      }}
    </span>

    <button
      v-if="hiddenCount > 0"
      class="more-tag btn btn-light btn-rounded btn-3d py-0 px-2 tag-btn"
      @click="clickHiddenToggle"
    >
      {{ buttonMsg }}
    </button>
  </div>
</template>

<script setup>
import { nextTick, ref, defineProps, defineEmits, onMounted, watch } from 'vue'
import skillIconMap from '@/assets/skillIconMap.js'

const props = defineProps({
  skillTags: {
    type: Array,
    required: true,
    default: () => [],
  },
  normalTags: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['click-tag'])

const totalTags = ref([])
const containerRef = ref(null)
const tagRefs = ref([])
const visibleTags = ref([])
const hiddenCount = ref(0)
const buttonMsg = ref('')

const clickTag = (tagInfo) => {
  const tag = tagInfo.tag_nm
  const tagName = tagInfo.type === 'skill' ? tag.skillTagNm : tag

  emit('click-tag', {
    type: tagInfo.type,
    name: tagName,
    skillTagSq: tagInfo.type === 'skill' ? tag.skillTagSq : null,
  })
}

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}
// 태그 리스트 통합 생성
const initTags = () => {
  const combined = []
  props.skillTags.forEach((el) => combined.push({ type: 'skill', tag_nm: el }))
  props.normalTags.forEach((el) =>
    combined.push({ type: 'normal', tag_nm: el }),
  )
  totalTags.value = combined
  // 초기 로드 시에는 전체를 보여준 뒤 계산에 들어갑니다.
  visibleTags.value = combined
}

const calculateVisibleTags = async () => {
  await nextTick()

  const containerWidth = containerRef.value?.offsetWidth || 0
  let totalWidth = 0
  let count = 0

  for (let i = 0; i < totalTags.value.length; i++) {
    const tagEl = tagRefs.value[i]
    if (!tagEl) continue

    totalWidth += tagEl.offsetWidth + 4 // margin or spacing
    if (totalWidth > containerWidth - 40) break
    count++
  }

  visibleTags.value = totalTags.value.slice(0, count)
  hiddenCount.value = totalTags.value.length - count
  buttonMsg.value = `+${hiddenCount.value}`
}

const clickHiddenToggle = () => {
  if (buttonMsg.value == '접기') {
    calculateVisibleTags()
  } else {
    buttonMsg.value = '접기'
    visibleTags.value = totalTags.value
  }
}

onMounted(() => {
  initTags()
  calculateVisibleTags()
  window.addEventListener('resize', calculateVisibleTags)
})

watch(
  () => [props.skillTags, props.normalTags],
  () => {
    initTags()
    calculateVisibleTags()
  },
  { deep: true },
)
</script>

<style scoped>
.tag-btn {
  font-size: 11px;
  height: 22px;
  white-space: nowrap;
  cursor: pointer;
}
.skill-icon-sm {
  width: 12px;
  height: 12px;
  margin-right: 4px;
}
button:focus {
  outline: none;
  box-shadow: none;
}
</style>

<template>
  <div class="d-flex gap-2 flex-wrap">
    <div
      v-for="skill in selectedSkills"
      :key="skill.name"
      class="btn btn-rounded btn-light d-flex align-items-center gap-2 mb-2 btn-3d position-relative"
      style="padding-right: 24px"
    >
      <img
        :src="generateIconUrl(skill.name || skill)"
        :alt="skill.name || skill"
        width="20"
        height="20"
      />
      <span>{{ skill.name || skill }}</span>
      <a
        href="#"
        @click.prevent="deleteSkill(skill.name || skill)"
        class="position-absolute end-0 me-2 text-grey text-decoration-none"
        style="top: 50%; transform: translateY(-50%)"
        title="삭제"
      >
        ×
      </a>
    </div>
  </div>
</template>

<script>
import skillIconMap from '@/assets/skillIconMap.js'
export default {
  props: {
    selectedSkills: {
      type: Array,
      required: true,
    },
  },
  emits: ['remove'],
  methods: {
    deleteSkill(name) {
      this.$emit('remove', name)
    },
    generateIconUrl(name) {
      const key = name.toLowerCase().replace(/[\s.]+/g, '')
      return skillIconMap[key] || skillIconMap.default
    },
  },
}
</script>

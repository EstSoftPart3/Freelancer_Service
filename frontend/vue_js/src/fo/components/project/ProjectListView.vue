<template>
  <div>
    <ProjectCardGroup
      :v-if="projects && projects.length > 0"
      :projects="projects"
      :isSimple="false"
    />
  </div>
</template>

<script setup>
import ProjectCardGroup from './ProjectCardGroup.vue'
defineProps(['projects'])
</script>

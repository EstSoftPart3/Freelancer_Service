<template>
  <div>
    <ProjectCardGroup :projects="projects" :isSimple="false" />
  </div>
</template>

<script setup>
import ProjectCardGroup from './ProjectCardGroup.vue'
defineProps(['projects'])
</script>

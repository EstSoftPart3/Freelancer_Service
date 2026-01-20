<template>
  <div class="map-view-layout">
    <div class="map-area">
      <div
        v-show="mapImageUrl"
        id="naver-map"
        style="width: 100%; height: 100%; background: #eee"
      >
        <img
          :src="mapImageUrl"
          alt="네이버 정적 지도"
          style="width: 100%; height: auto"
        />
      </div>
      <div v-show="!mapImageUrl" class="empty-map">
        <p>표시할 프로젝트 위치가 없습니다.</p>
      </div>
    </div>

    <div class="list-area">
      <ProjectCardGroup
        v-if="projects && projects.length > 0"
        :projects="projects"
        :isSimple="true"
      />
    </div>
  </div>
</template>

<script setup>
import ProjectCardGroup from './ProjectCardGroup.vue'
import { computed } from 'vue'
const props = defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
})

import { onMounted, onUpdated } from 'vue'

onMounted(() => {
  console.log('all data :', props.projects)
  if (props.projects && props.projects.length > 0) {
    console.log('data structure :', props.projects[0])
  }
})

onUpdated(() => {
  console.log('Updated data:', props.projects)
})

const mapImageUrl = computed(() => {
  if (!props.projects || props.projects.length === 0) return null
  const latitudes = props.projects
    .map((p) => p.latitude)
    .filter((latitude) => latitude)
    .join(',')
  const longitudes = props.projects
    .map((p) => p.longitude)
    .filter((longitude) => longitude)
    .join(',')
  if (!latitudes || !longitudes) return null
  return `http://localhost:8080/api/map/multi-static?longitudes=${longitudes}&latitudes=${latitudes}`
})
</script>

<style scoped>
.map-view-layout {
  display: flex;
  height: 500px;
  border: 1px solid #ddd;
}
.map-area {
  flex: 1;
}
.list-area {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}
</style>

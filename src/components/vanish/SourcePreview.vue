<script setup lang="ts">
import type { DemoSource, SourceSize } from '../../types/vanish'

defineProps<{
  source: DemoSource
  size: SourceSize
}>()

const emit = defineEmits<{
  ready: []
}>()
</script>

<template>
  <div
    class="source-preview"
    :style="{ width: `${size.width}px`, height: `${size.height}px` }"
  >
    <article v-if="source === 'card'" class="course-card">
      <div class="course-copy">
        <strong class="course-title">Calculus</strong>
        <span class="course-time">08:00-09:35</span>
        <span class="course-meta">Science Building A203</span>
        <span class="course-meta">Prof. Wang</span>
      </div>
      <span class="course-badge">2</span>
    </article>

    <img
      v-else
      class="portrait"
      src="/demo-portrait.png"
      alt="Original fictional editorial portrait"
      @load="emit('ready')"
    />
  </div>
</template>

<style scoped>
.source-preview {
  position: relative;
}

.course-card,
.portrait {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  box-shadow: 0 13px 25px rgba(0, 0, 0, 0.28);
}

.course-card {
  position: relative;
  overflow: hidden;
  color: #f9fbff;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.16), transparent 48%),
    linear-gradient(145deg, #347ee8 0%, #4b94ef 100%);
}

.course-copy {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 14px;
  font-family: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", sans-serif;
}

.course-title {
  margin-bottom: 6px;
  font-size: 19px;
  line-height: 1;
}

.course-time {
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.92;
}

.course-meta {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  opacity: 0.82;
}

.course-badge {
  position: absolute;
  top: 9px;
  right: 9px;
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  font-size: 11px;
  font-weight: 800;
}

.portrait {
  display: block;
  object-fit: cover;
}
</style>

<script setup lang="ts">
import {
  PhArrowCounterClockwise as ArrowCounterClockwise,
  PhWind as Wind,
} from '@phosphor-icons/vue'
import ControlSlider from './ControlSlider.vue'

const props = defineProps<{
  progress: number
  duration: number
  labels: {
    disintegrate: string
    reassemble: string
    progress: string
    duration: string
  }
}>()

const emit = defineEmits<{
  disintegrate: []
  reassemble: []
  updateProgress: [value: number]
  updateDuration: [value: number]
}>()

const updateProgress = (value: number | undefined) => {
  if (value !== undefined) emit('updateProgress', value)
}

const updateDuration = (value: number | undefined) => {
  if (value !== undefined) emit('updateDuration', value)
}
</script>

<template>
  <section class="panel transport-panel">
    <div class="transport-actions">
      <button class="action-button primary" type="button" @click="emit('disintegrate')">
        <Wind :size="18" weight="bold" />
        {{ labels.disintegrate }}
      </button>
      <button class="action-button secondary" type="button" @click="emit('reassemble')">
        <ArrowCounterClockwise :size="18" weight="bold" />
        {{ labels.reassemble }}
      </button>
    </div>

    <ControlSlider
      :model-value="props.progress"
      :label="labels.progress"
      :min="0"
      :max="1"
      :step="0.01"
      @update:model-value="updateProgress"
    />
    <ControlSlider
      :model-value="props.duration"
      :label="labels.duration"
      :min="0.25"
      :max="2.5"
      :step="0.05"
      suffix="s"
      @update:model-value="updateDuration"
    />
  </section>
</template>

<style scoped>
.transport-panel {
  display: grid;
  gap: 18px;
}

.transport-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.action-button:active {
  transform: scale(0.98);
}

.primary {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #f7fbff;
}

.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.secondary {
  border: 1px solid var(--border-strong);
  background: var(--input-bg);
  color: var(--text-primary);
}

.secondary:hover {
  border-color: var(--text-tertiary);
  background: var(--surface-raised);
}
</style>

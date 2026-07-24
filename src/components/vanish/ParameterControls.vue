<script setup lang="ts">
import { PhDiceFive as DiceFive } from '@phosphor-icons/vue'
import type {
  SourceSize,
  VanishConfiguration,
} from '../../types/vanish'
import ControlSlider from './ControlSlider.vue'

defineProps<{
  configuration: VanishConfiguration
  sourceSize: SourceSize
  labels: Record<string, string>
}>()

const emit = defineEmits<{
  updateConfiguration: [key: keyof VanishConfiguration, value: number]
  updateSourceSize: [key: keyof SourceSize, value: number]
  randomizeSeed: []
}>()

const updateConfiguration = (
  key: keyof VanishConfiguration,
  value: number | undefined,
) => {
  if (value !== undefined) emit('updateConfiguration', key, value)
}

const updateSourceSize = (
  key: keyof SourceSize,
  value: number | undefined,
) => {
  if (value !== undefined) emit('updateSourceSize', key, value)
}
</script>

<template>
  <section class="panel parameter-panel">
    <div class="control-group">
      <h2 class="group-title">{{ labels.sourceSize }}</h2>
      <ControlSlider
        :model-value="sourceSize.width"
        :label="labels.sourceWidth"
        :min="80"
        :max="280"
        :step="1"
        suffix="px"
        @update:model-value="updateSourceSize('width', $event)"
      />
      <ControlSlider
        :model-value="sourceSize.height"
        :label="labels.sourceHeight"
        :min="52"
        :max="180"
        :step="1"
        suffix="px"
        @update:model-value="updateSourceSize('height', $event)"
      />
    </div>

    <div class="control-group">
      <h2 class="group-title">{{ labels.particles }}</h2>
      <ControlSlider
        :model-value="configuration.particleSize"
        :label="labels.particleSize"
        :min="0.5"
        :max="8"
        :step="0.1"
        suffix="px"
        @update:model-value="updateConfiguration('particleSize', $event)"
      />
      <ControlSlider
        :model-value="configuration.endScale"
        :label="labels.endScale"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateConfiguration('endScale', $event)"
      />
      <ControlSlider
        :model-value="configuration.rotation"
        :label="labels.rotation"
        :min="0"
        :max="720"
        :step="1"
        suffix="°"
        @update:model-value="updateConfiguration('rotation', $event)"
      />
    </div>

    <div class="control-group">
      <h2 class="group-title">{{ labels.motion }}</h2>
      <ControlSlider
        :model-value="configuration.direction"
        :label="labels.direction"
        :min="-180"
        :max="180"
        :step="1"
        suffix="°"
        @update:model-value="updateConfiguration('direction', $event)"
      />
      <ControlSlider
        :model-value="configuration.directionSpread"
        :label="labels.directionSpread"
        :min="0"
        :max="180"
        :step="1"
        suffix="°"
        @update:model-value="updateConfiguration('directionSpread', $event)"
      />
      <ControlSlider
        :model-value="configuration.travelDistance"
        :label="labels.travelDistance"
        :min="0"
        :max="180"
        :step="1"
        suffix="px"
        @update:model-value="updateConfiguration('travelDistance', $event)"
      />
      <ControlSlider
        :model-value="configuration.travelVariation"
        :label="labels.travelVariation"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateConfiguration('travelVariation', $event)"
      />
      <ControlSlider
        :model-value="configuration.gravity"
        :label="labels.gravity"
        :min="-120"
        :max="160"
        :step="1"
        suffix="px"
        @update:model-value="updateConfiguration('gravity', $event)"
      />
      <ControlSlider
        :model-value="configuration.turbulence"
        :label="labels.turbulence"
        :min="0"
        :max="120"
        :step="1"
        suffix="px"
        @update:model-value="updateConfiguration('turbulence', $event)"
      />
    </div>

    <div class="control-group timing-group">
      <h2 class="group-title">{{ labels.timing }}</h2>
      <ControlSlider
        :model-value="configuration.stagger"
        :label="labels.stagger"
        :min="0"
        :max="0.85"
        :step="0.01"
        @update:model-value="updateConfiguration('stagger', $event)"
      />
      <ControlSlider
        :model-value="configuration.waveDirection"
        :label="labels.waveDirection"
        :min="-180"
        :max="180"
        :step="1"
        suffix="°"
        @update:model-value="updateConfiguration('waveDirection', $event)"
      />

      <div class="seed-row">
        <label class="seed-label" for="seed-input">{{ labels.seed }}</label>
        <input
          id="seed-input"
          class="seed-input"
          type="number"
          min="0"
          max="9999"
          :value="configuration.seed"
          @input="updateConfiguration(
            'seed',
            Number(($event.target as HTMLInputElement).value),
          )"
        />
        <button class="random-button" type="button" @click="emit('randomizeSeed')">
          <DiceFive :size="17" weight="bold" />
          {{ labels.randomize }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.parameter-panel {
  display: grid;
  gap: 0;
  padding-block: 4px;
}

.control-group {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.control-group:last-child {
  border-bottom: 0;
}

.group-title {
  margin: 0 0 1px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.seed-row {
  display: grid;
  grid-template-columns: 1fr 72px auto;
  align-items: center;
  gap: 9px;
}

.seed-label {
  font-size: 13px;
  font-weight: 560;
}

.seed-input {
  min-width: 0;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: 600 12px/1 var(--font-mono);
  padding: 8px;
  text-align: right;
}

.random-button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-strong);
  border-radius: 9px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
  padding: 0 11px;
}

.random-button:active {
  transform: scale(0.98);
}
</style>

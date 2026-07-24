<script setup lang="ts">
const model = defineModel<number>({ required: true })

defineProps<{
  label: string
  min: number
  max: number
  step: number
  suffix?: string
}>()
</script>

<template>
  <label class="control-slider">
    <span class="control-topline">
      <span class="control-label">{{ label }}</span>
      <span class="value-wrap">
        <input
          v-model.number="model"
          class="value-input"
          type="number"
          :min="min"
          :max="max"
          :step="step"
        />
        <span v-if="suffix" class="value-suffix">{{ suffix }}</span>
      </span>
    </span>
    <input
      v-model.number="model"
      class="range-input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
    />
  </label>
</template>

<style scoped>
.control-slider {
  display: grid;
  gap: 9px;
}

.control-topline {
  display: flex;
  min-height: 31px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.control-label {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 560;
}

.value-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
}

.value-input {
  width: 72px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: 600 12px/1 var(--font-mono);
  padding: 7px 8px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.value-input:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 17%, transparent);
}

.value-suffix {
  min-width: 18px;
  color: var(--text-tertiary);
  font: 500 11px/1 var(--font-mono);
}

.range-input {
  width: 100%;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--accent);
}
</style>

<script setup lang="ts">
import type { SourceSize } from '@zyyv/vanish'

export type DemoSource = 'card' | 'image'

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
    <article v-if="source === 'card'" class="specimen-card">
      <header class="card-header">
        <span>Vanish / Lab</span>
        <span class="status">
          <span class="status-dot" aria-hidden="true" />
          Rendering
        </span>
      </header>

      <div class="card-copy">
        <span class="card-index">Study 08</span>
        <strong class="card-title">Kinetic<br />systems</strong>
      </div>

      <footer class="card-footer">
        <span>24 Jul 2026</span>
        <span>WebGL / Vue</span>
        <strong>02</strong>
      </footer>
    </article>

    <figure v-else class="portrait-frame">
      <img
        class="portrait"
        src="/demo-portrait.png"
        alt="Black and white editorial portrait lit from the side"
        @load="emit('ready')"
      />
      <figcaption class="portrait-caption">
        <span>Portrait / 01</span>
        <strong>Light study</strong>
      </figcaption>
      <span class="frame-corner top-left" aria-hidden="true" />
      <span class="frame-corner bottom-right" aria-hidden="true" />
    </figure>
  </div>
</template>

<style scoped>
.source-preview {
  position: relative;
  container-type: inline-size;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.48);
}

.specimen-card,
.portrait-frame {
  width: 100%;
  height: 100%;
}

.specimen-card {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 5px;
  background: #e9e9e6;
  color: #111111;
  font-family: "Helvetica Neue", "SF Pro Display", Arial, sans-serif;
}

.specimen-card::before {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 22%, rgba(255, 255, 255, 0.95), transparent 32%),
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.025) 0,
      rgba(0, 0, 0, 0.025) 1px,
      transparent 1px,
      transparent 28px
    );
  content: "";
  pointer-events: none;
}

.card-header,
.card-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: 650 7px/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-header {
  padding: 11px 12px 0;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.card-copy {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: center;
  grid-template-columns: 54px 1fr;
  padding: 2px 12px 0;
}

.card-index {
  margin-top: 5px;
  font: 600 7px/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.card-title {
  font-size: clamp(22px, 10.5cqi, 32px);
  font-weight: 620;
  line-height: 0.82;
  letter-spacing: -0.075em;
  text-transform: lowercase;
}

.card-footer {
  margin: 0 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.24);
  padding: 8px 0 9px;
}

.card-footer strong {
  display: grid;
  width: 19px;
  height: 19px;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 7px;
}

.portrait-frame {
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 5px;
  background: #111111;
}

.portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.08);
  transform: scale(1.015);
}

.portrait-frame::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.18), transparent 30%, rgba(0, 0, 0, 0.52)),
    radial-gradient(circle at 70% 32%, transparent 35%, rgba(0, 0, 0, 0.22));
  content: "";
  pointer-events: none;
}

.portrait-caption {
  position: absolute;
  z-index: 1;
  right: 13px;
  bottom: 12px;
  left: 13px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  color: #f2f2f2;
  text-transform: uppercase;
}

.portrait-caption span {
  font: 600 7px/1 var(--font-mono);
  letter-spacing: 0.09em;
}

.portrait-caption strong {
  font-size: 10px;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.frame-corner {
  position: absolute;
  z-index: 1;
  width: 14px;
  height: 14px;
  border-color: rgba(255, 255, 255, 0.68);
  border-style: solid;
}

.top-left {
  top: 10px;
  left: 10px;
  border-width: 1px 0 0 1px;
}

.bottom-right {
  right: 10px;
  bottom: 10px;
  border-width: 0 1px 1px 0;
}
</style>

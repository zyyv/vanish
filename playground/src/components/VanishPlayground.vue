<script setup lang="ts">
import {
  VanishCanvas,
  defaultVanishConfiguration,
  useVanishAnimation,
  type SourceSize,
  type VanishConfiguration,
} from '@zyyv/vanish'
import { computed, reactive, shallowRef } from 'vue'
import ParameterControls from './ParameterControls.vue'
import SourcePreview, { type DemoSource } from './SourcePreview.vue'
import TransportControls from './TransportControls.vue'

type Locale = 'zh' | 'en'

const copies = {
  zh: {
    subtitle: 'Vue + WebGL2 可逆粒子消散实验',
    liveRendering: '实时渲染',
    estimatedParticles: '预计粒子数',
    card: 'Vue 组件',
    image: '图片',
    canvasNote: '黑色区域是 WebGL 画布。周围空间用于保留飞出原始边界的粒子。',
    disintegrate: '消散',
    reassemble: '重组',
    progress: '进度',
    duration: '时长',
    sourceSize: '源尺寸',
    sourceWidth: '源宽度',
    sourceHeight: '源高度',
    particles: '粒子',
    particleSize: '粒子尺寸',
    endScale: '结束缩放',
    rotation: '最大旋转',
    motion: '运动',
    direction: '方向',
    directionSpread: '方向散布',
    travelDistance: '移动距离',
    travelVariation: '距离变化',
    gravity: '重力',
    turbulence: '湍流',
    timing: '时序',
    stagger: '错峰',
    waveDirection: '波浪方向',
    seed: '种子',
    randomize: '随机',
    source: '源内容',
    renderingError: '渲染器无法启动',
  },
  en: {
    subtitle: 'Reversible particle disintegration for Vue + WebGL2',
    liveRendering: 'Live rendering',
    estimatedParticles: 'Estimated particles',
    card: 'Vue component',
    image: 'Image',
    canvasNote: 'The black area is the WebGL canvas. Extra space keeps travelling particles visible.',
    disintegrate: 'Disintegrate',
    reassemble: 'Reassemble',
    progress: 'Progress',
    duration: 'Duration',
    sourceSize: 'Source size',
    sourceWidth: 'Source width',
    sourceHeight: 'Source height',
    particles: 'Particles',
    particleSize: 'Particle size',
    endScale: 'End scale',
    rotation: 'Maximum rotation',
    motion: 'Motion',
    direction: 'Direction',
    directionSpread: 'Direction spread',
    travelDistance: 'Travel distance',
    travelVariation: 'Travel variation',
    gravity: 'Gravity',
    turbulence: 'Turbulence',
    timing: 'Timing',
    stagger: 'Stagger',
    waveDirection: 'Wave direction',
    seed: 'Seed',
    randomize: 'Randomize',
    source: 'Source',
    renderingError: 'The renderer could not start',
  },
} as const

const locale = shallowRef<Locale>('zh')
const source = shallowRef<DemoSource>('card')
const duration = shallowRef(0.9)
const particleCount = shallowRef(0)
const rendererError = shallowRef('')
const sourceSizes: Record<DemoSource, SourceSize> = {
  card: { width: 280, height: 168 },
  image: { width: 236, height: 236 },
}
const sourceSize = reactive<SourceSize>({ ...sourceSizes.card })
const configuration = reactive(defaultVanishConfiguration())
const labels = computed(() => copies[locale.value])
const formattedParticleCount = computed(() => (
  new Intl.NumberFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US')
    .format(particleCount.value)
))

const {
  progress,
  setProgress,
  animateTo,
} = useVanishAnimation()

const setSource = (value: DemoSource) => {
  source.value = value
  Object.assign(sourceSize, sourceSizes[value])
  setProgress(0)
}

const updateConfiguration = (
  key: keyof VanishConfiguration,
  value: number,
) => {
  const ranges: Partial<Record<keyof VanishConfiguration, [number, number]>> = {
    seed: [0, 9999],
    particleSize: [0.5, 8],
    endScale: [0, 1],
    stagger: [0, 0.85],
    travelVariation: [0, 1],
  }
  const range = ranges[key]
  configuration[key] = range
    ? Math.min(Math.max(value, range[0]), range[1])
    : value
}

const updateSourceSize = (key: keyof SourceSize, value: number) => {
  const range = key === 'width' ? [120, 340] : [80, 320]
  const nextValue = Math.min(Math.max(value, range[0]), range[1])
  sourceSize[key] = nextValue
  sourceSizes[source.value][key] = nextValue
  setProgress(0)
}

const randomizeSeed = () => {
  let seed = configuration.seed
  while (seed === configuration.seed) seed = Math.floor(Math.random() * 10_000)
  configuration.seed = seed
  setProgress(0)
}
</script>

<template>
  <main class="app-shell" data-theme="dark">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-line">
          <span class="brand-mark" aria-hidden="true" />
          <h1>Vanish<span class="brand-quiet">/lab</span></h1>
        </div>
        <p>{{ labels.subtitle }}</p>
      </div>

      <nav class="top-actions" aria-label="Page controls">
        <a
          class="source-link"
          href="https://github.com/zyyv/vanish"
          target="_blank"
          rel="noreferrer"
          aria-label="Vanish repository"
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>
        <button
          class="locale-button"
          type="button"
          @click="locale = locale === 'zh' ? 'en' : 'zh'"
        >
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
      </nav>
    </header>

    <div class="workspace">
      <section class="preview-column">
        <div class="preview-heading">
          <div class="preview-title">
            <span class="live-dot" aria-hidden="true" />
            <h2>{{ labels.liveRendering }}</h2>
          </div>
          <div class="particle-counter">
            <strong>{{ formattedParticleCount }}</strong>
            <span>{{ labels.estimatedParticles }}</span>
          </div>
        </div>

        <div class="source-switcher" role="group" :aria-label="labels.source">
          <button
            v-for="option in (['card', 'image'] as const)"
            :key="option"
            class="source-option"
            :class="{ active: source === option }"
            type="button"
            @click="setSource(option)"
          >
            {{ labels[option] }}
          </button>
        </div>

        <div class="canvas-wrap">
          <VanishCanvas
            :progress="progress"
            :configuration="configuration"
            :source-size="sourceSize"
            :capture-key="source"
            @particle-count="particleCount = $event"
            @error="rendererError = $event"
          >
            <template #default="{ recapture }">
              <SourcePreview
                :source="source"
                :size="sourceSize"
                @ready="recapture"
              />
            </template>
          </VanishCanvas>
          <div v-if="rendererError" class="renderer-error" role="alert">
            <strong>{{ labels.renderingError }}</strong>
            <span>{{ rendererError }}</span>
          </div>
        </div>

        <p class="canvas-note">{{ labels.canvasNote }}</p>
      </section>

      <aside class="controls-column">
        <TransportControls
          :progress="progress"
          :duration="duration"
          :labels="labels"
          @disintegrate="animateTo(1, duration)"
          @reassemble="animateTo(0, duration)"
          @update-progress="setProgress"
          @update-duration="duration = $event"
        />
        <ParameterControls
          :configuration="configuration"
          :source-size="sourceSize"
          :labels="labels"
          @update-configuration="updateConfiguration"
          @update-source-size="updateSourceSize"
          @randomize-seed="randomizeSeed"
        />
      </aside>
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: var(--page-bg);
  color: var(--text-primary);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 48px 48px;
}

.topbar {
  display: flex;
  width: min(1360px, calc(100% - 64px));
  min-height: 92px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 0 auto;
  border-bottom: 1px solid var(--border);
}

.brand-block {
  display: grid;
  gap: 4px;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 9px;
}

.brand-line h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 680;
  line-height: 1;
  letter-spacing: -0.045em;
}

.brand-mark {
  position: relative;
  width: 22px;
  height: 22px;
  border: 1px solid var(--text-primary);
  border-radius: 50%;
}

.brand-mark::before,
.brand-mark::after {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-primary);
  content: "";
}

.brand-mark::before {
  top: 3px;
  right: -3px;
}

.brand-mark::after {
  right: -6px;
  bottom: 3px;
  opacity: 0.38;
}

.brand-quiet {
  color: var(--text-tertiary);
  font-weight: 450;
}

.brand-block p {
  margin: 0 0 0 31px;
  color: var(--text-tertiary);
  font: 450 10px/1.3 var(--font-mono);
  letter-spacing: 0.025em;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.source-link,
.locale-button {
  display: grid;
  min-width: 42px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  background: var(--surface);
  color: var(--text-secondary);
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.source-link {
  grid-auto-flow: column;
  gap: 7px;
  padding: 0 10px;
  font: 600 10px/1 var(--font-mono);
}

.locale-button {
  width: auto;
  padding: 0 11px;
  font: 650 10px/1 var(--font-mono);
}

.source-link:hover,
.locale-button:hover {
  border-color: var(--text-secondary);
  background: var(--surface-raised);
}

.source-link:active,
.locale-button:active {
  transform: scale(0.97);
}

.workspace {
  display: grid;
  width: min(1360px, calc(100% - 64px));
  grid-template-columns: minmax(0, 1.65fr) minmax(360px, 0.7fr);
  align-items: start;
  gap: 40px;
  margin: 0 auto;
  padding: 40px 0 72px;
}

.preview-column {
  position: sticky;
  top: 24px;
  min-width: 0;
}

.preview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 620;
  letter-spacing: -0.01em;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-primary);
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.07);
  animation: live-pulse 2.4s ease-in-out infinite;
}

.particle-counter {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.particle-counter strong {
  font: 560 13px/1 var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.particle-counter span {
  color: var(--text-tertiary);
  font: 450 9px/1.2 var(--font-mono);
  letter-spacing: 0.04em;
}

.source-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin-bottom: 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--segmented-bg);
  padding: 2px;
}

.source-option {
  min-height: 32px;
  border: 0;
  border-radius: 2px;
  background: transparent;
  color: var(--text-tertiary);
  font: 600 10px/1 var(--font-mono);
  font-weight: 650;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.source-option.active {
  background: var(--text-primary);
  color: var(--page-bg);
  box-shadow: var(--segment-shadow);
}

.canvas-wrap {
  position: relative;
}

.renderer-error {
  position: absolute;
  inset: 16px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 7px;
  border: 1px solid rgba(234, 100, 86, 0.4);
  border-radius: 16px;
  background: rgba(35, 20, 20, 0.92);
  color: #ffd3ce;
  text-align: center;
}

.renderer-error span {
  max-width: 42ch;
  font-size: 12px;
  opacity: 0.8;
}

.canvas-note {
  max-width: 72ch;
  margin: 12px 2px 0;
  color: var(--text-tertiary);
  font: 450 10px/1.6 var(--font-mono);
  line-height: 1.5;
}

.controls-column {
  display: grid;
  min-width: 0;
  gap: 12px;
}

.panel {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  box-shadow: var(--panel-shadow);
  padding: 24px;
}

@keyframes live-pulse {
  50% {
    opacity: 0.5;
    transform: scale(0.78);
  }
}

@media (max-width: 920px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .preview-column {
    position: static;
  }
}

@media (max-width: 600px) {
  .topbar,
  .workspace {
    width: min(100% - 28px, 1360px);
  }

  .topbar {
    min-height: 76px;
  }

  .brand-block p {
    display: none;
  }

  .workspace {
    gap: 20px;
    padding-top: 22px;
  }
}
</style>

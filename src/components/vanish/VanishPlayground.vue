<script setup lang="ts">
import {
  PhGithubLogo as GithubLogo,
  PhMoon as Moon,
  PhSparkle as Sparkle,
  PhSun as Sun,
} from '@phosphor-icons/vue'
import { computed, reactive, shallowRef } from 'vue'
import { useVanishAnimation } from '../../composables/useVanishAnimation'
import {
  defaultVanishConfiguration,
  type DemoSource,
  type SourceSize,
  type VanishConfiguration,
} from '../../types/vanish'
import ParameterControls from './ParameterControls.vue'
import TransportControls from './TransportControls.vue'
import VanishCanvas from './VanishCanvas.vue'

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
const isDark = shallowRef(window.matchMedia('(prefers-color-scheme: dark)').matches)
const sourceSize = reactive<SourceSize>({ width: 150, height: 96 })
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
  const range = key === 'width' ? [80, 280] : [52, 180]
  sourceSize[key] = Math.min(Math.max(value, range[0]), range[1])
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
  <main class="app-shell" :data-theme="isDark ? 'dark' : 'light'">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-line">
          <span class="brand-mark" aria-hidden="true">
            <Sparkle :size="16" weight="fill" />
          </span>
          <h1>VanishKit</h1>
        </div>
        <p>{{ labels.subtitle }}</p>
      </div>

      <nav class="top-actions" aria-label="Page controls">
        <a
          class="icon-button"
          href="https://github.com/jhao941/VanishKit"
          target="_blank"
          rel="noreferrer"
          aria-label="Original VanishKit repository"
        >
          <GithubLogo :size="18" weight="bold" />
        </a>
        <button
          class="icon-button"
          type="button"
          :aria-label="isDark ? 'Use light theme' : 'Use dark theme'"
          @click="isDark = !isDark"
        >
          <Sun v-if="isDark" :size="18" weight="bold" />
          <Moon v-else :size="18" weight="bold" />
        </button>
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
            <Sparkle :size="18" weight="fill" />
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
            :source="source"
            :source-size="sourceSize"
            @particle-count="particleCount = $event"
            @error="rendererError = $event"
          />
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
  transition:
    background-color 220ms ease,
    color 220ms ease;
}

.topbar {
  display: flex;
  width: min(1280px, calc(100% - 48px));
  min-height: 82px;
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
  font-size: 21px;
  line-height: 1;
  letter-spacing: -0.035em;
}

.brand-mark {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 9px;
  background: var(--accent);
  color: #f7fbff;
}

.brand-block p {
  margin: 0 0 0 37px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.icon-button,
.locale-button {
  display: grid;
  min-width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-secondary);
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.locale-button {
  width: auto;
  padding: 0 11px;
  font: 700 11px/1 var(--font-sans);
}

.icon-button:hover,
.locale-button:hover {
  border-color: var(--text-tertiary);
  background: var(--surface-raised);
}

.icon-button:active,
.locale-button:active {
  transform: scale(0.97);
}

.workspace {
  display: grid;
  width: min(1280px, calc(100% - 48px));
  grid-template-columns: minmax(0, 1.5fr) minmax(340px, 0.78fr);
  align-items: start;
  gap: 28px;
  margin: 0 auto;
  padding: 32px 0 56px;
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
  margin-bottom: 14px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
}

.preview-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  letter-spacing: -0.015em;
}

.particle-counter {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.particle-counter strong {
  font: 650 12px/1 var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.particle-counter span {
  color: var(--text-tertiary);
  font-size: 10px;
}

.source-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--segmented-bg);
  padding: 3px;
}

.source-option {
  min-height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 650;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.source-option.active {
  background: var(--surface);
  color: var(--text-primary);
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
  margin: 10px 2px 0;
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1.5;
}

.controls-column {
  display: grid;
  min-width: 0;
  gap: 16px;
}

.panel {
  border: 1px solid var(--border);
  border-radius: 17px;
  background: var(--surface);
  box-shadow: var(--panel-shadow);
  padding: 20px;
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
    width: min(100% - 28px, 1280px);
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

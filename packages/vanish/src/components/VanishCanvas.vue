<script setup lang="ts">
import html2canvas from 'html2canvas'
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  useTemplateRef,
  watch,
} from 'vue'
import { WebGLVanishRenderer } from '../lib/webglVanishRenderer'
import type {
  SourceSize,
  VanishConfiguration,
} from '../types'

const props = defineProps<{
  progress: number
  configuration: VanishConfiguration
  sourceSize: SourceSize
  captureKey?: unknown
}>()

const emit = defineEmits<{
  particleCount: [count: number]
  error: [message: string]
}>()

defineSlots<{
  default(props: { recapture: () => Promise<void> }): unknown
}>()

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const sourceRef = useTemplateRef<HTMLElement>('source')
let renderer: WebGLVanishRenderer | undefined
let resizeObserver: ResizeObserver | undefined
let captureRevision = 0

const render = () => {
  if (!renderer) return
  renderer.render(props.progress, props.configuration)
  emit('particleCount', renderer.getParticleCount(props.configuration))
}

const captureSource = async () => {
  const revision = ++captureRevision
  await nextTick()
  const sourceElement = sourceRef.value
  if (!sourceElement || !renderer) return

  try {
    await document.fonts.ready
    const snapshot = await html2canvas(sourceElement, {
      backgroundColor: null,
      scale: Math.min(window.devicePixelRatio || 1, 2),
      logging: false,
      useCORS: true,
    })
    if (revision !== captureRevision) return

    renderer.setSource(
      snapshot,
      props.sourceSize.width,
      props.sourceSize.height,
    )
    render()
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Unable to capture the source view.'
    emit('error', message)
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  try {
    renderer = new WebGLVanishRenderer(canvas)
    resizeObserver = new ResizeObserver(render)
    resizeObserver.observe(canvas)
    void captureSource()
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Unable to start the WebGL renderer.'
    emit('error', message)
  }
})

watch(
  () => props.progress,
  render,
)

watch(
  () => props.configuration,
  render,
  { deep: true },
)

watch(
  () => [props.captureKey, props.sourceSize.width, props.sourceSize.height],
  () => {
    void captureSource()
  },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  renderer?.destroy()
})
</script>

<template>
  <div class="render-stage">
    <canvas ref="canvas" class="render-canvas" />
    <div ref="source" class="capture-source" aria-hidden="true">
      <slot :recapture="captureSource" />
    </div>
  </div>
</template>

<style scoped>
.render-stage {
  position: relative;
  min-height: 470px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 26px;
  background:
    radial-gradient(circle at 50% 42%, #17171a 0%, #0b0b0d 62%, #08080a 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 24px 70px rgba(16, 17, 20, 0.17);
}

.render-canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 470px;
}

.capture-source {
  position: fixed;
  top: 0;
  left: -10000px;
  z-index: -1;
  pointer-events: none;
}

@media (max-width: 720px) {
  .render-stage,
  .render-canvas {
    min-height: 390px;
  }
}
</style>

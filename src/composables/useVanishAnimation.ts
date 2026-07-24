import { onBeforeUnmount, shallowRef } from 'vue'

const smoothstep = (value: number) => value * value * (3 - 2 * value)

export function useVanishAnimation(initialProgress = 0) {
  const progress = shallowRef(initialProgress)
  const isAnimating = shallowRef(false)
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )

  let frame = 0

  const stop = () => {
    cancelAnimationFrame(frame)
    isAnimating.value = false
  }

  const setProgress = (value: number) => {
    stop()
    progress.value = Math.min(Math.max(value, 0), 1)
  }

  const animateTo = (target: number, durationSeconds: number) => {
    stop()
    const from = progress.value
    const destination = Math.min(Math.max(target, 0), 1)

    if (prefersReducedMotion.matches || Math.abs(from - destination) < 0.0001) {
      progress.value = destination
      return
    }

    const startedAt = performance.now()
    const duration = Math.max(durationSeconds * 1000, 1)
    isAnimating.value = true

    const tick = (now: number) => {
      const linear = Math.min((now - startedAt) / duration, 1)
      const eased = smoothstep(linear)
      progress.value = from + (destination - from) * eased

      if (linear < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        isAnimating.value = false
      }
    }

    frame = requestAnimationFrame(tick)
  }

  onBeforeUnmount(stop)

  return {
    progress,
    isAnimating,
    setProgress,
    animateTo,
  }
}

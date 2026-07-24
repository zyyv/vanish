# @zyyv/vanish

A Vue 3 component for reversible WebGL2 particle disintegration. It captures slot content into a texture and exposes the transition as a controllable `progress` value.

## Install

```sh
pnpm add @zyyv/vanish
```

Vue `^3.5.0` is required.

## Usage

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import {
  VanishCanvas,
  defaultVanishConfiguration,
  useVanishAnimation,
} from '@zyyv/vanish'
import '@zyyv/vanish/style.css'

const configuration = reactive(defaultVanishConfiguration())
const sourceSize = { width: 240, height: 120 }
const { progress, animateTo, setProgress } = useVanishAnimation()

const handleParticleCount = (count: number) => {
  console.info(`Rendering ${count} particles`)
}

const handleError = (message: string) => {
  console.error(message)
}
</script>

<template>
  <VanishCanvas
    :progress="progress"
    :configuration="configuration"
    :source-size="sourceSize"
    @particle-count="handleParticleCount"
    @error="handleError"
  >
    <div class="source">Content to disintegrate</div>
  </VanishCanvas>

  <button @click="animateTo(1, 0.9)">Disintegrate</button>
  <button @click="animateTo(0, 0.9)">Reassemble</button>
  <input
    :value="progress"
    type="range"
    min="0"
    max="1"
    step="0.01"
    @input="setProgress(Number(($event.target as HTMLInputElement).value))"
  />
</template>

<style scoped>
.source {
  width: 240px;
  height: 120px;
}
</style>
```

Keep `sourceSize` equal to the rendered CSS size of the slot content.

## Async slot content

The default slot exposes `recapture()`. Call it after an image or other asynchronous content is ready:

```vue
<VanishCanvas
  :progress="progress"
  :configuration="configuration"
  :source-size="{ width: 320, height: 200 }"
  :capture-key="imageUrl"
>
  <template #default="{ recapture }">
    <img
      :src="imageUrl"
      width="320"
      height="200"
      crossorigin="anonymous"
      @load="recapture"
    />
  </template>
</VanishCanvas>
```

Changing `captureKey` also triggers a capture. Cross-origin images must send compatible CORS headers.

## Component API

| Prop | Type | Description |
| --- | --- | --- |
| `progress` | `number` | Transition value from intact (`0`) to vanished (`1`) |
| `configuration` | `VanishConfiguration` | Reactive particle and motion settings |
| `sourceSize` | `{ width: number; height: number }` | Source dimensions in CSS pixels |
| `captureKey?` | `unknown` | Recaptures the slot whenever the value changes |

Events:

- `particle-count(count: number)` reports the estimated active particle count.
- `error(message: string)` reports WebGL initialization or capture failures.

`useVanishAnimation(initialProgress?)` returns readonly `progress` and `isAnimating` refs, plus `setProgress(value)` and `animateTo(target, durationSeconds)`.

See the [repository README](https://github.com/zyyv/vanish#readme) for the full configuration reference, performance guidance, and workspace commands.

## Credits

- [VanishKit](https://github.com/jhao941/VanishKit) - @jhao941

## License

MIT

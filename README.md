# vanish

一个面向 Vue 3 的可逆 WebGL2 粒子消散组件。它会把默认插槽中的 DOM 内容捕获为纹理，再根据 `progress` 在原始画面与粒子状态之间连续过渡。

## 特性

- 可逆播放：`progress` 可在 `0`（完整显示）到 `1`（完全消散）之间自由控制
- DOM 内容源：支持 Vue 组件、文本、图片等可被 `html2canvas` 捕获的内容
- 可调粒子运动：方向、散布、距离、重力、湍流、旋转、错峰和波浪方向
- 确定性随机：相同的 `seed` 会得到相同的粒子运动
- 自带动画 composable，也可以接入 GSAP、Motion 或自己的时间轴
- TypeScript 类型与样式入口开箱即用

## 要求

- Vue `^3.5.0`
- 支持 WebGL2、`ResizeObserver` 与 `requestAnimationFrame` 的现代浏览器
- 组件需要在浏览器环境中运行；Nuxt 等 SSR 项目请放在客户端边界内

## 安装

```sh
pnpm add @zyyv/vanish
```

也可以使用 npm 或 yarn：

```sh
npm install @zyyv/vanish
# yarn add @zyyv/vanish
```

## 最小用法

```vue
<script setup lang="ts">
import { reactive, shallowRef } from 'vue'
import {
  VanishCanvas,
  defaultVanishConfiguration,
} from '@zyyv/vanish'
import '@zyyv/vanish/style.css'

const progress = shallowRef(0)
const configuration = reactive(defaultVanishConfiguration())
const sourceSize = { width: 240, height: 120 }
</script>

<template>
  <VanishCanvas
    :progress="progress"
    :configuration="configuration"
    :source-size="sourceSize"
  >
    <div class="source-card">
      Content to disintegrate
    </div>
  </VanishCanvas>

  <input v-model.number="progress" type="range" min="0" max="1" step="0.01" />
</template>

<style scoped>
.source-card {
  width: 240px;
  height: 120px;
}
</style>
```

`sourceSize` 应当与插槽内容的 CSS 尺寸一致。组件会把内容放到屏幕外捕获，页面中最终显示的是 WebGL 画布。

## 播放消散与重组

`useVanishAnimation()` 提供了一个轻量的内置时间轴，并自动尊重 `prefers-reduced-motion`：

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
const sourceSize = { width: 280, height: 160 }
const { progress, isAnimating, animateTo, setProgress } =
  useVanishAnimation()
</script>

<template>
  <VanishCanvas
    :progress="progress"
    :configuration="configuration"
    :source-size="sourceSize"
  >
    <div class="message">Vanish</div>
  </VanishCanvas>

  <button :disabled="isAnimating" @click="animateTo(1, 0.9)">
    消散
  </button>
  <button :disabled="isAnimating" @click="animateTo(0, 0.9)">
    重组
  </button>
  <button @click="setProgress(0.5)">跳到一半</button>
</template>
```

`animateTo(target, durationSeconds)` 的目标值会自动限制在 `0...1`。再次调用 `animateTo` 或 `setProgress` 会停止上一段动画。

## 图片与异步内容

默认插槽会暴露 `recapture()`。图片加载、字体变化或其他异步内容准备好后调用它，画布就会重新捕获内容：

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

当源内容的身份变化时，也可以更新 `capture-key` 触发自动重捕获。远程图片必须允许跨域读取，否则浏览器的 canvas 安全策略会阻止捕获。

## 配置

使用 `defaultVanishConfiguration()` 获取完整默认配置，再按需修改：

```ts
const configuration = reactive({
  ...defaultVanishConfiguration(),
  particleSize: 3,
  direction: -20,
  travelDistance: 140,
  turbulence: 40,
  seed: 128,
})
```

| 字段 | 默认值 | 说明 |
| --- | ---: | --- |
| `particleSize` | `2` | 采样粒子的边长（CSS px）；越小越细腻，也会产生更多粒子 |
| `direction` | `-35` | 粒子移动主方向（度） |
| `directionSpread` | `55` | 主方向两侧的随机散布范围（度） |
| `travelDistance` | `105` | 基础移动距离（px） |
| `travelVariation` | `0.35` | 每个粒子移动距离的随机变化比例 |
| `rotation` | `260` | 最大随机旋转角度（度） |
| `stagger` | `0.38` | 粒子启动时间的错峰比例 |
| `gravity` | `18` | 垂直方向加速度强度 |
| `turbulence` | `28` | 粒子轨迹的扰动强度 |
| `endScale` | `0.18` | 完全消散时粒子的尺寸比例 |
| `waveDirection` | `0` | 错峰波浪扫过源内容的方向（度） |
| `seed` | `42` | 决定随机轨迹的整数种子 |
| `maximumParticleCount` | `60000` | 粒子数量上限，用于控制显存和渲染成本 |

传给 `configuration` 的对象是响应式读取的；修改字段后无需重新创建组件。

## `VanishCanvas` API

### Props

| Prop | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| `progress` | `number` | 是 | `0` 为原始内容，`1` 为完全消散 |
| `configuration` | `VanishConfiguration` | 是 | 粒子与运动配置 |
| `sourceSize` | `{ width: number; height: number }` | 是 | 被捕获内容的 CSS 像素尺寸 |
| `captureKey` | `unknown` | 否 | 值变化时重新捕获默认插槽 |

### 插槽

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ recapture: () => Promise<void> }` | 要捕获并粒子化的 Vue 内容 |

### 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `particle-count` | `number` | 捕获或配置变化后给出当前预计粒子数 |
| `error` | `string` | WebGL 初始化或内容捕获失败时给出错误信息 |

## 性能建议

- 先增大 `particleSize`，再提高 `maximumParticleCount`；小粒子会快速增加 GPU 负载。
- 源尺寸发生变化时组件会重新捕获，拖拽尺寸滑杆时应避免毫秒级高频更新。
- 动画期间只修改 `progress`；不要在每帧重新创建 `configuration`。
- 对图片设置明确的宽高，避免图片加载后触发布局变化。

## 本仓库开发

这是一个 pnpm workspace：

```text
packages/vanish  可发布的 @zyyv/vanish 包
playground       使用 workspace 包的 Vite 演示与调参页面
```

```sh
pnpm install
pnpm dev          # 监听构建 @zyyv/vanish
pnpm play         # 启动 playground
pnpm typecheck    # 检查 @zyyv/vanish
pnpm build        # 并行构建所有 workspace
```

## 持续集成、部署与发布

GitHub Actions 会在 pull request 和 `main` 分支 push 时执行类型检查、构建以及 Wrangler dry-run。`main` 分支还会自动把 `playground/dist` 部署为 Cloudflare Workers Static Assets。

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中配置：

- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare account ID
- `CLOUDFLARE_API_TOKEN`：权限限制到目标账号的 Workers 编辑 token

npm 发布使用 npm Trusted Publishing。请在 npm 的 `@zyyv/vanish` 包设置中添加本 GitHub 仓库，并把 workflow filename 配置为 `release.yml`，允许执行 `npm publish`。

发布新版本时，在干净且最新的 `main` 分支运行：

```sh
pnpm release
```

`bumpp` 会同步更新 workspace 版本与 lockfile，创建 release commit 和 `v*` tag，并推送到 GitHub。tag 会触发 GitHub Actions 构建并发布 `@zyyv/vanish`。

也可以在本地验证或手动部署：

```sh
pnpm deploy:playground  # 构建 playground 并部署到 Cloudflare
```

## Credits

- [VanishKit](https://github.com/jhao941/VanishKit) - @jhao941

## License

MIT

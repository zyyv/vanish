export type DemoSource = 'card' | 'image'

export interface VanishConfiguration {
  particleSize: number
  direction: number
  directionSpread: number
  travelDistance: number
  travelVariation: number
  rotation: number
  stagger: number
  gravity: number
  turbulence: number
  endScale: number
  waveDirection: number
  seed: number
  maximumParticleCount: number
}

export interface SourceSize {
  width: number
  height: number
}

export const defaultVanishConfiguration = (): VanishConfiguration => ({
  particleSize: 2,
  direction: -35,
  directionSpread: 55,
  travelDistance: 105,
  travelVariation: 0.35,
  rotation: 260,
  stagger: 0.38,
  gravity: 18,
  turbulence: 28,
  endScale: 0.18,
  waveDirection: 0,
  seed: 42,
  maximumParticleCount: 60_000,
})

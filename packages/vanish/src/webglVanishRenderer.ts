import type { VanishConfiguration } from './types'

const vertexShaderSource = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform vec2 uViewportSize;
uniform vec2 uImageOrigin;
uniform vec2 uImageSize;
uniform vec2 uTextureSize;
uniform float uProgress;
uniform float uTextureCellSize;
uniform float uTextureToDisplayScale;
uniform float uEndScale;
uniform float uDirection;
uniform float uDirectionSpread;
uniform float uTravelDistance;
uniform float uTravelVariation;
uniform float uRotation;
uniform float uStagger;
uniform float uGravity;
uniform float uTurbulence;
uniform float uWaveDirection;
uniform uint uColumns;
uniform uint uSeed;

out vec2 vTextureCoordinate;
out float vOpacity;

float hashValue(uint value) {
  value ^= value >> 16;
  value *= 0x7feb352du;
  value ^= value >> 15;
  value *= 0x846ca68bu;
  value ^= value >> 16;
  return float(value) / float(0xffffffffu);
}

vec2 quadCorner(int vertexID) {
  const vec2 corners[6] = vec2[6](
    vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
    vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0)
  );
  return corners[vertexID];
}

void main() {
  uint instanceID = uint(gl_InstanceID);
  uint row = instanceID / uColumns;
  uint column = instanceID % uColumns;

  vec2 textureStart = vec2(float(column), float(row)) * uTextureCellSize;
  vec2 textureEnd = min(textureStart + uTextureCellSize, uTextureSize);
  vec2 textureParticleSize = max(textureEnd - textureStart, vec2(0.0));
  vec2 displayParticleSize = textureParticleSize * uTextureToDisplayScale;
  vec2 uvStart = textureStart / uTextureSize;
  vec2 uvSize = textureParticleSize / uTextureSize;
  vec2 uvCenter = uvStart + uvSize * 0.5;

  float directionRandom = hashValue(instanceID ^ uSeed ^ 0x9e3779b9u);
  float distanceRandom = hashValue(instanceID ^ uSeed ^ 0x85ebca6bu);
  float rotationRandom = hashValue(instanceID ^ uSeed ^ 0xc2b2ae35u);
  float delayRandom = hashValue(instanceID ^ uSeed ^ 0x27d4eb2fu);
  float turbulenceRandom = hashValue(instanceID ^ uSeed ^ 0x165667b1u);

  float directionAngle = uDirection
    + (directionRandom - 0.5) * uDirectionSpread;
  vec2 direction = vec2(cos(directionAngle), sin(directionAngle));
  vec2 perpendicular = vec2(-direction.y, direction.x);
  float distance = uTravelDistance
    * (1.0 + (distanceRandom * 2.0 - 1.0) * uTravelVariation);

  vec2 waveDirection = vec2(cos(uWaveDirection), sin(uWaveDirection));
  float waveProjection = clamp(
    dot(uvCenter - 0.5, waveDirection) / 1.41421356 + 0.5,
    0.0,
    1.0
  );
  float delay = uStagger * mix(waveProjection, delayRandom, 0.24);
  float localProgress = clamp(
    (uProgress - delay) / max(1.0 - delay, 0.0001),
    0.0,
    1.0
  );
  float eased = localProgress * localProgress * (3.0 - 2.0 * localProgress);

  vec2 travel = direction * distance * eased;
  travel += perpendicular
    * (turbulenceRandom * 2.0 - 1.0)
    * uTurbulence
    * sin(eased * 3.14159265359);
  travel.y += uGravity * eased * eased;

  float targetRotation = (rotationRandom * 2.0 - 1.0) * uRotation;
  float rotation = targetRotation * eased;
  float sine = sin(rotation);
  float cosine = cos(rotation);
  mat2 rotationMatrix = mat2(cosine, sine, -sine, cosine);

  float particleScale = mix(1.0, uEndScale, eased);
  vec2 corner = quadCorner(gl_VertexID);
  vec2 localPosition = rotationMatrix
    * ((corner - 0.5) * displayParticleSize * particleScale);
  vec2 center = uImageOrigin + uvCenter * uImageSize + travel;
  vec2 pixelPosition = center + localPosition;
  vec2 clipPosition = vec2(
    pixelPosition.x / uViewportSize.x * 2.0 - 1.0,
    1.0 - pixelPosition.y / uViewportSize.y * 2.0
  );

  gl_Position = vec4(clipPosition, 0.0, 1.0);
  vTextureCoordinate = uvStart + corner * uvSize;
  vOpacity = pow(max(1.0 - localProgress, 0.0), 1.15);
}`

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uSourceTexture;

in vec2 vTextureCoordinate;
in float vOpacity;
out vec4 outColor;

void main() {
  vec4 color = texture(uSourceTexture, vTextureCoordinate);
  color *= vOpacity;
  if (color.a <= 0.002) {
    discard;
  }
  outColor = color;
}`

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to create a WebGL shader.')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader error.'
    gl.deleteShader(shader)
    throw new Error(message)
  }

  return shader
}

function createProgram(gl: WebGL2RenderingContext) {
  const program = gl.createProgram()
  if (!program) throw new Error('Unable to create a WebGL program.')

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  )

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown link error.'
    gl.deleteProgram(program)
    throw new Error(message)
  }

  return program
}

export class WebGLVanishRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly gl: WebGL2RenderingContext
  private readonly program: WebGLProgram
  private readonly texture: WebGLTexture
  private textureWidth = 1
  private textureHeight = 1
  private imageWidth = 1
  private imageHeight = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    })
    if (!gl) throw new Error('WebGL 2 is not available in this browser.')

    this.gl = gl
    this.program = createProgram(gl)
    const texture = gl.createTexture()
    if (!texture) throw new Error('Unable to allocate the source texture.')
    this.texture = texture

    gl.useProgram(this.program)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  }

  setSource(source: HTMLCanvasElement, width: number, height: number) {
    const { gl } = this
    this.textureWidth = source.width
    this.textureHeight = source.height
    this.imageWidth = width
    this.imageHeight = height

    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source,
    )
  }

  resize(width: number, height: number) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const pixelWidth = Math.max(Math.round(width * pixelRatio), 1)
    const pixelHeight = Math.max(Math.round(height * pixelRatio), 1)

    if (
      this.canvas.width !== pixelWidth
      || this.canvas.height !== pixelHeight
    ) {
      this.canvas.width = pixelWidth
      this.canvas.height = pixelHeight
    }

    this.gl.viewport(0, 0, pixelWidth, pixelHeight)
  }

  render(progress: number, configuration: VanishConfiguration) {
    const { gl, program } = this
    const viewportWidth = this.canvas.clientWidth
    const viewportHeight = this.canvas.clientHeight
    if (!viewportWidth || !viewportHeight) return

    this.resize(viewportWidth, viewportHeight)

    const requestedCellSize = Math.max(
      configuration.particleSize
        * (this.textureWidth / Math.max(this.imageWidth, 1)),
      1,
    )
    const requestedColumns = Math.ceil(this.textureWidth / requestedCellSize)
    const requestedRows = Math.ceil(this.textureHeight / requestedCellSize)
    const requestedCount = requestedColumns * requestedRows
    const adjustment = Math.max(
      Math.sqrt(requestedCount / configuration.maximumParticleCount),
      1,
    )
    const cellSize = requestedCellSize * adjustment
    const columns = Math.ceil(this.textureWidth / cellSize)
    const rows = Math.ceil(this.textureHeight / cellSize)
    const count = columns * rows

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    this.uniform2f(
      'uViewportSize',
      viewportWidth,
      viewportHeight,
    )
    this.uniform2f(
      'uImageOrigin',
      (viewportWidth - this.imageWidth) * 0.5,
      (viewportHeight - this.imageHeight) * 0.5,
    )
    this.uniform2f('uImageSize', this.imageWidth, this.imageHeight)
    this.uniform2f('uTextureSize', this.textureWidth, this.textureHeight)
    this.uniform1f('uProgress', Math.min(Math.max(progress, 0), 1))
    this.uniform1f('uTextureCellSize', cellSize)
    this.uniform1f(
      'uTextureToDisplayScale',
      this.imageWidth / this.textureWidth,
    )
    this.uniform1f('uEndScale', configuration.endScale)
    this.uniform1f('uDirection', degreesToRadians(configuration.direction))
    this.uniform1f(
      'uDirectionSpread',
      degreesToRadians(configuration.directionSpread),
    )
    this.uniform1f('uTravelDistance', configuration.travelDistance)
    this.uniform1f('uTravelVariation', configuration.travelVariation)
    this.uniform1f('uRotation', degreesToRadians(configuration.rotation))
    this.uniform1f('uStagger', Math.min(configuration.stagger, 0.92))
    this.uniform1f('uGravity', configuration.gravity)
    this.uniform1f('uTurbulence', configuration.turbulence)
    this.uniform1f(
      'uWaveDirection',
      degreesToRadians(configuration.waveDirection),
    )
    this.uniform1ui('uColumns', columns)
    this.uniform1ui('uSeed', configuration.seed)

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count)
  }

  getParticleCount(configuration: VanishConfiguration) {
    const requestedCellSize = Math.max(
      configuration.particleSize
        * (this.textureWidth / Math.max(this.imageWidth, 1)),
      1,
    )
    const requestedCount = Math.ceil(this.textureWidth / requestedCellSize)
      * Math.ceil(this.textureHeight / requestedCellSize)
    return Math.min(requestedCount, configuration.maximumParticleCount)
  }

  destroy() {
    this.gl.deleteTexture(this.texture)
    this.gl.deleteProgram(this.program)
  }

  private uniform1f(name: string, x: number) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), x)
  }

  private uniform1ui(name: string, x: number) {
    this.gl.uniform1ui(this.gl.getUniformLocation(this.program, name), x)
  }

  private uniform2f(name: string, x: number, y: number) {
    this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), x, y)
  }
}

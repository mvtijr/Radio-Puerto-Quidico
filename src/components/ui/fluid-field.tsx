"use client";

import React, { useEffect, useRef, type CSSProperties } from "react";

export type FluidFieldBackgroundProps = {
  mode?: "dark" | "light";
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
};

const DEFAULTS = {
  hue: 0,
  saturation: 1,
  brightness: 1,
} as const;

const BACKGROUND = "#030306";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_hue;
  uniform float u_saturation;
  uniform float u_brightness;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Hue rotation helper
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 baseColor = vec3(0.015, 0.025, 0.05); // Tono marino base
    vec2 st = uv * 0.7;
    st += vec2(snoise(st + u_time * 0.06), snoise(st - u_time * 0.06)) * 0.35;

    float beam = smoothstep(0.1, 0.8, snoise(vec2(st.x + st.y * 1.5 - u_time * 0.15, u_time * 0.025)));
    
    // Tonalidades marinas cian neón y azul profundo
    vec3 glow = mix(vec3(0.0, 0.75, 1.0), vec3(0.1, 0.35, 0.95), snoise(uv * 1.5 + u_time * 0.1) * 0.5 + 0.5);

    vec3 finalColor = baseColor + (glow * beam * 0.9);

    // Aplicar ajuste de tono y saturación en shader
    if (u_hue != 0.0 || u_saturation != 1.0 || u_brightness != 1.0) {
      vec3 hsv = rgb2hsv(finalColor);
      hsv.x = fract(hsv.x + (u_hue / 360.0));
      hsv.y = clamp(hsv.y * u_saturation, 0.0, 1.0);
      hsv.z = clamp(hsv.z * u_brightness, 0.0, 1.0);
      finalColor = hsv2rgb(hsv);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function FluidFieldBackground({
  mode = "dark",
  hue = DEFAULTS.hue,
  saturation = DEFAULTS.saturation,
  brightness = DEFAULTS.brightness,
  className = "",
  style = {},
}: FluidFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) {
      console.warn("WebGL not supported for FluidFieldBackground");
      return;
    }

    // Compilar vertex shader
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vShader) return;
    gl.shaderSource(vShader, VERTEX_SHADER_SOURCE);
    gl.compileShader(vShader);

    // Compilar fragment shader
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fShader) return;
    gl.shaderSource(fShader, FRAGMENT_SHADER_SOURCE);
    gl.compileShader(fShader);

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader program failed to link:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResLoc = gl.getUniformLocation(program, "u_resolution");
    const uHueLoc = gl.getUniformLocation(program, "u_hue");
    const uSatLoc = gl.getUniformLocation(program, "u_saturation");
    const uBrightLoc = gl.getUniformLocation(program, "u_brightness");

    let animId: number;
    let startTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    gl.uniform1f(uHueLoc, safeHue);
    gl.uniform1f(uSatLoc, safeSaturation);
    gl.uniform1f(uBrightLoc, safeBrightness);

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;
      gl.uniform1f(uTimeLoc, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (vShader) gl.deleteShader(vShader);
      if (fShader) gl.deleteShader(fShader);
      if (program) gl.deleteProgram(program);
    };
  }, [safeHue, safeSaturation, safeBrightness]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      data-mode={mode}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        backgroundColor: BACKGROUND,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Texture Layer: Grain Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06]" 
        style={{
          mixBlendMode: "overlay",
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"
        }}
      />
      {/* Texture Layer: Blueprint Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px)"
        }}
      />
    </div>
  );
}

export default FluidFieldBackground;

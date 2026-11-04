"use client"

import { useEffect, useRef } from "react"

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

// Domain-warped noise lit as a surface, which reads as folds of black silk.
const FRAGMENT = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_pool;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float aspect=u_res.x/u_res.y;
  vec2 p=uv*vec2(aspect,1.)*1.1;
  float t=u_t*.035;
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+2.4*q+vec2(1.7,9.2)+t*1.3),fbm(p+2.4*q+vec2(8.3,2.8)-t));
  float h=fbm(p+2.8*r);

  float k=u_res.y*.11;
  vec3 n=normalize(vec3(-dFdx(h)*k,-dFdy(h)*k,1.));
  vec3 l=normalize(vec3(-.45,.75,.55));
  float diff=max(dot(n,l),0.);
  float spec=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),42.);

  vec3 col=vec3(.006)+vec3(.05,.052,.056)*diff*diff+vec3(.62,.64,.68)*spec*.42;

  float d=distance(uv*vec2(aspect,1.),u_pool*vec2(aspect,1.));
  col+=vec3(.9,.92,.96)*pow(smoothstep(.9,0.,d),3.)*.2;

  float vig=smoothstep(1.2,.2,distance(uv,vec2(.5,.55)));
  col*=mix(.25,1.,vig);
  gl_FragColor=vec4(col,1.);
}`

type Props = {
  className?: string
  /** Position of the mint light pool, in 0–1 canvas coordinates (y up). */
  pool?: [number, number]
}

export function LiquidCanvas({ className = "", pool: [poolX, poolY] = [0.14, -0.06] }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
    if (!gl || !gl.getExtension("OES_standard_derivatives")) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "p")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uT = gl.getUniformLocation(program, "u_t")
    gl.uniform2f(gl.getUniformLocation(program, "u_pool"), poolX, poolY)

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const start = performance.now()
    const frameBudget = 1000 / 30
    // Soft noise needs few pixels, so render small and let CSS scale it up.
    let scale = 0.5
    let raf = 0
    let visible = true
    let animating = !reduced
    let last = 0
    let slowFrames = 0

    const draw = (now: number) => {
      gl.uniform1f(uT, 40 + (now - start) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = (now: number) => {
      const elapsed = now - last
      if (elapsed >= frameBudget) {
        const before = performance.now()
        draw(now)
        gl.finish()
        // Slow GPUs get fewer pixels; if that is not enough, keep a still frame.
        slowFrames = performance.now() - before > 28 ? slowFrames + 1 : 0
        if (slowFrames >= 6) {
          slowFrames = 0
          if (scale > 0.2) {
            scale /= 1.6
            resize()
          } else {
            animating = false
          }
        }
        last = now
      }
      if (visible && animating) raf = requestAnimationFrame(loop)
    }
    const resize = () => {
      canvas.width = Math.max(2, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(2, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      draw(performance.now())
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was && animating) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    resize()
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [poolX, poolY])

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        // Shown when WebGL is unavailable.
        background:
          "radial-gradient(70% 55% at 50% 0%, #1c1c1e 0%, transparent 70%), #000",
      }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="lp-grain" />
    </div>
  )
}

// Adapted from the user-supplied React Bits Aurora component.
(() => {
'use strict';
const vertex="#version 300 es\nin vec2 position;\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n";
const fragment="#version 300 es\nprecision highp float;\n\nuniform float uTime;\nuniform float uAmplitude;\nuniform vec3 uColorStops[3];\nuniform vec2 uResolution;\nuniform float uBlend;\nuniform float uLightMode;\n\nout vec4 fragColor;\n\nvec3 permute(vec3 x) {\n  return mod(((x * 34.0) + 1.0) * x, 289.0);\n}\n\nfloat snoise(vec2 v){\n  const vec4 C = vec4(\n      0.211324865405187, 0.366025403784439,\n      -0.577350269189626, 0.024390243902439\n  );\n  vec2 i  = floor(v + dot(v, C.yy));\n  vec2 x0 = v - i + dot(i, C.xx);\n  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n  i = mod(i, 289.0);\n\n  vec3 p = permute(\n      permute(i.y + vec3(0.0, i1.y, 1.0))\n    + i.x + vec3(0.0, i1.x, 1.0)\n  );\n\n  vec3 m = max(\n      0.5 - vec3(\n          dot(x0, x0),\n          dot(x12.xy, x12.xy),\n          dot(x12.zw, x12.zw)\n      ), \n      0.0\n  );\n  m = m * m;\n  m = m * m;\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);\n\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nstruct ColorStop {\n  vec3 color;\n  float position;\n};\n\n#define COLOR_RAMP(colors, factor, finalColor) {              \\\n  int index = 0;                                            \\\n  for (int i = 0; i < 2; i++) {                               \\\n     ColorStop currentColor = colors[i];                    \\\n     bool isInBetween = currentColor.position <= factor;    \\\n     index = int(mix(float(index), float(i), float(isInBetween))); \\\n  }                                                         \\\n  ColorStop currentColor = colors[index];                   \\\n  ColorStop nextColor = colors[index + 1];                  \\\n  float range = nextColor.position - currentColor.position; \\\n  float lerpFactor = (factor - currentColor.position) / range; \\\n  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\\n}\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / uResolution;\n  \n  ColorStop colors[3];\n  colors[0] = ColorStop(uColorStops[0], 0.0);\n  colors[1] = ColorStop(uColorStops[1], 0.5);\n  colors[2] = ColorStop(uColorStops[2], 1.0);\n  \n  vec3 rampColor;\n  COLOR_RAMP(colors, uv.x, rampColor);\n  \n  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;\n  height = exp(height);\n  height = (uv.y * 2.0 - height + 0.2);\n  float intensity = 0.6 * height;\n  \n  float midPoint = 0.20;\n  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);\n  \n  vec3 auroraColor = intensity * rampColor;\n  \n  if (uLightMode > 0.5) {\n    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);\n    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.86);\n    vec3 chroma = pow(clamp(rampColor, 0.0, 1.0), vec3(1.2));\n    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));\n    chroma /= max(chromaPeak, 0.0001);\n    fragColor = vec4(mix(vec3(1.0), chroma, min(coverage * 1.08, 0.94)), 1.0);\n  } else {\n    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);\n  }\n}\n";
const container=document.querySelector('.after-hero'),canvas=container.querySelector('canvas'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
let gl,ctx2d,program,buffer,vao,uniforms={},frame=0,visible=false,lost=false,failed=false,time=0,last=0,lastDraw=0;
const mouse=[.5,.5],target=[.5,.5];
const loc=name=>uniforms[name]??(uniforms[name]=gl.getUniformLocation(program,name));
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(message);}return s;}
function setup(){
 try{
 gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,powerPreference:'low-power'});
 if(!gl){ctx2d=canvas.getContext('2d',{alpha:true});if(!ctx2d){failed=true;canvas.dataset.state='fallback';return false;}canvas.dataset.state='canvas2d';resize();return true;}
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);vao=gl.createVertexArray();gl.bindVertexArray(vao);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const floats={uAmplitude:1,uBlend:.5,uLightMode:1};
 Object.entries(floats).forEach(([name,value])=>gl.uniform1f(loc(name),value));
 gl.uniform3fv(loc('uColorStops[0]'),['#e8def8','#dbeeff','#fde7f1'].flatMap(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)));
 resize();canvas.dataset.state='ready';return true;
 }catch(error){failed=true;canvas.dataset.state='fallback';console.warn('Aurora uses its static fallback:',error.message);return false;}
}
function resize(){if((!gl&&!ctx2d)||lost||failed)return;const width=canvas.clientWidth,height=canvas.clientHeight,scale=Math.min(1,1050/width,750/height,Math.sqrt((ctx2d?120000:600000)/Math.max(1,width*height)));
 const nextWidth=Math.max(1,Math.round(width*scale)),nextHeight=Math.max(1,Math.round(height*scale));
 if(canvas.width===nextWidth&&canvas.height===nextHeight)return;
 canvas.width=nextWidth;canvas.height=nextHeight;if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc('uResolution'),canvas.width,canvas.height);}draw();}
// Canvas fallback follows the supplied simplex height field and light-mode palette.
const stops=[[232,222,248],[219,238,255],[253,231,241]].map(c=>c.map(v=>v/255));
const fract=x=>x-Math.floor(x),permute=x=>(((x*34)+1)*x)%289;
function noise(x,y){
 const c=.211324865405187,d=.366025403784439;
 let ix=Math.floor(x+(x+y)*d),iy=Math.floor(y+(x+y)*d);
 const x0=x-ix+(ix+iy)*c,y0=y-iy+(ix+iy)*c,i1=x0>y0?1:0,j1=1-i1;
 const xx=[x0,x0-i1+c,x0-1+2*c],yy=[y0,y0-j1+c,y0-1+2*c];
 ix=((ix%289)+289)%289;iy=((iy%289)+289)%289;
 let sum=0;
 for(let k=0;k<3;k++){
  const p=permute(permute(iy+[0,j1,1][k])+ix+[0,i1,1][k]);
  const q=2*fract(p*.024390243902439)-1,h=Math.abs(q)-.5,a=q-Math.floor(q+.5);
  const m=Math.max(.5-xx[k]*xx[k]-yy[k]*yy[k],0);
  sum+=Math.pow(m,4)*(1.79284291400159-.85373472095314*(a*a+h*h))*(a*xx[k]+h*yy[k]);
 }
 return 130*sum;
}
function drawAurora2D(){
 const w=canvas.width,h=canvas.height,t=time*.5;
 for(let x=0;x<w;x+=3){
  const u=(x+1.5)/w,idx=u<.5?0:1,f=u*2-idx;
  const chroma=stops[idx].map((c,k)=>Math.pow(c+(stops[idx+1][k]-c)*f,1.2)),peak=Math.max(...chroma);
  const wave=Math.exp(noise(u*2+t*.1,t*.25)*.5),gradient=ctx2d.createLinearGradient(0,0,0,h);
  for(let step=0;step<=20;step++){
   const y=step/20,intensity=.6*((1-y)*2-wave+.2),z=Math.max(0,Math.min(1,(intensity+.05)/.5)),alpha=z*z*(3-2*z);
   const coverage=Math.min(.94,Math.min(.86,alpha*(.55+.45*Math.max(0,Math.min(1,intensity))))*1.08);
   const rgb=chroma.map(c=>Math.round(255*(1+(c/peak-1)*coverage)));
   gradient.addColorStop(y,`rgb(${rgb.join(',')})`);
  }
  ctx2d.fillStyle=gradient;ctx2d.fillRect(x,0,3,h);
 }
}
function draw(){if(lost||failed)return;if(ctx2d){drawAurora2D();return;}if(!gl)return;gl.uniform1f(loc('uTime'),time*.5);gl.drawArrays(gl.TRIANGLES,0,3);}
function loop(now){frame=0;if(!visible||document.hidden||lost||failed)return;if(last)time+=Math.min((now-last)/1000,.1);last=now;
 if(now-lastDraw>=1000/(ctx2d?12:30)){mouse[0]+=(target[0]-mouse[0])*.06;mouse[1]+=(target[1]-mouse[1])*.06;draw();lastDraw=now;}
 if(!reduced.matches)frame=requestAnimationFrame(loop);}
function sync(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!visible||document.hidden||lost||failed)return;if(!program&&!ctx2d&&!setup())return;if(reduced.matches){draw();return;}frame=requestAnimationFrame(loop);}
const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(container);
new ResizeObserver(resize).observe(canvas);
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);fine.addEventListener('change',()=>{target[0]=target[1]=.5;sync();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;canvas.dataset.state='fallback';sync();});
canvas.addEventListener('webglcontextrestored',()=>{lost=false;failed=false;program=null;uniforms={};sync();});
window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',sync);
})();

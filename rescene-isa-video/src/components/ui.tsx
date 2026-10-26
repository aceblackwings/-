import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, sans, serif} from '../theme';
import {hasAsset} from '../timeline';

export const useSpring = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping}});
};

export const Fade: React.FC<{children: React.ReactNode; dur: number; inF?: number; outF?: number}> = ({children, dur, inF = 12, outF = 12}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, inF, dur - outF, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** 실제 사진(public/images) → AI 이미지(public/ai) → 대체 일러스트 순으로 표시. Ken Burns 움직임 포함 */
export const Media: React.FC<{slot: string; label: string; dur: number; zoom?: [number, number]; pan?: [number, number]; tint?: string; credit?: string}> = ({slot, label, dur, zoom = [1.05, 1.18], pan = [-30, 30], tint = C.night, credit}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease)});
  const s = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = pan[0] + (pan[1] - pan[0]) * t;
  const src = ['jpg', 'png', 'webp'].flatMap((e) => [`images/${slot}.${e}`, `ai/${slot}.${e}`]).find(hasAsset);
  const isAI = src?.startsWith('ai/');
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: tint}}>
      {src ? (
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s}) translateX(${x}px)`}} />
      ) : (
        <FallbackArt label={label} tint={tint} t={t} />
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)'}} />
      {src && (isAI || credit) && (
        <div style={{position: 'absolute', right: 36, top: 30, fontFamily: sans, fontSize: 20, color: C.dim, letterSpacing: 1}}>
          {isAI ? 'AI 생성 이미지 · 이해를 돕기 위한 재연' : credit}
        </div>
      )}
    </AbsoluteFill>
  );
};

const FallbackArt: React.FC<{label: string; tint: string; t: number}> = ({label, tint, t}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at ${30 + 40 * t}% 40%, ${tint} 0%, #07060c 75%)`}}>
    {[...Array(26)].map((_, i) => (
      <div key={i} style={{position: 'absolute', left: `${(i * 37) % 100}%`, top: `${(i * 53 + t * 40) % 100}%`, width: 6 + (i % 5) * 4, height: 6 + (i % 5) * 4, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(1px)'}} />
    ))}
    <div style={{position: 'absolute', left: 40, top: 30, fontFamily: sans, fontSize: 18, color: 'rgba(255,255,255,0.35)', border: '1px dashed rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: 8}}>
      사진 슬롯 · {label}
    </div>
  </AbsoluteFill>
);

export const LowerThird: React.FC<{name: string; role: string; delay?: number}> = ({name, role, delay = 20}) => {
  const p = useSpring(delay, 18);
  return (
    <div style={{position: 'absolute', left: 110, bottom: 230, transform: `translateX(${(1 - p) * -60}px)`, opacity: p}}>
      <div style={{width: 120 * p, height: 5, background: C.rose, marginBottom: 14}} />
      <div style={{fontFamily: serif, fontWeight: 900, fontSize: 64, color: C.ink}}>{name}</div>
      <div style={{fontFamily: sans, fontSize: 30, color: C.dim, marginTop: 6}}>{role}</div>
    </div>
  );
};

export const Chapter: React.FC<{no: string; title: string}> = ({no, title}) => {
  const p = useSpring(0, 20);
  const f = useCurrentFrame();
  const o = interpolate(f, [70, 95], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 110, top: 90, opacity: o * p, fontFamily: sans}}>
      <div style={{fontSize: 22, letterSpacing: 8, color: C.gold}}>CHAPTER {no}</div>
      <div style={{fontFamily: serif, fontWeight: 600, fontSize: 40, color: C.ink, marginTop: 6, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{title}</div>
    </div>
  );
};

export const BigText: React.FC<{children: React.ReactNode; delay?: number; size?: number; color?: string; top?: string}> = ({children, delay = 0, size = 120, color = C.ink, top = '42%'}) => {
  const p = useSpring(delay, 12);
  return (
    <div style={{position: 'absolute', width: '100%', top, textAlign: 'center', fontFamily: serif, fontWeight: 900, fontSize: size, color, transform: `scale(${0.85 + 0.15 * p})`, opacity: p, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>
      {children}
    </div>
  );
};

export const Counter: React.FC<{from: number; to: number; start: number; end: number; format: (n: number) => string; style?: React.CSSProperties}> = ({from, to, start, end, format, style}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [start, end], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return <div style={style}>{format(Math.round(v))}</div>;
};

export const Trophy: React.FC<{size?: number; glow?: boolean}> = ({size = 200, glow = true}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: glow ? `drop-shadow(0 0 ${size / 6}px ${C.gold})` : undefined}}>
    <defs>
      <linearGradient id="tg" x1="0" x2="1">
        <stop offset="0" stopColor="#a87a1d" />
        <stop offset="0.45" stopColor="#ffe7a8" />
        <stop offset="1" stopColor="#c8962e" />
      </linearGradient>
    </defs>
    <path d="M28 12h44v18c0 14-10 24-22 24S28 44 28 30z" fill="url(#tg)" />
    <path d="M28 18H14c0 14 8 20 16 20M72 18h14c0 14-8 20-16 20" fill="none" stroke="url(#tg)" strokeWidth="5" />
    <rect x="45" y="53" width="10" height="16" fill="url(#tg)" />
    <rect x="32" y="69" width="36" height="8" rx="2" fill="url(#tg)" />
    <rect x="26" y="77" width="48" height="10" rx="2" fill="url(#tg)" />
    <text x="50" y="38" textAnchor="middle" fontSize="18" fontWeight="900" fill="#5a3c0a" fontFamily="sans-serif">1</text>
  </svg>
);

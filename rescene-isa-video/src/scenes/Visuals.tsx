import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, MEMBERS, sans, serif} from '../theme';
import {BigText, Chapter, Counter, LowerThird, Media, Trophy, useSpring} from '../components/ui';

type P = {dur: number};

const Sfx: React.FC<{name: string; at: number; vol?: number}> = ({name, at, vol = 0.6}) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
  </Sequence>
);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* s01 — 무대 위 다섯, 무대 옆 한 사람 */
const ColdOpen: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const spot = interpolate(f, [0, 60], [0, 1], clamp);
  const side = interpolate(f, [dur * 0.55, dur * 0.75], [0, 1], clamp);
  const cam = interpolate(f, [dur * 0.5, dur * 0.8], [0, -380], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: '#050409'}}>
      <AbsoluteFill style={{transform: `translateX(${cam}px)`}}>
        <div style={{position: 'absolute', left: 560, top: 0, width: 800, height: 1080, opacity: spot, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,240,220,0.35) 0%, rgba(255,240,220,0.06) 55%, transparent 75%)'}} />
        {MEMBERS.map((m, i) => (
          <Silhouette key={m.name} x={700 + i * 120} glow={m.color} o={spot} h={330 + (i % 2) * 20} />
        ))}
        <div style={{position: 'absolute', left: 1390, top: 0, width: 360, height: 1080, opacity: side, background: 'radial-gradient(ellipse at 50% 70%, rgba(255,122,168,0.25), transparent 70%)'}} />
        <Silhouette x={1560} glow={C.rose} o={side} h={310} />
        <div style={{position: 'absolute', left: 1440, top: 900, width: 280, textAlign: 'center', fontFamily: sans, fontSize: 26, color: C.rose, opacity: side, letterSpacing: 4}}>+1</div>
      </AbsoluteFill>
      <Sfx name="heartbeat" at={10} vol={0.7} />
      <Sfx name="heartbeat" at={40} vol={0.6} />
      <Sfx name="cheer" at={60} vol={0.25} />
      <Sfx name="piano" at={Math.round(dur * 0.55)} vol={0.5} />
    </AbsoluteFill>
  );
};

const Silhouette: React.FC<{x: number; glow: string; o: number; h: number}> = ({x, glow, o, h}) => (
  <div style={{position: 'absolute', left: x - 45, top: 760 - h, width: 90, height: h + 40, opacity: o}}>
    <div style={{width: 62, height: 62, borderRadius: '50%', background: '#000', margin: '0 auto', boxShadow: `0 0 26px ${glow}`}} />
    <div style={{width: 90, height: h - 56, marginTop: 6, borderRadius: '44px 44px 12px 12px', background: '#000', boxShadow: `0 0 34px ${glow}66`}} />
  </div>
);

/* s02 — 타이틀 */
const Title: React.FC<P> = () => {
  const p = useSpring(6, 16);
  const q = useSpring(28, 18);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #2a1838 0%, ${C.bg} 70%)`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: sans, fontSize: 28, letterSpacing: 18, color: C.gold, opacity: q}}>RESCENE DOCUMENTARY</div>
      <div style={{fontFamily: serif, fontWeight: 900, fontSize: 132, color: C.ink, marginTop: 20, letterSpacing: 4, transform: `scale(${1.25 - 0.25 * p})`, opacity: p, filter: `blur(${(1 - p) * 12}px)`}}>
        다섯 명 곁의 한 사람
      </div>
      <div style={{width: 520 * q, height: 2, background: C.rose, margin: '34px 0'}} />
      <div style={{fontFamily: sans, fontSize: 40, color: C.dim, opacity: q}}>리센느와 김혜수 이사의 이야기</div>
      <Sfx name="whoosh" at={0} vol={0.5} />
      <Sfx name="impact" at={8} vol={0.8} />
    </AbsoluteFill>
  );
};

/* s03 — 버클리 */
const Berklee: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const swap = Math.round(dur * 0.45);
  return (
    <AbsoluteFill>
      {f < swap ? (
        <Media slot="isa_portrait" label="김혜수 이사 공식 사진" dur={swap} credit="사진: 더뮤즈엔터테인먼트" />
      ) : (
        <Sequence from={swap} layout="none">
          <Media slot="berklee_piano" label="피아노 건반 위의 손 (AI)" dur={dur - swap} tint="#1d2238" />
        </Sequence>
      )}
      <Chapter no="01" title="버클리에서 시작된 꿈" />
      {f < swap && <LowerThird name="김혜수" role="더뮤즈엔터테인먼트 이사 · 버클리 음대 출신" />}
      {f >= swap && (
        <Sequence from={swap + 20} layout="none">
          <Connection />
        </Sequence>
      )}
      <Sfx name="whoosh" at={swap - 6} vol={0.4} />
    </AbsoluteFill>
  );
};

const Connection: React.FC = () => {
  const p = useSpring(0, 18);
  const q = useSpring(25, 18);
  const card = (name: string, role: string, o: number, x: number) => (
    <div style={{opacity: o, transform: `translateY(${(1 - o) * 30}px)`, textAlign: 'center', width: 360, position: 'absolute', left: x, top: 380}}>
      <div style={{width: 150, height: 150, borderRadius: '50%', margin: '0 auto', border: `3px solid ${C.gold}`, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 60, color: C.ink}}>{name[0]}</div>
      <div style={{fontFamily: serif, fontWeight: 900, fontSize: 46, color: C.ink, marginTop: 18}}>{name}</div>
      <div style={{fontFamily: sans, fontSize: 26, color: C.dim}}>{role}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {card('이주헌', '대표 · 선배', p, 520)}
      <div style={{position: 'absolute', left: 860, top: 452, width: 200 * q, height: 4, background: C.gold}} />
      <div style={{position: 'absolute', left: 885, top: 395, fontFamily: sans, fontSize: 24, color: C.gold, opacity: q}}>버클리 선후배</div>
      {card('김혜수', '이사 · 후배', q, 1040)}
    </AbsoluteFill>
  );
};

/* s04 — 천만 원 */
const TenMillion: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const roles = Math.round(dur * 0.45);
  const coins = [0, 1, 2].map((i) => interpolate(f, [15 + i * 12, 45 + i * 12], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))}));
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, #15122a, ${C.bg})`}}>
      <Chapter no="02" title="천만 원의 회사" />
      {f < roles ? (
        <>
          {coins.map((c, i) => (
            <div key={i} style={{position: 'absolute', left: 660 + i * 220, top: 300 + (1 - c) * -200, opacity: c, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #ffe7a8, ${C.gold} 60%, #a87a1d)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontWeight: 900, fontSize: 30, color: '#4a3208', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
              {['A', 'B', 'C'][i]}
            </div>
          ))}
          <Counter from={0} to={10000000} start={55} end={110} format={(n) => `₩ ${n.toLocaleString('ko-KR')}`} style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: serif, fontWeight: 900, fontSize: 130, color: C.gold}} />
          <div style={{position: 'absolute', top: 730, width: '100%', textAlign: 'center', fontFamily: sans, fontSize: 36, color: C.dim, opacity: interpolate(f, [110, 130], [0, 1], clamp)}}>세 사람이 모은 자본금으로 법인 설립</div>
          {[...Array(18)].map((_, i) => <Sfx key={i} name="tick" at={55 + i * 3} vol={0.25} />)}
          <Sfx name="chime" at={112} vol={0.45} />
        </>
      ) : (
        <Sequence from={roles} layout="none">
          <Roles />
        </Sequence>
      )}
      <Sfx name="whoosh" at={roles - 6} vol={0.4} />
    </AbsoluteFill>
  );
};

const Roles: React.FC = () => {
  const items = [
    {who: '이주헌 대표', what: ['매니지먼트', '회사 운영'], color: C.sky},
    {who: '김혜수 이사', what: ['작곡 · 음악', '비주얼 · 콘셉트', '제작 전반', '밤에는 서류까지'], color: C.rose},
  ];
  return (
    <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 80}}>
      {items.map((it, i) => (
        <RoleCard key={it.who} {...it} delay={i * 14} />
      ))}
    </AbsoluteFill>
  );
};

const RoleCard: React.FC<{who: string; what: string[]; color: string; delay: number}> = ({who, what, color, delay}) => {
  const p = useSpring(delay, 16);
  const f = useCurrentFrame();
  return (
    <div style={{width: 560, padding: 44, borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: `2px solid ${color}55`, opacity: p, transform: `translateY(${(1 - p) * 50}px)`}}>
      <div style={{fontFamily: serif, fontWeight: 900, fontSize: 52, color}}>{who}</div>
      {what.map((w, j) => {
        const o = interpolate(f, [delay + 20 + j * 14, delay + 32 + j * 14], [0, 1], clamp);
        return (
          <div key={w} style={{fontFamily: sans, fontSize: 36, color: C.ink, marginTop: 22, opacity: o, transform: `translateX(${(1 - o) * 20}px)`}}>
            — {w}
          </div>
        );
      })}
    </div>
  );
};

/* s05 — 데뷔 */
const Debut: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const date = useSpring(0, 12);
  const names = Math.round(dur * 0.3);
  return (
    <AbsoluteFill>
      <Media slot="debut_group" label="리센느 데뷔 공식 사진" dur={dur} credit="사진: 더뮤즈엔터테인먼트" />
      <Chapter no="03" title="2024년 3월, 데뷔" />
      <div style={{position: 'absolute', right: 110, top: 120, fontFamily: serif, fontWeight: 900, fontSize: 150, color: C.ink, opacity: date, transform: `translateY(${(1 - date) * 40}px)`, textShadow: '0 10px 40px rgba(0,0,0,.6)'}}>
        2024.03
      </div>
      <div style={{position: 'absolute', bottom: 210, width: '100%', display: 'flex', justifyContent: 'center', gap: 34}}>
        {MEMBERS.map((m, i) => {
          const o = interpolate(f, [names + i * 12, names + i * 12 + 14], [0, 1], clamp);
          return (
            <div key={m.name} style={{opacity: o, transform: `translateY(${(1 - o) * 30}px)`, padding: '16px 34px', borderRadius: 999, background: 'rgba(0,0,0,0.5)', border: `2px solid ${m.color}`, fontFamily: sans, fontWeight: 700, fontSize: 40, color: m.color}}>
              {m.name}
            </div>
          );
        })}
      </div>
      <BigText delay={Math.round(dur * 0.62)} size={110} top="40%">RESCENE</BigText>
      <Sfx name="shutter" at={2} vol={0.5} />
      {MEMBERS.map((_, i) => <Sfx key={i} name="pop" at={names + i * 12} vol={0.35} />)}
      <Sfx name="impact" at={Math.round(dur * 0.62)} vol={0.5} />
    </AbsoluteFill>
  );
};

/* s06 — 인이어 */
const InEar: React.FC<P> = ({dur}) => {
  const q = useSpring(Math.round(dur * 0.25), 10);
  return (
    <AbsoluteFill>
      <Media slot="ai_inear" label="백스테이지, 인이어를 든 손 (AI)" dur={dur} tint="#222033" />
      <Chapter no="04" title="모든 것이 처음" />
      <div style={{position: 'absolute', left: '50%', top: '38%', transform: `translate(-50%,-50%) scale(${q})`, width: 220, height: 220, borderRadius: '50%', border: `6px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontWeight: 900, fontSize: 150, color: C.gold, background: 'rgba(0,0,0,0.35)'}}>?</div>
      <div style={{position: 'absolute', top: '56%', width: '100%', textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 46, color: C.ink, opacity: q}}>첫 음악 방송 · 인이어 착용법조차 몰랐던 날</div>
      <Sfx name="pop" at={Math.round(dur * 0.25)} vol={0.5} />
    </AbsoluteFill>
  );
};

/* s07 — 운동회 */
const SchoolField: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const dust = [...Array(40)];
  return (
    <AbsoluteFill>
      <Media slot="school_field" label="초등학교 운동회 무대 (AI 재연)" dur={dur} tint="#3a2a1a" zoom={[1.15, 1.02]} />
      <Chapter no="05" title="흙바닥 운동장의 무대" />
      {dust.map((_, i) => {
        const y = (900 - ((f * (1 + (i % 4))) % 500)) - (i % 7) * 30;
        return <div key={i} style={{position: 'absolute', left: (i * 97) % 1920, top: y, width: 4 + (i % 3) * 3, height: 4 + (i % 3) * 3, borderRadius: '50%', background: 'rgba(240,210,160,0.35)'}} />;
      })}
      <div style={{position: 'absolute', left: 110, top: 300, fontFamily: sans}}>
        {[
          ['조명', '없음'],
          ['응원봉', '없음'],
          ['무대', '흙바닥 운동장'],
          ['열정', '100%'],
        ].map(([k, v], i) => {
          const o = interpolate(f, [60 + i * 40, 75 + i * 40], [0, 1], clamp);
          const last = i === 3;
          return (
            <div key={k} style={{display: 'flex', gap: 30, marginBottom: 24, opacity: o, fontSize: 44, color: last ? C.gold : C.ink, fontWeight: last ? 900 : 400}}>
              <span style={{width: 180, color: C.dim}}>{k}</span>
              <span>{v}</span>
            </div>
          );
        })}
      </div>
      {[0, 1, 2, 3].map((i) => <Sfx key={i} name="pop" at={60 + i * 40} vol={i === 3 ? 0.6 : 0.3} />)}
    </AbsoluteFill>
  );
};

/* s08 — 904위 */
const Rank904: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const sink = interpolate(f, [Math.round(dur * 0.45), dur], [0, 260], {...clamp, easing: Easing.in(Easing.quad)});
  const p = useSpring(0, 16);
  return (
    <AbsoluteFill style={{background: '#08070d'}}>
      <Chapter no="06" title="904위" />
      <div style={{position: 'absolute', left: 160, top: 260, display: 'flex', gap: 40, alignItems: 'center', opacity: p}}>
        <div style={{width: 260, height: 260, borderRadius: 20, background: `linear-gradient(135deg, ${C.rose}, #6b3cff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontWeight: 900, fontSize: 48, color: '#fff', textAlign: 'center', lineHeight: 1.1}}>LOVE<br />ATTACK</div>
        <div style={{fontFamily: sans}}>
          <div style={{fontSize: 30, color: C.dim}}>2024.08 발매</div>
          <div style={{fontSize: 34, color: C.dim, marginTop: 10}}>일간 차트 출발 순위</div>
          <Counter from={1} to={904} start={30} end={80} format={(n) => `${n}위`} style={{fontFamily: serif, fontWeight: 900, fontSize: 170, color: C.ink}} />
        </div>
      </div>
      <div style={{position: 'absolute', right: 160, top: 160 - sink, width: 560, fontFamily: sans}}>
        {[...Array(14)].map((_, i) => {
          const rank = 897 + i;
          const me = rank === 904;
          return (
            <div key={i} style={{display: 'flex', gap: 24, padding: '12px 20px', marginBottom: 8, borderRadius: 10, background: me ? 'rgba(255,122,168,0.18)' : 'rgba(255,255,255,0.04)', color: me ? C.rose : 'rgba(255,255,255,0.3)', fontSize: 28, fontWeight: me ? 700 : 400}}>
              <span style={{width: 70}}>{rank}</span>
              <span>{me ? 'LOVE ATTACK · RESCENE' : '— — — — — —'}</span>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 60%, #08070d 92%)'}} />
      <Sfx name="riser" at={30} vol={0.25} />
      <Sfx name="impact" at={80} vol={0.4} />
    </AbsoluteFill>
  );
};

/* s09 — 우정의 연결망 */
const Bond: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const cx = 960;
  const cy = 500;
  const R = 300;
  const center = useSpring(Math.round(dur * 0.3), 12);
  const pulse = 1 + 0.04 * Math.sin(f / 8);
  return (
    <AbsoluteFill>
      <Media slot="waiting_room" label="대기실의 리센느와 이사 (공식 채널 캡처)" dur={dur} tint="#2a1630" zoom={[1.0, 1.08]} />
      <AbsoluteFill style={{background: 'rgba(10,6,18,0.55)'}} />
      <Chapter no="07" title="서로를 붙잡아 준 사람" />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {MEMBERS.map((m, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          const o = interpolate(f, [20 + i * 10, 40 + i * 10], [0, 1], clamp);
          const next = MEMBERS[(i + 1) % 5];
          const a2 = (((i + 1) % 5) / 5) * Math.PI * 2 - Math.PI / 2;
          const line = interpolate(f, [70 + i * 8, 100 + i * 8], [0, 1], clamp);
          return (
            <g key={m.name}>
              <line x1={x} y1={y} x2={x + (cx + R * Math.cos(a2) - x) * line} y2={y + (cy + R * Math.sin(a2) - y) * line} stroke={next.color} strokeOpacity={0.5} strokeWidth={3} />
              <line x1={cx} y1={cy} x2={cx + (x - cx) * center} y2={cy + (y - cy) * center} stroke={C.rose} strokeWidth={4} strokeOpacity={0.8} />
              <circle cx={x} cy={y} r={70 * o} fill="rgba(0,0,0,0.6)" stroke={m.color} strokeWidth={4} />
              <text x={x} y={y + 14} textAnchor="middle" fontFamily={sans} fontWeight={700} fontSize={38} fill={m.color} opacity={o}>{m.name}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={95 * center * pulse} fill={C.rose} fillOpacity={0.22} stroke={C.rose} strokeWidth={5} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily={serif} fontWeight={900} fontSize={44} fill={C.ink} opacity={center}>이사님</text>
        <text x={cx} y={cy + 40} textAnchor="middle" fontFamily={sans} fontSize={24} fill={C.dim} opacity={center}>a.k.a. 여섯 번째 멤버?</text>
      </svg>
      <Sfx name="heartbeat" at={Math.round(dur * 0.3)} vol={0.5} />
      {MEMBERS.map((_, i) => <Sfx key={i} name="tick" at={20 + i * 10} vol={0.3} />)}
    </AbsoluteFill>
  );
};

/* s10 — 역주행 */
const Viral: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const climbStart = Math.round(dur * 0.55);
  const rank = Math.round(interpolate(f, [climbStart, climbStart + 120], [904, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}));
  const cards = [
    {t: '원이 개인 유튜브', s: '사투리 · 갸루 콘셉트 화제', at: 20, x: 140, y: 250},
    {t: '“거제 야호!”', s: '미나미의 한마디가 밈으로', at: 80, x: 1180, y: 220},
    {t: '#리센느', s: '검색량 급증', at: 140, x: 260, y: 600},
    {t: 'LOVE ATTACK', s: '다시 듣기 · 입소문', at: 190, x: 1250, y: 620},
  ];
  const done = f > climbStart + 120;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #2b1440, ${C.bg} 75%)`}}>
      <Chapter no="08" title="뜻밖의 곳에서 시작된 변화" />
      {cards.map((c) => {
        const o = interpolate(f, [c.at, c.at + 14], [0, 1], clamp);
        const out = interpolate(f, [climbStart - 20, climbStart], [1, 0.15], clamp);
        return (
          <div key={c.t} style={{position: 'absolute', left: c.x, top: c.y, opacity: o * out, transform: `scale(${0.8 + 0.2 * o})`, padding: '26px 36px', borderRadius: 22, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', fontFamily: sans, minWidth: 440}}>
            <div style={{fontSize: 22, color: C.rose}}>♥ {(12 + c.at * 37).toLocaleString('ko-KR')} · 공유 {(c.at * 9 + 40).toLocaleString('ko-KR')}</div>
            <div style={{fontWeight: 900, fontSize: 46, color: C.ink, marginTop: 6}}>{c.t}</div>
            <div style={{fontSize: 28, color: C.dim, marginTop: 4}}>{c.s}</div>
          </div>
        );
      })}
      {f >= climbStart - 10 && (
        <div style={{position: 'absolute', width: '100%', top: 300, textAlign: 'center'}}>
          <div style={{fontFamily: sans, fontSize: 36, color: C.dim}}>멜론 TOP100 · LOVE ATTACK</div>
          <div style={{fontFamily: serif, fontWeight: 900, fontSize: done ? 300 : 240, color: done ? C.gold : C.ink, lineHeight: 1.1, textShadow: done ? `0 0 60px ${C.gold}` : 'none'}}>{rank}위</div>
          <div style={{fontFamily: sans, fontSize: 34, color: C.ink, opacity: done ? 1 : 0}}>2026년 7월 · 발매 약 2년 만의 정상</div>
        </div>
      )}
      {cards.map((c) => <Sfx key={c.t} name="ding" at={c.at} vol={0.4} />)}
      <Sfx name="riser" at={climbStart} vol={0.5} />
      {[...Array(30)].map((_, i) => <Sfx key={i} name="tick" at={climbStart + i * 4} vol={0.18} />)}
      <Sfx name="impact" at={climbStart + 120} vol={0.8} />
      <Sfx name="chime" at={climbStart + 122} vol={0.5} />
    </AbsoluteFill>
  );
};

/* s11 — 첫 1위 */
const FirstWin: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const trophy = useSpring(30, 10);
  const photoAt = Math.round(dur * 0.42);
  const confetti = [...Array(70)];
  return (
    <AbsoluteFill style={{background: '#0a0812'}}>
      {f >= photoAt && (
        <Sequence from={photoAt} layout="none">
          <Media slot="first_win" label="첫 1위 순간 (공식 채널 사진)" dur={dur - photoAt} tint="#3a1a2a" credit="사진: 리센느 공식 채널" />
        </Sequence>
      )}
      <Chapter no="09" title="첫 번째 1위" />
      {f < photoAt + 15 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: interpolate(f, [photoAt, photoAt + 15], [1, 0], clamp)}}>
          <div style={{fontFamily: sans, fontSize: 40, color: C.dim, letterSpacing: 6}}>2026. 07. 14</div>
          <div style={{transform: `scale(${trophy}) rotate(${(1 - trophy) * -20}deg)`}}><Trophy size={300} /></div>
          <div style={{fontFamily: serif, fontWeight: 900, fontSize: 80, color: C.gold, opacity: trophy}}>데뷔 후 첫 음악방송 1위</div>
          <div style={{fontFamily: sans, fontSize: 36, color: C.ink, marginTop: 12, opacity: trophy}}>Pretty Girl · 데뷔 약 2년 4개월</div>
        </AbsoluteFill>
      )}
      {confetti.map((_, i) => {
        const t = f - 30 - (i % 10) * 3;
        if (t < 0) return null;
        const x = 960 + Math.sin(i * 12.9) * (300 + t * 9);
        const y = 400 - Math.cos(i * 4.1) * 200 + t * t * 0.09 - 120;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 22, background: [C.gold, C.rose, C.sky, '#fff'][i % 4], transform: `rotate(${t * 9 + i * 20}deg)`, opacity: Math.max(0, 1 - t / 140)}} />;
      })}
      <Sfx name="riser" at={0} vol={0.4} />
      <Sfx name="impact" at={30} vol={0.9} />
      <Sfx name="chime" at={32} vol={0.6} />
      <Sfx name="cheer" at={34} vol={0.55} />
      <Sfx name="whoosh" at={photoAt - 4} vol={0.35} />
    </AbsoluteFill>
  );
};

/* s12 — 트로피 3개 + 홍보대사 */
const Trophies: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const list = [
    {d: '07.14', p: 'SBS Life 더쇼', s: 'Pretty Girl'},
    {d: '07.25', p: 'MBC 쇼! 음악중심', s: 'Pretty Girl'},
    {d: '07.26', p: 'SBS 인기가요', s: 'LOVE ATTACK'},
  ];
  const badge = useSpring(Math.round(dur * 0.62), 12);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #1b1230, ${C.bg})`}}>
      <Chapter no="10" title="멈추지 않는 기세" />
      <div style={{position: 'absolute', top: 260, width: '100%', display: 'flex', justifyContent: 'center', gap: 70}}>
        {list.map((it, i) => {
          const o = interpolate(f, [20 + i * 25, 40 + i * 25], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
          return (
            <div key={it.d} style={{width: 400, textAlign: 'center', opacity: Math.min(1, o), transform: `translateY(${(1 - o) * 60}px)`, padding: 30, borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.gold}44`}}>
              <Trophy size={130} glow={false} />
              <div style={{fontFamily: serif, fontWeight: 900, fontSize: 56, color: C.gold}}>{it.d}</div>
              <div style={{fontFamily: sans, fontSize: 30, color: C.ink, marginTop: 8}}>{it.p}</div>
              <div style={{fontFamily: sans, fontSize: 26, color: C.dim}}>{it.s}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 800, width: '100%', textAlign: 'center', opacity: badge, transform: `scale(${0.8 + 0.2 * badge})`}}>
        <span style={{fontFamily: sans, fontWeight: 900, fontSize: 44, color: '#0b0a12', background: C.sky, padding: '16px 40px', borderRadius: 999}}>거제시 홍보대사 위촉</span>
      </div>
      {list.map((_, i) => <Sfx key={i} name="impact" at={20 + i * 25} vol={0.45} />)}
      <Sfx name="chime" at={Math.round(dur * 0.62)} vol={0.4} />
    </AbsoluteFill>
  );
};

/* s13 — 엔딩 */
const Ending: React.FC<P> = ({dur}) => {
  const f = useCurrentFrame();
  const lines = ['천만 원으로 시작한 회사', '아무도 몰랐던 다섯 명', '그리고 그 곁을 지킨 한 사람'];
  const final = Math.round(dur * 0.5);
  const fadeOut = interpolate(f, [dur - 45, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 60%, #2a1838, #050409 75%)`, opacity: fadeOut}}>
      <Media slot="ending_group" label="리센느와 이사 단체 사진 (공식)" dur={dur} tint="#2a1838" zoom={[1.0, 1.1]} credit="사진: 더뮤즈엔터테인먼트" />
      <AbsoluteFill style={{background: 'rgba(5,4,9,0.55)'}} />
      {f < final ? (
        <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center'}}>
          {lines.map((l, i) => {
            const o = interpolate(f, [i * 45, i * 45 + 20], [0, 1], clamp);
            return <div key={l} style={{fontFamily: serif, fontWeight: 600, fontSize: 64, color: i === 2 ? C.rose : C.ink, opacity: o, marginBottom: 30, transform: `translateY(${(1 - o) * 20}px)`}}>{l}</div>;
          })}
        </div>
      ) : (
        <Sequence from={final} layout="none">
          <BigText size={96} top="36%">리센느의 이야기는</BigText>
          <BigText size={96} top="50%" delay={18} color={C.gold}>아직 끝나지 않았습니다</BigText>
        </Sequence>
      )}
      <Sfx name="piano" at={0} vol={0.4} />
      <Sfx name="whoosh" at={final - 6} vol={0.35} />
    </AbsoluteFill>
  );
};

export const VISUALS: Record<string, React.FC<P>> = {
  coldOpen: ColdOpen,
  title: Title,
  berklee: Berklee,
  tenMillion: TenMillion,
  debut: Debut,
  inEar: InEar,
  schoolField: SchoolField,
  rank904: Rank904,
  bond: Bond,
  viral: Viral,
  firstWin: FirstWin,
  trophies: Trophies,
  ending: Ending,
};

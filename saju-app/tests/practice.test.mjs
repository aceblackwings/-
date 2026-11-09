import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPractice, choose, completePractice, undoPractice, restPractice, totalPoints, practiceStage, weekDays, monthDays, monthShift, habitTotals, IDEAS } from '../js/practice.js';
import { practiceCard, recordsHTML } from '../js/practice-ui.js';
const day='2026-11-09';
const fresh=()=>choose(createPractice({today:day}),IDEAS[0]);
test('기존 성장과 두 습관 기록을 복사해 보관, 재지급 없음',()=>{
 const legacy={list:['독서','정리'],checks:{'2026-11-08':[true,false]}};
 const s=createPractice({points:15,stage:5,legacy,today:day});
 assert.equal(totalPoints(s),52);assert.equal(practiceStage(s),5);assert.equal(s.current,null);
 legacy.list[0]='변경';assert.equal(s.legacy.list[0],'독서');assert.deepEqual(s.entries,{});
});
test('실제 실천 하나에 하루 한 번 4점, 선택만으로 보상 없음',()=>{
 const s=fresh();assert.equal(totalPoints(s),0);
 const r=completePractice(s,day);assert.equal(totalPoints(r.store),4);assert.equal(practiceStage(r.store),2);
 assert.equal(completePractice(r.store,day).changed,false);assert.equal(totalPoints(s),0);
});
test('중간에 습관을 바꿔도 날짜별 이름과 하루 한 번 제한 유지',()=>{
 let s=completePractice(fresh(),day).store;s=choose(s,IDEAS[1]);
 assert.equal(s.entries[day].title,IDEAS[0].title);assert.equal(completePractice(s,day).changed,false);
 s=completePractice(s,'2026-11-10').store;assert.equal(s.entries['2026-11-10'].title,IDEAS[1].title);
 assert.equal(totalPoints(s),8);
});
test('과거 기록 취소·재취소·재실천에도 점수 일치',()=>{
 let s=completePractice(fresh(),day).store;s=completePractice(s,'2026-11-10').store;
 s=undoPractice(s,day).store;assert.equal(totalPoints(s),4);assert.equal(undoPractice(s,day).changed,false);
 s=completePractice(s,day).store;assert.equal(totalPoints(s),8);assert.equal(Object.keys(s.entries).length,2);
});
test('취소하면 새 성장만 되돌리고 이전 지신은 보존',()=>{
 let s=choose(createPractice({points:50,stage:4,today:day}),IDEAS[0]);s=completePractice(s,day).store;
 assert.equal(practiceStage(s),5);s=undoPractice(s,day).store;assert.equal(practiceStage(s),4);assert.equal(totalPoints(s),50);
});
test('쉬기·공백은 감점 없고 쉬었다가 실천 가능',()=>{
 let s=completePractice(fresh(),day).store;s=restPractice(s,'2026-11-10');assert.equal(totalPoints(s),4);
 s=completePractice(s,'2026-11-10').store;assert.equal(s.rests['2026-11-10'],undefined);assert.equal(totalPoints(s),8);
});
test('날짜 없는 실천·선택 없는 실천·불가능한 날짜 거절',()=>{
 assert.equal(completePractice(createPractice(),day).changed,false);
 for(const d of ['','2026-02-30','2026-1-1','<script>'])assert.equal(completePractice(fresh(),d).changed,false);
});
test('월요일 기준 주간·연말 경계·윤년·월 이동',()=>{
 assert.deepEqual(weekDays('2027-01-01'),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
 assert.equal(monthDays('2028-02').length,29);assert.equal(monthDays('2027-02').length,28);
 assert.equal(monthDays('2026-13').length,0);assert.equal(monthShift('2026-12',1),'2027-01');assert.equal(monthShift('2027-01',-1),'2026-12');
});
test('월별 습관별 집계는 당시 이름과 해당 월만 사용',()=>{
 let s=completePractice(fresh(),day).store;s=choose(s,IDEAS[1]);s=completePractice(s,'2026-11-10').store;s=completePractice(s,'2026-12-01').store;
 assert.deepEqual(habitTotals(s,'2026-11'),[{title:IDEAS[0].title,days:1},{title:IDEAS[1].title,days:1}]);
});
test('화면의 사용자 입력 이스케이프, 미래 날짜 비활성, 기록 없는 날 단정 안 함',()=>{
 let s=choose(createPractice(),{title:'<img src=x onerror=alert(1)>',cue:'<script>'});s=completePractice(s,day).store;
 const html=recordsHTML({store:s,today:day,month:'2026-11',selected:day});assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
 assert.match(html,/data-pr-day="2026-11-10"[^>]*disabled/);assert.ok(html.includes('기록이 없는 날'));
 const card=practiceCard({store:s,today:day,picture:'',progress:''});assert.ok(card.includes('오늘은 여기까지'));assert.ok(!card.includes('<img'));
});
test('충분히 긴 기록을 유지하고 휴식이나 월 변경이 삭제하지 않음',()=>{
 let s=fresh();for(let m=1;m<=12;m++)for(const d of monthDays(`2026-${String(m).padStart(2,'0')}`))s=completePractice(s,d).store;
 assert.equal(Object.keys(s.entries).length,365);assert.equal(totalPoints(s),1460);
});
test('진화 기록은 실제 실천에서 계산하고 취소하면 함께 정정',async()=>{
 const {milestones}=await import('../js/practice.js');let s=fresh();s=completePractice(s,day).store;
 assert.deepEqual(milestones(s),[{day,stage:2,title:IDEAS[0].title,count:1}]);
 assert.deepEqual(milestones(undoPractice(s,day).store),[]);
});
test('이전 밥 점수로 이미 도달한 단계는 새 진화로 기록하지 않음',async()=>{
 const {milestones}=await import('../js/practice.js');let s=choose(createPractice({points:15,stage:1,today:day}),IDEAS[0]);
 s=completePractice(s,day).store;assert.deepEqual(milestones(s),[]);
});

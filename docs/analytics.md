# 티스토리 유입과 결과 도달 확인

Cloudflare Workers Analytics Engine의 `zodiac12_hits`에서 아래 SQL을 실행하면 최근 7일 동안 유입별로 화면마다 몇 번 도달했는지 볼 수 있습니다.

```sql
SELECT blob2 AS src, blob3 AS campaign, blob1 AS event, SUM(_sample_interval) AS n
FROM zodiac12_hits
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY src, campaign, event
ORDER BY campaign, event
```

- `land`는 첫 화면, `saju`는 첫 사주 요약, `summon`은 수호신 강림 화면입니다.
- 글마다 `utm_source=tistory`와 `utm_campaign=2027-rabbit`처럼 이름을 붙이세요. 공통 캠페인을 쓰는 경우 `utm_content=post_12`처럼 글마다 다른 값을 붙이세요. 티스토리에서는 글별 값이 있으면 캠페인 대신 그 값으로 집계합니다. 이름에는 영문·숫자·하이픈·밑줄을 쓰세요.
- 브라우저 저장 공간에 보낸 단계 이름을 기억하므로 같은 브라우저에서는 단계마다 한 번만 셉니다. 날짜 범위가 짧으면 유입과 결과가 서로 다른 집계 기간에 들어갈 수 있습니다. 유입 이름은 세션에 저장되므로 새 탭이나 새 세션에서 이어 보면 이전 글에 연결되지 않을 수 있습니다.
- 운영 배포 후 테스트용 글 이름을 붙인 URL을 새 브라우저 프로필에서 열고 가입 흐름을 진행하세요. SQL에서 해당 이름으로 세 단계가 보이는지 확인하면 됩니다.

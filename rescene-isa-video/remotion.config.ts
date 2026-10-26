import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
// 클라우드 컨테이너에 설치된 Chromium 사용 (로컬에서는 이 줄을 지워도 됩니다)
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);

# FabSight MES · 실시간 데이터 분석 대시보드 (포트폴리오)

반도체/디스플레이 팹의 MES(Manufacturing Execution System)를 모티브로 한 개인 포트폴리오 프로젝트입니다.
대용량 시계열 데이터 시각화(SciChart.js)와 3D 설비 배치 뷰(Three.js)를 중심으로 구성했습니다.

## 기술 스택

- **Vite + Vue 3 + TypeScript** (Composition API, `<script setup>`)
- **Tailwind CSS v4** — CSS 변수 기반 다크 산업용 테마
- **shadcn/ui 스타일 컴포넌트** — `class-variance-authority` + `tailwind-merge`로 직접 구성한 Button / Badge / Card
- **SciChart.js** — WebAssembly/WebGL 기반 대용량 실시간 시계열 차트
- **Three.js** — 설비(챔버) 배치 3D 시각화, OrbitControls
- **vue-router** — 대시보드 / 데이터 분석 / 설비 3D 뷰 3개 페이지

## 폴더 구조

```
src/
  components/
    charts/       # SciChart 실시간 차트, 범례
    dashboard/    # KPI 카드, radial gauge, 설비 리스트
    layout/       # 사이드바, 상단바, 앱 셸
    three/        # Three.js 3D 설비 씬
    ui/           # button / badge / card 프리미티브
  composables/
    useMockSensorData.ts   # 랜덤워크 기반 실시간 센서 목업 스트림
    useEquipmentFleet.ts   # 설비 상태 목업 (RUN/IDLE/ALARM)
  pages/
    DashboardView.vue      # KPI + 실시간 트렌드 차트 + 설비 현황
    AnalysisView.vue       # 대용량(5,000pt) 히스토리 + 지표별 상세 차트
    EquipmentView.vue      # Three.js 3D 설비 배치 뷰
  types/mes.ts   # 공통 타입 (Equipment, SensorSeriesConfig 등)
```

## 실행 방법

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # 타입체크 + 프로덕션 빌드
```

## SciChart.js 라이선스 안내

현재 `SciChartSurface.UseCommunityLicense()`로 무료 커뮤니티 라이선스를 사용합니다.
포트폴리오/데모용으로는 워터마크가 표시될 수 있으며, 정식 사용 시
scichart.com/licensing-scichart-js 에서 무료 커뮤니티/트라이얼 키를 발급받아
`src/components/charts/RealtimeSensorChart.vue`의 `SciChartSurface.setRuntimeLicenseKey(...)`
로 교체하면 됩니다.

## 데이터에 대해

모든 설비 상태와 센서 값(Chamber Temp / RF Power / Pressure / Particle Count)은
`composables/useMockSensorData.ts`, `useEquipmentFleet.ts`에서 랜덤워크 방식으로
생성한 가상 데이터입니다. 실제 설비나 회사 데이터를 사용하지 않습니다.

## 다음에 해볼 만한 것들

- Pinia로 설비/알람 상태 전역 관리
- WebSocket 연동으로 실제 스트리밍 데이터 소스 교체
- SciChart의 히트맵/캔들스틱 등 추가 시리즈 타입으로 결함맵(defect map) 페이지 추가
- Three.js에서 클릭한 설비를 대시보드와 연동해 상세 패널 열기

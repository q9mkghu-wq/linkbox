# 📺 LinkBox — 유튜브 링크 보관함

Firebase + Next.js + Vercel로 구축한 유튜브 링크 저장 & 분류 앱

---

## 🚀 배포 방법 (처음부터 끝까지)

### 1단계 — Firebase 프로젝트 만들기

1. [console.firebase.google.com](https://console.firebase.google.com) 접속
2. **프로젝트 추가** 클릭 → 이름 입력 (예: `linkbox`)
3. Google Analytics는 선택사항 (꺼도 됨)
4. 프로젝트 생성 완료 후:

**Firestore 데이터베이스 만들기:**
- 왼쪽 메뉴 → **Firestore Database** → **데이터베이스 만들기**
- **테스트 모드** 선택 (나중에 보안 규칙 설정 가능)
- 리전은 `asia-northeast3 (서울)` 선택

**앱 등록:**
- 프로젝트 개요 → **웹 앱 추가** (</> 아이콘)
- 앱 닉네임 입력 → **앱 등록**
- 아래 `firebaseConfig` 값을 복사해 두기!

---

### 2단계 — 환경변수 파일 만들기

프로젝트 루트에 `.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

`.env.local`을 열고 Firebase에서 복사한 값 붙여넣기:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=linkbox-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=linkbox-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=linkbox-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

> ⚠️ `.env.local`은 절대 GitHub에 올리지 마세요! (`.gitignore`에 이미 포함됨)

---

### 3단계 — 로컬 실행 테스트

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 — 정상 동작 확인!

---

### 4단계 — GitHub에 올리기

```bash
# GitHub에서 새 레포 만들기 (linkbox 이름으로)
git init
git add .
git commit -m "🎉 초기 커밋"
git remote add origin https://github.com/YOUR_USERNAME/linkbox.git
git branch -M main
git push -u origin main
```

---

### 5단계 — Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 계정으로 로그인
2. **Add New → Project** → `linkbox` 레포 선택
3. **Environment Variables** 섹션에서 `.env.local`의 값들을 하나씩 추가
4. **Deploy** 클릭!

Vercel이 자동으로 빌드 & 배포합니다. 이후 GitHub에 push할 때마다 자동 재배포!

---

## 📁 프로젝트 구조

```
linkbox/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   ├── page.tsx        # 메인 앱
│   │   ├── page.module.css # 스타일
│   │   └── globals.css     # 전역 스타일
│   └── lib/
│       └── firebase.ts     # Firebase 설정 & CRUD
├── .env.local.example      # 환경변수 템플릿
├── .gitignore
├── next.config.js
└── package.json
```

## ✨ 기능

- 📂 분류(카테고리) 추가/편집/삭제
- 🔗 유튜브 링크 저장 (썸네일 자동 로드)
- 🔍 제목 검색
- 🎨 분류별 색상 지정
- ☁️ Firebase Firestore 실시간 동기화
- 📱 모바일 반응형

## 🔒 Firestore 보안 규칙 (배포 후 설정 권장)

Firebase 콘솔 → Firestore → 규칙 탭에서:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개인 사용: 인증 없이 모두 허용 (간단하게)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

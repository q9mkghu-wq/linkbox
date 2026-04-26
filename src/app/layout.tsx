import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '링크 보관함',
  description: '유튜브 링크를 분류별로 저장하고 관리하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

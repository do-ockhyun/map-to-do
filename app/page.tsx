import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Map To Do에 오신 것을 환영합니다!</h1>
      <p style={{ fontSize: 18, marginBottom: 40 }}>마인드맵 기반 할 일 관리 서비스를 시작해보세요.</p>
      <Link href="/mindmap">
        <Button size="lg">마인드맵으로 시작하기</Button>
      </Link>
    </div>
  )
}

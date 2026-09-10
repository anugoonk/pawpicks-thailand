import Link from "next/link";

export default function NotFound() {
  return (
    <main id="top">
      <section className="section" style={{ textAlign: "center" }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "12px 0" }}>
          ไม่พบหน้านี้
        </h1>
        <p style={{ color: "var(--muted)" }}>
          หน้าที่คุณกำลังหาอาจถูกย้ายหรือไม่มีอยู่แล้ว
        </p>
        <p style={{ marginTop: 24 }}>
          <Link className="primary-button" href="/">
            กลับหน้าแรก <span>→</span>
          </Link>
        </p>
      </section>
    </main>
  );
}

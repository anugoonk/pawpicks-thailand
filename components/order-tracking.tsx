import { STATUS_TH, isClosedStatus, isPaidStatus, isShippedStatus } from "@/lib/shipping";

export function OrderTracking({ status, shippingCarrier, trackingNumber, shippedAt }: {
  status: string; shippingCarrier: string | null; trackingNumber: string | null; shippedAt: string | null;
}) {
  const step = isShippedStatus(status) ? 3 : isPaidStatus(status) ? 2 : 1;
  return <div className="order-tracking">
    {!isClosedStatus(status) ? <ol className="shipping-progress" aria-label="สถานะคำสั่งซื้อ">
      {["รับคำสั่งซื้อ", "ชำระแล้ว / เตรียมจัดส่ง", "ส่งพัสดุแล้ว"].map((label, index) => <li key={label} className={index < step ? "complete" : ""} aria-current={index === step - 1 ? "step" : undefined}><span>{index + 1}</span>{label}</li>)}
    </ol> : <p>{STATUS_TH[status]}</p>}
    {trackingNumber ? <div className="tracking-details">
      <strong>{shippingCarrier}</strong><p>เลขพัสดุ: <span className="tracking-number">{trackingNumber}</span></p>
      {shippedAt ? <p>วันที่ส่ง: {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(shippedAt))}</p> : null}
      <p className="field-help">ใช้เลขพัสดุนี้ตรวจสอบกับบริษัทขนส่ง</p>
    </div> : <p className="field-help">{isPaidStatus(status) && !isShippedStatus(status) ? "ร้านกำลังเตรียมสินค้า เลขพัสดุจะแสดงที่นี่เมื่อจัดส่ง" : isShippedStatus(status) ? "กรุณาติดต่อร้านเพื่อขอเลขพัสดุ" : "เลขพัสดุจะแสดงหลังชำระเงินและจัดส่งแล้ว"}</p>}
  </div>;
}

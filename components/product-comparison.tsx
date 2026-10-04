import Link from "next/link";
import { AffiliateLink } from "@/components/affiliate-link";
import { buildComparison } from "@/lib/compare";
import { productAffiliateUrl } from "@/lib/product-view";
import type { Product } from "@/lib/types";

/**
 * Side-by-side comparison of 2+ products. Rows appear only when some product
 * has real data for them; a product without data shows "ไม่มีข้อมูล".
 */
export function ProductComparison({
  products,
  placement = "comparison",
}: {
  products: Product[];
  placement?: string;
}) {
  if (products.length < 2) return null;
  const rows = buildComparison(products);
  return (
    <div className="compare-wrap">
      <table className="compare-table">
        <caption className="sr-only">ตารางเปรียบเทียบสินค้า</caption>
        <thead>
          <tr>
            <th scope="col">รายการ</th>
            {products.map((p) => (
              <th scope="col" key={p.id}>
                <Link href={`/products/${p.slug}`}>{p.shortName || p.name}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">{r.label}</th>
              {r.cells.map((c, i) => (
                <td key={i} className={c ? undefined : "compare-empty"}>
                  {c ?? "ไม่มีข้อมูล"}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row">ลิงก์ร้านค้า</th>
            {products.map((p) => (
              <td key={p.id}>
                <AffiliateLink
                  className="shopee-link"
                  href={productAffiliateUrl(p)}
                  merchant={p.merchant}
                  productId={p.id}
                  productName={p.name}
                  placement={placement}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className="compare-note">ยังไม่มีข้อมูลที่ตรวจสอบแล้วสำหรับเปรียบเทียบ</p>
      ) : null}
    </div>
  );
}

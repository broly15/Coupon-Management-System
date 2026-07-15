// scripts/validate-qr.ts
// Run with `ts-node scripts/validate-qr.ts` after building.
import { getCoupons } from "../lib/services/couponService";
import { getCouponUrl } from "../lib/utils/qrGenerator";

function validate() {
  const coupons = getCoupons();
  console.log(`Validating ${coupons.length} coupon QR URLs:`);
  coupons.forEach((c) => {
    try {
      const url = getCouponUrl(c.id);
      console.log(`- ${c.id}: ${url}`);
    } catch (err) {
      console.error(`Error for coupon ${c.id}:`, err);
    }
  });
}

validate();

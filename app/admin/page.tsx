import type { Metadata } from "next";
import { AdminClient } from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Internal Coupon Management System Controls.",
};

export default function AdminPage() {
  return <AdminClient />;
}

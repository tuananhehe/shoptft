import { redirect } from "next/navigation";

// /admin/customers → /admin/users (canonical route kept for backwards compat)
export default function AdminCustomersRedirectPage() {
  redirect("/admin/users");
}

import { redirect } from "next/navigation";

// /admin/users -> /admin/customers (Canonical CRM route)
export default function AdminUsersRedirectPage() {
  redirect("/admin/customers");
}

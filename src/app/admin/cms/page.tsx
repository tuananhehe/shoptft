import { redirect } from "next/navigation";

// /admin/cms → /admin/homepage (canonical route kept for backwards compat)
export default function AdminCmsRedirectPage() {
  redirect("/admin/homepage");
}

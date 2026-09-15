import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaiKhoanAliasPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/acc/${encodeURIComponent(resolvedParams.id)}`);
}

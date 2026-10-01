import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaiKhoanAliasPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  permanentRedirect(`/acc/${encodeURIComponent(resolvedParams.id)}`);
}

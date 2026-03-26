import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { EvaluationForm } from "@/components/EvaluationForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");

  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  const isLocalhost = host.includes("localhost");
  const protocol = isLocalhost ? "http" : "https";

  return `${protocol}://${host}`;
}

async function getEvaluation(id: string) {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/evaluations/${id}?ts=${Date.now()}`, {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function EvaluationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evaluation = await getEvaluation(id);

  if (!evaluation) {
    notFound();
  }

  return <EvaluationForm initialData={evaluation} />;
}
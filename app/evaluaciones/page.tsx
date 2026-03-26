import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { EvaluationForm } from "@/components/EvaluationForm";

async function getBaseUrl() {
  const h = headers();
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

  const res = await fetch(`${baseUrl}/api/evaluations/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function EvaluationEditPage({
  params,
}: {
  params: { id: string };
}) {
  const evaluation = await getEvaluation(params.id);

  if (!evaluation) {
    notFound();
  }

  return <EvaluationForm initialData={evaluation} />;
}
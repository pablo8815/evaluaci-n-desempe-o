import { notFound } from "next/navigation";
import { EvaluationForm } from "@/components/EvaluationForm";

async function getEvaluation(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/evaluations/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return null;
  }
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
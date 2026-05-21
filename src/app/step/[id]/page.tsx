"use client";

import { QuizContainer } from "@/components/funnel/QuizContainer";
import { useParams } from "next/navigation";

export default function QuizStepPage() {
  const params = useParams();
  const stepId = parseInt(params.id as string) || 1;

  return (
    <main className="min-h-screen bg-background">
      <QuizContainer stepId={stepId} />
    </main>
  );
}

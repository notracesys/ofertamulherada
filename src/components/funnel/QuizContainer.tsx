"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ArrowRight, Star, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { generatePersonalizedAfricanMethodPlan, type GeneratePersonalizedAfricanMethodPlanInput, type GeneratePersonalizedAfricanMethodPlanOutput } from "@/ai/flows/generate-personalized-african-method-plan";
import { QuizStep } from "./QuizStep";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 19;
const STORAGE_KEY = "fitness_fem_quiz_state";

const INITIAL_STATE: GeneratePersonalizedAfricanMethodPlanInput = {
  ageRange: "30 a 39 anos",
  pilatesExperience: "",
  bodyDescription: "",
  dreamBody: "",
  mainConcern: "",
  goalTransformation: "",
  weightDifficulty: "",
  increaseRegion: "",
  dedicationTime: "",
  exerciseFrequency: "",
  walkingFrequency: "",
  energyLevel: "",
  emotionalGoal: "",
  flexibility: "",
  physicalLimitations: "",
};

interface QuizContainerProps {
  stepId: number;
}

export function QuizContainer({ stepId }: QuizContainerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quizOutput, setQuizOutput] = useState<GeneratePersonalizedAfricanMethodPlanOutput | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [state, setState] = useState<GeneratePersonalizedAfricanMethodPlanInput>(INITIAL_STATE);
  const [selectedLimitations, setSelectedLimitations] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setState(parsed); 
        if (parsed.physicalLimitations) {
          setSelectedLimitations(parsed.physicalLimitations.split(", "));
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isClient) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  }, [state, isClient]);

  const nextStep = () => {
    if (stepId < TOTAL_STEPS) {
      router.push(`/step/${stepId + 1}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => { if (stepId > 1) router.push(`/step/${stepId - 1}`); };

  const updateState = (key: string, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLimitation = (label: string) => {
    let newSelected: string[];
    if (label === "Nenhum dos itens acima") {
      newSelected = ["Nenhum dos itens acima"];
    } else {
      newSelected = selectedLimitations.filter(item => item !== "Nenhum dos itens acima");
      if (newSelected.includes(label)) {
        newSelected = newSelected.filter(item => item !== label);
      } else {
        newSelected = [...newSelected, label];
      }
    }
    setSelectedLimitations(newSelected);
    updateState("physicalLimitations", newSelected.join(", "));
  };

  const finishQuiz = async () => {
    setLoading(true);
    try {
      const result = await generatePersonalizedAfricanMethodPlan(state);
      setQuizOutput(result);
      setTimeout(() => router.push(`/step/${TOTAL_STEPS}`), 2000);
    } catch (error) {
      console.error(error);
      router.push(`/step/${TOTAL_STEPS}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  const progress = (stepId / TOTAL_STEPS) * 100;

  const renderStep = () => {
    switch (stepId) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold leading-tight text-foreground">Qual sua idade?</h1>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "18 a 29 anos", imageUrl: "/18-29y.webp" },
                { label: "30 a 39 anos", imageUrl: "/29-39y.webp" },
                { label: "40 a 49 anos", imageUrl: "/39-49y.webp" },
                { label: "50+ anos", imageUrl: "/+50y.webp" }
              ].map((range) => (
                <Card 
                  key={range.label} 
                  className="p-0 flex flex-col items-center cursor-pointer border-2 border-primary/10 transition-all hover:scale-[1.02] overflow-hidden bg-white hover:border-primary/40"
                  onClick={() => { updateState("ageRange", range.label); nextStep(); }}
                >
                  <div className="relative w-full aspect-square">
                    <Image src={range.imageUrl} alt={range.label} fill className="object-cover" />
                  </div>
                  <div className="py-4 w-full text-center">
                    <span className="font-bold text-lg text-primary">{range.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 text-center px-2">
            <h2 className="text-4xl font-black text-primary leading-none uppercase tracking-tight">
              Mais de 500.000 mulheres
            </h2>
            <p className="text-lg text-muted-foreground leading-snug">
              com <span className="font-bold text-foreground">+20 anos</span> já experimentaram o nosso programa feminino de definição
            </p>
            <div className="relative w-full aspect-[4/5] max-w-[280px] mx-auto">
              <Image src="/mulheres.webp" alt="Mulheres" fill className="object-contain" priority />
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-wide bg-primary text-white">
              Continuar
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Você já experimentou o <span className="text-primary">Programa Feminino de Definição</span> antes?
            </h2>
            <div className="space-y-4">
              {[
                { label: "Sim, já experimentei", value: "sim" },
                { label: "Não, eu nunca experimentei", value: "nao" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.pilatesExperience === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-8 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6",
                    state.pilatesExperience === opt.value ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-primary/10 hover:border-primary/40 bg-white"
                  )}
                  onClick={() => { 
                    updateState("pilatesExperience", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold", state.pilatesExperience === opt.value ? "text-white" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    state.pilatesExperience === opt.value ? "bg-white border-white text-primary" : "border-primary/20"
                  )}>
                    {state.pilatesExperience === opt.value && <Check className="w-4 h-4" />}
                  </div>
                </Button>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-[600px] mx-auto mt-8">
              <Image src="/step4.webp" alt="Programa" fill className="object-contain" />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-primary leading-tight">Qual transformação você mais deseja ver no espelho?</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Barriga", imageUrl: "/barriga.webp" },
                { label: "Glúteos", imageUrl: "/gluteos.webp" },
                { label: "Peito", imageUrl: "/peito.webp" },
                { label: "Pernas", imageUrl: "/pernas.webp" }
              ].map((opt) => (
                <Card 
                  key={opt.label} 
                  className="p-0 flex items-center cursor-pointer border-2 border-primary/10 transition-all hover:scale-[1.01] overflow-hidden bg-white hover:border-primary/40 group h-20"
                  onClick={() => { updateState("goalTransformation", opt.label); nextStep(); }}
                >
                  <div className="flex-1 px-6">
                    <span className="font-bold text-lg text-primary uppercase tracking-tight">{opt.label}</span>
                  </div>
                  <div className="h-full w-0.5 bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                  <div className="relative w-16 h-full shrink-0">
                    <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-4xl font-black text-primary leading-none uppercase tracking-tight">
              Você vai arrasar!
            </h2>
            <div className="space-y-4 text-muted-foreground px-2">
              <p className="text-lg leading-snug">
                Nosso <span className="font-bold text-foreground">Programa Feminino de Definição</span> é a solução definitiva de condicionamento físico fácil e eficaz para todos os níveis.
              </p>
              <p className="text-lg leading-snug">
                Nós te ajudamos a <span className="font-bold text-foreground">emagrecer rápido</span>, eliminar gordura e <span className="font-bold text-foreground">crescer glúteos e pernas</span> de forma eficaz, sem gastar dinheiro com academia ou equipamentos.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] max-w-[320px] mx-auto rounded-3xl overflow-hidden premium-shadow">
              <Image src="/step3.webp" alt="Transformação" fill className="object-cover" priority />
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-wide bg-primary text-white">
              Continuar
            </Button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Qual é o seu principal objetivo?
            </h2>
            <div className="space-y-3">
              {[
                { label: "Perder peso", value: "perder-peso" },
                { label: "Aumentar a força muscular", value: "forca" },
                { label: "Crescer glúteos e pernas", value: "gluteos-pernas" },
                { label: "Reduzir o stress e ansiedade", value: "stress" },
                { label: "Melhorar a postura", value: "postura" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.mainConcern === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-7 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6",
                    state.mainConcern === opt.value ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-primary/10 hover:border-primary/40 bg-white"
                  )}
                  onClick={() => { 
                    updateState("mainConcern", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold", state.mainConcern === opt.value ? "text-white" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    state.mainConcern === opt.value ? "bg-white border-white text-primary" : "border-primary/20"
                  )}>
                    {state.mainConcern === opt.value && <Check className="w-4 h-4" />}
                  </div>
                </Button>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-[300px] mx-auto mt-4">
              <Image src="/step6.webp" alt="Objetivo" fill className="object-contain" priority />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-foreground leading-tight">Como você descreveria seu físico?</h2>
            <div className="space-y-4 pt-4">
              {[
                { label: "Magro", imageUrl: "/magro.webp" },
                { label: "Médio", imageUrl: "/magro.webp" },
                { label: "Maior", imageUrl: "/gordo.webp" },
                { label: "Com excesso de peso", imageUrl: "/gordo.webp" }
              ].map((opt) => (
                <Card 
                  key={opt.label} 
                  className={cn(
                    "p-0 flex items-center cursor-pointer border-2 transition-all overflow-hidden h-24",
                    state.bodyDescription === opt.label ? "bg-primary border-primary" : "bg-white border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { updateState("bodyDescription", opt.label); nextStep(); }}
                >
                  <div className="flex-1 px-8 text-left">
                    <span className={cn("font-bold text-xl", state.bodyDescription === opt.label ? "text-white" : "text-foreground")}>
                      {opt.label}
                    </span>
                  </div>
                  <div className={cn("h-full w-1", state.bodyDescription === opt.label ? "bg-white/20" : "bg-primary")} />
                  <div className="relative w-12 h-full shrink-0 mr-2">
                    <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-foreground leading-tight">Qual é o seu &quot;corpo dos sonhos&quot;?</h2>
            <div className="space-y-4 pt-4">
              {[
                { label: "Magro", imageUrl: "/magro1.webp" },
                { label: "Definido", imageUrl: "/definido.webp" },
                { label: "Com curvas", imageUrl: "/comcurvas.webp" },
                { label: "Médio", imageUrl: "/medio.webp" }
              ].map((opt) => (
                <Card 
                  key={opt.label} 
                  className={cn(
                    "p-0 flex items-center cursor-pointer border-2 transition-all overflow-hidden h-24",
                    state.dreamBody === opt.label ? "bg-primary border-primary" : "bg-white border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { updateState("dreamBody", opt.label); nextStep(); }}
                >
                  <div className="flex-1 px-8 text-left">
                    <span className={cn("font-bold text-xl", state.dreamBody === opt.label ? "text-white" : "text-foreground")}>
                      {opt.label}
                    </span>
                  </div>
                  <div className={cn("h-full w-1", state.dreamBody === opt.label ? "bg-white/20" : "bg-primary")} />
                  <div className="relative w-12 h-full shrink-0 mr-2">
                    <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Você se considera flexível?
            </h2>
            <div className="space-y-3">
              {[
                { label: "Bastante Flexível", value: "bastante" },
                { label: "Estou começando", value: "começando" },
                { label: "Não muito", value: "nao-muito" },
                { label: "Não tenho certeza", value: "incerta" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.flexibility === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-7 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6",
                    state.flexibility === opt.value ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-primary/10 hover:border-primary/40 bg-white"
                  )}
                  onClick={() => { 
                    updateState("flexibility", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold", state.flexibility === opt.value ? "text-white" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    state.flexibility === opt.value ? "bg-white border-white text-primary" : "border-primary/20"
                  )}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-[600px] mx-auto mt-8 rounded-full overflow-hidden">
              <Image src="/flexivel.webp" alt="Flexível" fill className="object-cover" />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-foreground leading-tight">Você tem dificuldade com algum dos itens abaixo?</h2>
            <p className="text-muted-foreground">Escolha todas que se aplicam</p>
            <div className="space-y-4 pt-4">
              {[
                { label: "Costas sensíveis", imageUrl: "/costa.webp" },
                { label: "Joelhos sensíveis", imageUrl: "/joelho.webp" },
                { label: "Nenhum dos itens acima", imageUrl: "/step3.webp" }
              ].map((opt) => (
                <Card 
                  key={opt.label} 
                  className={cn(
                    "p-0 flex items-center cursor-pointer border-2 transition-all overflow-hidden h-24 bg-white",
                    selectedLimitations.includes(opt.label) ? "border-primary shadow-lg" : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => toggleLimitation(opt.label)}
                >
                  <div className="relative w-16 h-full shrink-0">
                    <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" />
                  </div>
                  <div className="flex-1 px-4 text-left">
                    <span className="font-bold text-lg text-foreground">{opt.label}</span>
                  </div>
                  <div className="pr-6">
                    <Checkbox checked={selectedLimitations.includes(opt.label)} className="w-6 h-6 rounded-lg border-2" />
                  </div>
                </Card>
              ))}
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white mt-8">
              PRÓXIMO PASSO
            </Button>
          </div>
        );

      case 11:
        return (
          <div className="space-y-12 text-center px-4 py-10">
            <div className="space-y-6">
              <h2 className="text-5xl font-black text-foreground leading-none tracking-tighter">
                Nós te ajudamos!
              </h2>
              <div className="space-y-8 text-muted-foreground px-2">
                <p className="text-xl font-medium leading-tight">
                  Você encontrará muitos exercícios especializados para fortalecer qualquer parte do seu corpo.
                </p>
                <p className="text-xl font-medium leading-tight">
                  Além de remover a gordura localizada, você vai manter seu corpo firme e flexível.
                </p>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-wide bg-primary text-white">
              Continuar
            </Button>
          </div>
        );

      case 12:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Quantas vezes você faz exercício?
            </h2>
            <div className="space-y-3">
              {[
                { label: "Quase todos os dias", value: "diario" },
                { label: "Várias vezes por semana", value: "semanal" },
                { label: "Várias vezes por mês", value: "mensal" },
                { label: "Nunca", value: "nunca" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.exerciseFrequency === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-8 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6 bg-white",
                    state.exerciseFrequency === opt.value ? "border-primary shadow-lg ring-1 ring-primary" : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { 
                    updateState("exerciseFrequency", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className="font-bold text-foreground">
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    state.exerciseFrequency === opt.value ? "bg-primary border-primary text-white" : "border-primary/20"
                  )}>
                    {state.exerciseFrequency === opt.value && <Check className="w-4 h-4" />}
                  </div>
                </Button>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-[320px] mx-auto mt-6">
              <Image src="/exercicio.webp" alt="Exercício" fill className="object-contain" priority />
            </div>
          </div>
        );

      case 13:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Com que frequência você sai para caminhadas?
            </h2>
            <div className="space-y-4 pt-4">
              {[
                { label: "Quase todos os dias", value: "diario", emoji: "😎" },
                { label: "3-4 vezes por semana", value: "3-4x", emoji: "💪" },
                { label: "1-2 vezes por semana", value: "1-2x", emoji: "😊" },
                { label: "Uma vez por mês", value: "mensal", emoji: "👍" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.walkingFrequency === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-8 text-lg rounded-2xl border-2 transition-all flex justify-start items-center px-6 gap-6 bg-white",
                    state.walkingFrequency === opt.value ? "border-primary shadow-lg ring-1 ring-primary" : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { 
                    updateState("walkingFrequency", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className={cn("font-bold", state.walkingFrequency === opt.value ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 14:
        return (
          <div className="space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Como são os seus níveis de energia durante o dia?
            </h2>
            <div className="space-y-3 pt-4">
              {[
                { label: "Baixo, me sinto cansada durante o dia", value: "baixo" },
                { label: "Sinto uma queda de energia depois do almoço", value: "queda" },
                { label: "Me arrasto entre as refeições", value: "arrasto" },
                { label: "Elevados e estáveis", value: "elevados" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.energyLevel === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-6 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6 bg-white text-left h-auto min-h-[80px]",
                    state.energyLevel === opt.value ? "border-primary shadow-lg ring-1 ring-primary" : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { 
                    updateState("energyLevel", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold flex-1 pr-4", state.energyLevel === opt.value ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                    state.energyLevel === opt.value ? "bg-primary border-primary text-white" : "border-primary/20"
                  )}>
                    {state.energyLevel === opt.value && <Check className="w-4 h-4" />}
                  </div>
                </Button>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-[320px] mx-auto mt-6">
              <Image src="/step14.webp" alt="Energia" fill className="object-contain" priority />
            </div>
          </div>
        );

      case 15:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-primary">Quanto tempo você tem para cuidar de si mesma por dia?</h2>
            <div className="grid grid-cols-2 gap-4">
              {["5 min", "10 min", "20 min", "30 min"].map((opt) => (
                <Button 
                  key={opt}
                  className="py-12 text-2xl font-bold rounded-3xl flex flex-col gap-1 border-2 bg-white"
                  variant="outline"
                  onClick={() => { updateState("dedicationTime", opt); nextStep(); }}
                >
                  {opt}
                  <span className="text-[10px] font-normal uppercase tracking-widest opacity-60">por dia</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 16:
        return (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-center text-primary">Como você quer se sentir daqui a 30 dias?</h2>
            <div className="space-y-3">
              {[
                "Muito mais confiante e segura",
                "Extremamente atraente e poderosa",
                "Confortável em qualquer roupa",
                "Feliz e orgulhosa ao me olhar no espelho"
              ].map((opt) => (
                <Button 
                  key={opt}
                  variant="outline"
                  className="w-full py-8 text-lg rounded-2xl border-2 border-primary/10 hover:border-primary text-foreground text-left px-6 bg-white"
                  onClick={() => { updateState("emotionalGoal", opt); nextStep(); }}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        );

      case 17:
        return (
          <div className="space-y-8 py-4">
            <h2 className="text-2xl font-bold text-center text-primary">Mulheres reais, resultados reais.</h2>
            <div className="space-y-4">
              {[
                { name: "Juliana S.", age: "34", text: "Perdi 4cm de cintura em 2 semanas! Me sinto outra mulher.", rating: 5 },
                { name: "Mariana L.", age: "28", text: "Meus glúteos estão muito mais firmes. O programa é incrível.", rating: 5 }
              ].map((p, i) => (
                <Card key={i} className="p-4 border-none bg-white shadow-sm">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-primary text-primary" />)}
                  </div>
                  <p className="italic text-sm mb-2">&quot;{p.text}&quot;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20" />
                    <span className="text-xs font-bold">{p.name}, {p.age} anos</span>
                  </div>
                </Card>
              ))}
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white">
              Continuar para meu plano
            </Button>
          </div>
        );

      case 18:
        return (
          <LoadingScreen 
            title="Seu plano feminino personalizado está sendo criado..." 
            steps={["Ajustando exercícios exclusivos", "Criando plano para pernas e glúteos", "Otimizando queima de gordura abdominal", "Finalizando rotina personalizada"]}
            onComplete={finishQuiz}
            duration={4000}
          />
        );

      case 19:
        return (
          <div className="space-y-8 text-center py-6">
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-none py-1 px-4 mb-2">Análise Concluída</Badge>
            <h2 className="text-3xl font-extrabold text-primary leading-tight">Seu perfil indica alto potencial de transformação.</h2>
            
            <div className="bg-white p-6 rounded-3xl premium-shadow border border-primary/10 space-y-4">
              <div className="flex justify-between items-end h-32 gap-2">
                {[30, 45, 60, 55, 75, 90, 100].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ delay: i * 0.1 }}
                    className={cn("w-full rounded-t-lg", i === 6 ? "bg-primary" : "bg-primary/20")} 
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-primary">Estimativa de evolução em 21 dias</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-primary/20 bg-white">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Corpo</span>
                <p className="font-bold">{state.dreamBody || "Definido"}</p>
              </Card>
              <Card className="p-4 border-primary/20 bg-white">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Objetivo</span>
                <p className="font-bold">{state.goalTransformation || "Cintura Fina"}</p>
              </Card>
            </div>

            <Button className="w-full py-10 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/40 uppercase tracking-tighter bg-primary text-white hover:scale-[1.02] transition-transform animate-pulse">
              VER MEU PLANO AGORA
            </Button>

            <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-500" /> Seguro</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-500" /> Personalizado</span>
            </div>
          </div>
        );

      default:
        return <div>Passo {stepId}</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background overflow-x-hidden">
      {stepId < TOTAL_STEPS && (
        <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-primary/5">
          <button onClick={prevStep} disabled={stepId === 1} className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-primary disabled:opacity-0 transition-opacity">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      <div className={cn("w-full pt-20 pb-20 flex-1 flex flex-col items-center", stepId >= TOTAL_STEPS - 2 ? "pt-10" : "")}>
        <AnimatePresence mode="wait">
          <QuizStep key={stepId} stepId={stepId}>
            {renderStep()}
          </QuizStep>
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingScreen({ title, steps, onComplete, duration = 3000 }: { title: string, steps: string[], onComplete: () => void, duration?: number }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const stepInterval = duration / steps.length;
    const timer = setInterval(() => {
      setCurrentStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, stepInterval);

    const progressTimer = setInterval(() => {
      setProg(p => {
        if (p >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return p + 2;
      });
    }, duration / 50);

    return () => { clearInterval(timer); clearInterval(progressTimer); };
  }, [steps, onComplete, duration]);

  return (
    <div className="space-y-12 text-center py-10 w-full">
      <h2 className="text-2xl font-bold text-primary leading-tight px-4">{title}</h2>
      
      <div className="relative py-10 flex justify-center">
        <div className="w-48 h-48 rounded-full border-8 border-primary/10 flex items-center justify-center relative">
          <motion.div 
            className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
        </div>
      </div>

      <div className="space-y-4 px-6">
        <AnimatePresence mode="wait">
          <motion.p 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-bold text-primary animate-pulse"
          >
            {steps[currentStep]}
          </motion.p>
        </AnimatePresence>
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary loading-bar-glow" style={{ width: `${prog}%` }} />
        </div>
      </div>
    </div>
  );
}

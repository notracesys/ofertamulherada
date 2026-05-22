
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, Star, ShieldCheck, ChevronRight, Zap, Target, TrendingDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { generatePersonalizedAfricanMethodPlan, type GeneratePersonalizedAfricanMethodPlanInput, type GeneratePersonalizedAfricanMethodPlanOutput } from "@/ai/flows/generate-personalized-african-method-plan";
import { QuizStep } from "./QuizStep";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, ReferenceDot, Label } from "recharts";

const TOTAL_STEPS = 24;
const STORAGE_KEY = "fitness_fem_quiz_state";

const INITIAL_STATE: GeneratePersonalizedAfricanMethodPlanInput = {
  age: "",
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
  height: "170",
  weight: "65",
  targetWeight: "60",
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
  const [heightUnit, setHeightUnit] = useState<"cm" | "pol">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [targetWeightUnit, setTargetWeightUnit] = useState<"kg" | "lb">("kg");
  
  const heightRulerRef = useRef<HTMLDivElement>(null);
  const weightRulerRef = useRef<HTMLDivElement>(null);
  const targetWeightRulerRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [step19Progress, setStep19Progress] = useState(0);
  const [step22Progress, setStep22Progress] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...INITIAL_STATE, ...prev, ...parsed })); 
        if (parsed.physicalLimitations) {
          setSelectedLimitations(parsed.physicalLimitations.split(", "));
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isClient) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  }, [state, isClient]);

  useEffect(() => {
    if (isClient) {
      if (stepId === 15 && heightRulerRef.current) {
        const h = parseInt(state.height || "170");
        heightRulerRef.current.scrollLeft = (h - 100) * 10;
      }
      if (stepId === 16 && weightRulerRef.current) {
        const w = parseInt(state.weight || "65");
        weightRulerRef.current.scrollLeft = (w - 30) * 10;
      }
      if (stepId === 17 && targetWeightRulerRef.current) {
        const tw = parseInt(state.targetWeight || "60");
        targetWeightRulerRef.current.scrollLeft = (tw - 25) * 10;
      }
      
      if (stepId === 19) {
        setStep19Progress(0);
        const duration = 10000;
        const interval = duration / 100;
        const timer = setInterval(() => {
          setStep19Progress(p => {
            if (p >= 100) {
              clearInterval(timer);
              setTimeout(() => router.push("/step/20"), 800);
              return 100;
            }
            return p + 1;
          });
        }, interval);
        return () => clearInterval(timer);
      }

      if (stepId === 22) {
        setStep22Progress(0);
        const duration = 7000;
        const interval = duration / 100;
        const timer = setInterval(() => {
          setStep22Progress(p => {
            if (p >= 100) {
              clearInterval(timer);
              setTimeout(() => router.push("/step/23"), 800);
              return 100;
            }
            return p + 1;
          });
        }, interval);
        return () => clearInterval(timer);
      }
    }
  }, [stepId, isClient, state.height, state.weight, state.targetWeight, router]);

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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    isDragging.current = true;
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    startX.current = pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLDivElement>, type: 'height' | 'weight' | 'targetWeight') => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    const x = pageX - ref.current.offsetLeft;
    const walk = (x - startX.current);
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleHeightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scroll = e.currentTarget.scrollLeft;
    const newValue = Math.round(scroll / 10) + 100;
    if (newValue >= 100 && newValue <= 220 && newValue !== parseInt(state.height || "0")) {
      updateState("height", newValue.toString());
    }
  };

  const handleWeightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scroll = e.currentTarget.scrollLeft;
    const newValue = Math.round(scroll / 10) + 30;
    if (newValue >= 30 && newValue <= 150 && newValue !== parseInt(state.weight || "0")) {
      updateState("weight", newValue.toString());
    }
  };

  const handleTargetWeightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scroll = e.currentTarget.scrollLeft;
    const newValue = Math.round(scroll / 10) + 25;
    if (newValue >= 25 && newValue <= 300 && newValue !== parseInt(state.targetWeight || "0")) {
      updateState("targetWeight", newValue.toString());
    }
  };

  if (!isClient) return null;

  const progress = (stepId / TOTAL_STEPS) * 100;

  const currentWeightValue = parseInt(state.weight || "70");
  const targetWeightValue = parseInt(state.targetWeight || "60");
  const weightData = [
    { week: "SEMANA 1", weight: currentWeightValue },
    { week: "SEMANA 2", weight: currentWeightValue - (currentWeightValue - targetWeightValue) * 0.5 },
    { week: "SEMANA 3", weight: targetWeightValue },
  ];

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
                    "w-full py-8 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6 whitespace-normal",
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
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
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
                    "w-full py-7 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6 whitespace-normal",
                    state.mainConcern === opt.value ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-primary/10 hover:border-primary/40 bg-white"
                  )}
                  onClick={() => { 
                    updateState("mainConcern", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold text-left", state.mainConcern === opt.value ? "text-white" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
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
                    "w-full py-7 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6 whitespace-normal",
                    state.flexibility === opt.value ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-primary/10 hover:border-primary/40 bg-white"
                  )}
                  onClick={() => { 
                    updateState("flexibility", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold text-left", state.flexibility === opt.value ? "text-white" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                    state.flexibility === opt.value ? "bg-white border-white text-primary" : "border-primary/20"
                  )}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-[340px] mx-auto mt-8 rounded-full overflow-hidden">
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
                    "w-full py-8 text-lg rounded-2xl border-2 transition-all flex justify-between items-center px-6 bg-white whitespace-normal",
                    state.exerciseFrequency === opt.value ? "border-primary shadow-lg ring-1 ring-primary" : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { 
                    updateState("exerciseFrequency", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className="font-bold text-foreground text-left">
                    {opt.label}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
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
                { label: "3-4 vezes por semana", value: "3-4x", emoji: "😊" },
                { label: "1-2 vezes por semana", value: "1-2x", emoji: "😊" },
                { label: "Uma vez por mês", value: "mensal", emoji: "👍" }
              ].map((opt) => (
                <Button 
                  key={opt.value}
                  variant={state.walkingFrequency === opt.value ? "default" : "outline"}
                  className={cn(
                    "w-full py-8 text-lg rounded-2xl border-2 transition-all flex justify-start items-center px-6 gap-6 bg-white whitespace-normal",
                    state.walkingFrequency === opt.value ? "border-primary shadow-lg ring-1 ring-primary" : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { 
                    updateState("walkingFrequency", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className="text-4xl shrink-0">{opt.emoji}</span>
                  <span className={cn("font-bold text-left", state.walkingFrequency === opt.value ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 14:
        return (
          <div className="space-y-8 text-center px-4 w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Como são os seus níveis de energia durante o dia?
            </h2>
            <div className="space-y-4 pt-4">
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
                    "w-full px-6 py-6 min-h-[85px] h-auto rounded-2xl border-2 transition-all flex justify-between items-center bg-white text-left whitespace-normal group",
                    state.energyLevel === opt.value ? "border-primary shadow-md ring-1 ring-primary" : "border-primary/10 hover:border-primary/30"
                  )}
                  onClick={() => { 
                    updateState("energyLevel", opt.value); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn(
                    "font-bold text-lg leading-tight flex-1 pr-4", 
                    state.energyLevel === opt.value ? "text-primary" : "text-foreground"
                  )}>
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
            <div className="relative w-full aspect-square max-w-[280px] mx-auto mt-8">
              <Image src="/step14.webp" alt="Energia" fill className="object-contain" priority />
            </div>
          </div>
        );

      case 15:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Qual sua altura?</h2>
            
            <div className="flex justify-center">
              <div className="bg-secondary/50 p-1 rounded-full flex gap-1">
                <Button 
                  size="sm" 
                  variant={heightUnit === "cm" ? "default" : "ghost"}
                  className={cn("rounded-full px-6", heightUnit === "cm" ? "bg-primary text-white" : "text-muted-foreground")}
                  onClick={() => setHeightUnit("cm")}
                >
                  cm
                </Button>
                <Button 
                  size="sm" 
                  variant={heightUnit === "pol" ? "default" : "ghost"}
                  className={cn("rounded-full px-6", heightUnit === "pol" ? "bg-primary text-white" : "text-muted-foreground")}
                  onClick={() => setHeightUnit("pol")}
                >
                  pol
                </Button>
              </div>
            </div>

            <div className="text-6xl font-black text-foreground flex items-baseline justify-center gap-1">
              {state.height}
              <span className="text-2xl font-bold text-muted-foreground">{heightUnit}</span>
            </div>

            <div className="relative py-10 select-none">
              <div 
                ref={heightRulerRef}
                onScroll={handleHeightScroll}
                onMouseDown={(e) => handleDragStart(e, heightRulerRef)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onMouseMove={(e) => handleDragMove(e, heightRulerRef, 'height')}
                onTouchStart={(e) => handleDragStart(e, heightRulerRef)}
                onTouchEnd={handleDragEnd}
                onTouchMove={(e) => handleDragMove(e, heightRulerRef, 'height')}
                className="w-full flex items-end gap-0 overflow-x-auto no-scrollbar px-[50%] py-4 scroll-smooth cursor-grab active:cursor-grabbing"
              >
                {Array.from({ length: 121 }).map((_, i) => {
                  const val = i + 100;
                  const isMajor = val % 10 === 0;
                  return (
                    <div key={val} className="flex flex-col items-center shrink-0 w-[10px]">
                      <div className={cn("bg-muted-foreground/30", isMajor ? "h-10 w-0.5" : "h-6 w-0.5")} />
                      {isMajor && <span className="text-xs text-muted-foreground mt-2 font-medium">{val}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-1 bg-primary rounded-full shadow-lg shadow-primary/40 z-10 pointer-events-none" />
            </div>
            
            <p className="text-muted-foreground text-sm font-medium">Arraste a régua para ajustar</p>

            <div className="bg-[#EBF5FF] p-6 rounded-3xl text-left space-y-2 border border-blue-100 mx-4">
              <p className="font-bold text-[#1E40AF] flex items-center gap-2">
                <span>☝️</span> Calculando seu índice de massa corporal
              </p>
              <p className="text-sm text-[#3B82F6] leading-relaxed">
                O IMC é amplamente utilizado como fator de risco para o desenvolvimento ou prevalência de diversos problemas de saúde.
              </p>
            </div>

            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white mt-4">
              PRÓXIMO PASSO
            </Button>
          </div>
        );

      case 16:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Qual seu peso atual?</h2>
            
            <div className="text-6xl font-black text-foreground flex items-baseline justify-center gap-1">
              {state.weight}
              <span className="text-2xl font-bold text-muted-foreground">kg</span>
            </div>

            <div className="relative py-10 select-none">
              <div 
                ref={weightRulerRef}
                onScroll={handleWeightScroll}
                onMouseDown={(e) => handleDragStart(e, weightRulerRef)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onMouseMove={(e) => handleDragMove(e, weightRulerRef, 'weight')}
                onTouchStart={(e) => handleDragStart(e, weightRulerRef)}
                onTouchEnd={handleDragEnd}
                onTouchMove={(e) => handleDragMove(e, weightRulerRef, 'weight')}
                className="w-full flex items-end gap-0 overflow-x-auto no-scrollbar px-[50%] py-4 scroll-smooth cursor-grab active:cursor-grabbing"
              >
                {Array.from({ length: 121 }).map((_, i) => {
                  const val = i + 30;
                  const isMajor = val % 10 === 0;
                  return (
                    <div key={val} className="flex flex-col items-center shrink-0 w-[10px]">
                      <div className={cn("bg-muted-foreground/30", isMajor ? "h-10 w-0.5" : "h-6 w-0.5")} />
                      {isMajor && <span className="text-xs text-muted-foreground mt-2 font-medium">{val}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-1 bg-primary rounded-full shadow-lg z-10 pointer-events-none" />
            </div>
            
            <p className="text-muted-foreground text-sm font-medium">Arraste a régua para ajustar</p>

            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white mt-8">
              PRÓXIMO PASSO
            </Button>
          </div>
        );

      case 17:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight px-6">
              E qual é seu objetivo de peso ideal?
            </h2>
            
            <div className="flex justify-center">
              <div className="bg-secondary/50 p-1 rounded-full flex gap-1">
                <Button 
                  size="sm" 
                  variant={targetWeightUnit === "kg" ? "default" : "ghost"}
                  className={cn("rounded-full px-6", targetWeightUnit === "kg" ? "bg-primary text-white" : "text-muted-foreground")}
                  onClick={() => setTargetWeightUnit("kg")}
                >
                  kg
                </Button>
                <Button 
                  size="sm" 
                  variant={targetWeightUnit === "lb" ? "default" : "ghost"}
                  className={cn("rounded-full px-6", targetWeightUnit === "lb" ? "bg-primary text-white" : "text-muted-foreground")}
                  onClick={() => setTargetWeightUnit("lb")}
                >
                  lb
                </Button>
              </div>
            </div>

            <div className="text-6xl font-black text-foreground flex items-baseline justify-center gap-1">
              {state.targetWeight}
              <span className="text-2xl font-bold text-muted-foreground">{targetWeightUnit}</span>
            </div>

            <div className="relative py-10 select-none">
              <div 
                ref={targetWeightRulerRef}
                onScroll={handleTargetWeightScroll}
                onMouseDown={(e) => handleDragStart(e, targetWeightRulerRef)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onMouseMove={(e) => handleDragMove(e, targetWeightRulerRef, 'targetWeight')}
                onTouchStart={(e) => handleDragStart(e, targetWeightRulerRef)}
                onTouchEnd={handleDragEnd}
                onTouchMove={(e) => handleDragMove(e, targetWeightRulerRef, 'targetWeight')}
                className="w-full flex items-end gap-0 overflow-x-auto no-scrollbar px-[50%] py-4 scroll-smooth cursor-grab active:cursor-grabbing"
              >
                {Array.from({ length: 276 }).map((_, i) => {
                  const val = i + 25;
                  const isMajor = val % 10 === 0;
                  return (
                    <div key={val} className="flex flex-col items-center shrink-0 w-[10px]">
                      <div className={cn("bg-muted-foreground/20", isMajor ? "h-10 w-0.5" : "h-6 w-0.5")} />
                      {isMajor && <span className="text-xs text-muted-foreground mt-2 font-medium">{val}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-1 bg-primary rounded-full shadow-lg shadow-primary/40 z-10 pointer-events-none flex items-center justify-center">
                <div className="absolute -bottom-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary" />
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm font-medium">Arraste para ajustar</p>
              <p className="text-muted-foreground/60 text-xs">Por favor, introduza um valor entre 25kg e 300kg</p>
            </div>

            <div className="bg-[#EBF5FF] p-6 rounded-3xl text-left space-y-2 border border-blue-100 mx-4">
              <p className="font-bold text-[#1E40AF] flex items-center gap-2">
                <span className="bg-green-500 rounded p-0.5 text-white flex items-center justify-center"><Check className="w-3 h-3" /></span> 
                Perguntamos a sua idade para personalizar o seu plano
              </p>
              <p className="text-sm text-[#3B82F6] leading-relaxed">
                As pessoas mais velhas tendem a ter mais gordura corporal que os mais novos com o mesmo IMC
              </p>
            </div>

            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white mt-4">
              PRÓXIMO PASSO
            </Button>
          </div>
        );

      case 18:
        return (
          <div className="space-y-8 text-center px-4 max-sm mx-auto">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-[#0F172A] leading-tight">Qual sua idade?</h2>
              <p className="text-muted-foreground font-medium text-sm px-6">
                Perguntamos a sua idade para personalizar o seu plano
              </p>
            </div>
            
            <div className="pt-4">
              <Input 
                type="number" 
                placeholder="Exemplo: 39" 
                className="h-16 rounded-3xl text-center text-xl italic border-primary/20 bg-white shadow-sm focus-visible:ring-primary"
                value={state.age || ""}
                onChange={(e) => updateState("age", e.target.value)}
              />
            </div>

            <div className="bg-[#EBF5FF] p-6 rounded-3xl text-left space-y-2 border border-blue-100 mt-4">
              <div className="flex gap-2">
                <div className="bg-green-500 rounded p-0.5 w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="font-bold text-[#1E40AF] text-sm leading-tight">
                  Perguntamos a sua idade para personalizar o seu plano
                </p>
              </div>
              <p className="text-[13px] text-[#3B82F6] leading-relaxed pl-7">
                As pessoas mais velhas tendem a ter mais gordura corporal que os mais novos com o mesmo IMC
              </p>
            </div>

            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white mt-4">
              PRÓXIMO PASSO
            </Button>
          </div>
        );

      case 19:
        return (
          <div className="space-y-10 text-center py-4 w-full max-w-lg mx-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Analisando o seu perfil...</span>
                <span className="text-[10px] font-bold text-primary">{step19Progress}%</span>
              </div>
              <Progress value={step19Progress} className="h-1.5 bg-secondary" />
              <p className="text-sm text-muted-foreground italic">aguarde um momento ...</p>
            </div>

            <h2 className="text-3xl font-black text-[#0F172A] leading-tight px-4">
              No total, durante os últimos 3 meses, nossos usuários perderam em média <span className="text-green-500 font-black">14+ kg</span> 🤩
            </h2>

            <div className="relative px-4">
              <Card className="p-6 rounded-3xl border-none shadow-xl shadow-primary/5 bg-white text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10">
                     <Image src="https://picsum.photos/seed/rafaela/100/100" alt="Rafaela" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 i-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="font-bold text-sm text-foreground">Rafaela</p>
                    <p className="text-[10px] text-muted-foreground">01/04/2026</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Essa foi de longe a melhor escolha que eu fiz na minha vida! Exercícios que realmente funciona e trazem resultados rápidos.. 🙏
                </p>
              </Card>
            </div>
          </div>
        );

      case 20:
        return (
          <div className="space-y-6 text-center py-4 max-w-md mx-auto w-full px-4">
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-bold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  98% de compatibilidade detectada
                </Badge>
              </div>
              <h2 className="text-3xl font-black leading-tight text-slate-900">
                Prepare-se para ver <span className="text-[#10B981]">{state.targetWeight}kg</span> no espelho!
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed px-2">
                Sua análise corporal mostra que seu metabolismo está pronto para uma transformação radical nos próximos 21 dias.
              </p>
            </div>

            <div className="relative w-full h-[360px] mt-8 overflow-visible flex flex-col">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 100, right: 40, left: 40, bottom: 20 }} style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGradientStep20" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="50%" stopColor="#EAB308" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis hide domain={['dataMin - 15', 'dataMax + 15']} />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="url(#areaGradientStep20)" 
                    strokeWidth={4} 
                    fill="url(#areaGradientStep20)" 
                    fillOpacity={0.4}
                    animationDuration={2000}
                  />
                  
                  <ReferenceDot x="SEMANA 1" y={currentWeightValue} r={6} fill="#fff" stroke="#EF4444" strokeWidth={3}>
                    <Label value="SEU PESO" position="top" offset={40} fill="#64748b" fontSize={10} fontWeight="bold" />
                    <Label value={`${currentWeightValue}kg`} position="top" offset={10} fill="#EF4444" fontSize={20} fontWeight={900} />
                  </ReferenceDot>

                  <ReferenceDot x="SEMANA 2" y={weightData[1].weight} r={5} fill="#fff" stroke="#EAB308" strokeWidth={3} />
                  
                  <ReferenceDot x="SEMANA 3" y={targetWeightValue} r={6} fill="#fff" stroke="#22C55E" strokeWidth={3}>
                    <Label value="3 semanas" position="top" offset={40} fill="#EC4899" fontSize={10} fontWeight="bold" />
                    <Label value={`${targetWeightValue}kg`} position="top" offset={10} fill="#22C55E" fontSize={20} fontWeight={900} />
                  </ReferenceDot>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-4">
              <div className="bg-[#DCFCE7] p-6 rounded-[2rem] text-center space-y-3 border border-[#86EFAC] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <TrendingDown className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-black text-[#166534] leading-tight">
                  Sua hora chegou!
                </h3>
                <p className="text-sm text-[#166534]/80 leading-relaxed font-medium">
                  Com base no seu perfil, você tem o biotipo ideal para responder rapidamente a este protocolo. Em 21 dias, o peso que você deseja será sua nova realidade.
                </p>
              </div>
            </div>

            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest bg-primary text-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
              CONTINUAR
              <ArrowRight className="w-6 h-6" />
            </Button>
            
            <p className="text-[10px] text-muted-foreground opacity-60 italic leading-snug px-4">
              *Gráfico projetado com base em inteligência artificial e dados históricos de usuários com perfil similar ao seu. Resultados podem variar.
            </p>
          </div>
        );

      case 21:
        return (
          <div className="space-y-12 text-center px-4">
            <h2 className="text-2xl font-bold text-[#0F172A] leading-tight px-6">
              Quanto tempo você deseja dedicar em seu corpo no dia?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "5 minutos",
                "10 minutos",
                "15 minutos",
                "30 minutos"
              ].map((opt) => (
                <Button 
                  key={opt}
                  variant={state.dedicationTime === opt ? "default" : "outline"}
                  className={cn(
                    "h-20 rounded-2xl border-2 transition-all flex flex-col justify-center items-center gap-1 bg-white",
                    state.dedicationTime === opt 
                      ? "border-primary shadow-lg ring-1 ring-primary" 
                      : "border-primary/10 hover:border-primary/40"
                  )}
                  onClick={() => { 
                    updateState("dedicationTime", opt); 
                    setTimeout(nextStep, 300);
                  }}
                >
                  <span className={cn("font-bold text-base", state.dedicationTime === opt ? "text-primary" : "text-foreground")}>
                    {opt}
                  </span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                    state.dedicationTime === opt ? "bg-primary border-primary text-white" : "border-primary/20"
                  )}>
                    {state.dedicationTime === opt && <Check className="w-3 h-3" />}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 22:
        return (
          <div className="space-y-10 py-6 text-center w-full max-w-lg mx-auto">
            <div className="space-y-4 px-4">
               <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Analizando o seu perfil...</span>
                <span className="text-[10px] font-bold text-primary">{step22Progress}%</span>
              </div>
              <Progress value={step22Progress} className="h-1.5 bg-secondary" />
              <p className="text-sm font-bold text-muted-foreground">
                Criando seu plano de treino personalizado de definição feminina
              </p>
            </div>

            <div className="space-y-1">
              <h2 className="text-4xl md:text-5xl font-black text-primary leading-none">
                1 milhão de pessoas
              </h2>
              <p className="text-lg font-bold text-primary/80">
                escolheram o nosso Programa Feminino
              </p>
            </div>

            <div className="px-4">
              <Card className="p-6 rounded-[2rem] border-none bg-white shadow-xl shadow-primary/5 text-left relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-primary/10">
                    <Image src="https://picsum.photos/seed/vanessa/100/100" alt="Vanessa" fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="font-bold text-base text-[#0F172A]">Vanessa</p>
                    <p className="text-[10px] text-muted-foreground">13/03/2026</p>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                      Perdi 6kg em duas semanas, estou muuuito feliz ❤️
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 23:
        return (
          <LoadingScreen 
            title="Seu plano feminino personalizado está sendo criado..." 
            steps={["Ajustando exercícios exclusivos", "Criando plano para pernas e glúteos", "Otimizando queima de gordura abdominal", "Finalizando rotina personalizada"]}
            onComplete={finishQuiz}
            duration={4000}
          />
        );

      case 24:
        return (
          <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 pb-10">
            <div className="w-full h-1.5 bg-primary/20 rounded-full mb-8 overflow-hidden relative">
               <div className="absolute top-0 left-0 h-full bg-primary w-full" />
            </div>

            <div className="relative w-full h-[360px] mb-8 overflow-visible flex flex-col">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 100, right: 40, left: 40, bottom: 20 }} style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGradientFinal" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="50%" stopColor="#EAB308" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis hide domain={['dataMin - 15', 'dataMax + 15']} />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="url(#areaGradientFinal)" 
                    strokeWidth={4} 
                    fill="url(#areaGradientFinal)" 
                    fillOpacity={0.4}
                    animationDuration={2000}
                  />
                  
                  <ReferenceDot x="SEMANA 1" y={currentWeightValue} r={6} fill="#fff" stroke="#EF4444" strokeWidth={3}>
                    <Label value="SEU PESO" position="top" offset={40} fill="#64748b" fontSize={10} fontWeight="bold" />
                    <Label value={`${currentWeightValue}kg`} position="top" offset={10} fill="#EF4444" fontSize={20} fontWeight={900} />
                  </ReferenceDot>

                  <ReferenceDot x="SEMANA 2" y={weightData[1].weight} r={5} fill="#fff" stroke="#EAB308" strokeWidth={3} />
                  
                  <ReferenceDot x="SEMANA 3" y={targetWeightValue} r={6} fill="#fff" stroke="#22C55E" strokeWidth={3}>
                    <Label value="3 semanas" position="top" offset={40} fill="#EC4899" fontSize={10} fontWeight="bold" />
                    <Label value={`${targetWeightValue}kg`} position="top" offset={10} fill="#22C55E" fontSize={20} fontWeight={900} />
                  </ReferenceDot>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mb-8 text-center px-4">
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] leading-tight uppercase italic tracking-tight">
                seu plano de treino de definição de 3 semanas está pronto!
              </h2>
            </div>

            <div className="bg-[#E6F9EF] p-6 rounded-[2rem] text-center space-y-2 border border-[#BFF2D6] w-full mb-8 shadow-sm">
              <h3 className="text-xl font-black text-[#166534]">Mudança para sempre</h3>
              <p className="text-sm text-[#166534]/80 font-medium leading-relaxed">
                Assim que atingir o seu peso ideal, utilizaremos as últimas semanas do seu programa para o ajudar a criar hábitos saudáveis que lhe permitam manter o seu peso!
              </p>
            </div>

            <Button className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest bg-primary text-white hover:scale-[1.02] transition-all">
              CONTINUAR
            </Button>
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

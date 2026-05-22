"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Check, 
  ArrowRight, 
  ChevronRight, 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { generatePersonalizedAfricanMethodPlan, type GeneratePersonalizedAfricanMethodPlanInput } from "@/ai/flows/generate-personalized-african-method-plan";
import { QuizStep } from "./QuizStep";
import { cn } from "@/lib/utils";
import { 
  Area as RechartsArea, 
  AreaChart, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceDot,
  XAxis,
  YAxis
} from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const TOTAL_STEPS = 25;
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
  const [isClient, setIsClient] = useState(false);
  const [state, setState] = useState<GeneratePersonalizedAfricanMethodPlanInput>(INITIAL_STATE);
  const [selectedLimitations, setSelectedLimitations] = useState<string[]>([]);
  const [heightUnit, setHeightUnit] = useState<"cm" | "pol">("cm");
  const [sliderPos, setSliderPos] = useState(50);
  const [api, setApi] = useState<CarouselApi>();
  
  const heightRulerRef = useRef<HTMLDivElement>(null);
  const weightRulerRef = useRef<HTMLDivElement>(null);
  const targetWeightRulerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
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

  // Autoplay for step 19 carousel
  useEffect(() => {
    if (!api || stepId !== 19) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [api, stepId]);

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
    try {
      await generatePersonalizedAfricanMethodPlan(state);
      setTimeout(() => router.push(`/step/24`), 2000);
    } catch (error) {
      console.error(error);
      router.push(`/step/24`);
    }
  };

  const handleRulerDragStart = (e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    isDragging.current = true;
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    startX.current = pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  };

  const handleRulerDragEnd = () => {
    isDragging.current = false;
  };

  const handleRulerDragMove = (e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
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

  const handleComparisonMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSliderPos(percentage);
  };

  if (!isClient) return null;

  const progress = (stepId / TOTAL_STEPS) * 100;
  const currentWeightValue = parseInt(state.weight || "70");
  const targetWeightValue = parseInt(state.targetWeight || "60");
  const midWeight = currentWeightValue - (currentWeightValue - targetWeightValue) * 0.5;

  const weightData = [
    { week: "SEMANA 1", weight: currentWeightValue },
    { week: "SEMANA 2", weight: midWeight },
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
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-wide bg-primary text-white">
                Continuar
              </Button>
            </div>
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
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase bg-primary text-white">
                PRÓXIMO PASSO
              </Button>
            </div>
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
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-wide bg-primary text-white">
                Continuar
              </Button>
            </div>
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
                <Button size="sm" variant={heightUnit === "cm" ? "default" : "ghost"} className={cn("rounded-full px-6", heightUnit === "cm" ? "bg-primary text-white" : "text-muted-foreground")} onClick={() => setHeightUnit("cm")}>cm</Button>
                <Button size="sm" variant={heightUnit === "pol" ? "default" : "ghost"} className={cn("rounded-full px-6", heightUnit === "pol" ? "bg-primary text-white" : "text-muted-foreground")} onClick={() => setHeightUnit("pol")}>pol</Button>
              </div>
            </div>
            <div className="text-6xl font-black text-foreground flex items-baseline justify-center gap-1">
              {state.height}<span className="text-2xl font-bold text-muted-foreground">{heightUnit}</span>
            </div>
            <div className="relative py-10 select-none">
              <div ref={heightRulerRef} onScroll={handleHeightScroll} onMouseDown={(e) => handleRulerDragStart(e, heightRulerRef)} onMouseUp={handleRulerDragEnd} onMouseLeave={handleRulerDragEnd} onMouseMove={(e) => handleRulerDragMove(e, heightRulerRef)} onTouchStart={(e) => handleRulerDragStart(e, heightRulerRef)} onTouchEnd={handleRulerDragEnd} onTouchMove={(e) => handleRulerDragMove(e, heightRulerRef)} className="w-full flex items-end gap-0 overflow-x-auto no-scrollbar px-[50%] py-4 scroll-smooth cursor-grab active:cursor-grabbing">
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-1 bg-primary rounded-full shadow-lg z-10 pointer-events-none" />
            </div>
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl bg-primary text-white">PRÓXIMO PASSO</Button>
            </div>
          </div>
        );

      case 16:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Qual seu peso atual?</h2>
            <div className="text-6xl font-black text-foreground flex items-baseline justify-center gap-1">
              {state.weight}<span className="text-2xl font-bold text-muted-foreground">kg</span>
            </div>
            <div className="relative py-10 select-none">
              <div ref={weightRulerRef} onScroll={handleWeightScroll} onMouseDown={(e) => handleRulerDragStart(e, weightRulerRef)} onMouseUp={handleRulerDragEnd} onMouseLeave={handleRulerDragEnd} onMouseMove={(e) => handleRulerDragMove(e, weightRulerRef)} onTouchStart={(e) => handleRulerDragStart(e, weightRulerRef)} onTouchEnd={handleRulerDragEnd} onTouchMove={(e) => handleRulerDragMove(e, weightRulerRef)} className="w-full flex items-end gap-0 overflow-x-auto no-scrollbar px-[50%] py-4 scroll-smooth cursor-grab active:cursor-grabbing">
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
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl bg-primary text-white">PRÓXIMO PASSO</Button>
            </div>
          </div>
        );

      case 17:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight px-6">E qual é seu objetivo de peso ideal?</h2>
            <div className="text-6xl font-black text-foreground flex items-baseline justify-center gap-1">
              {state.targetWeight}<span className="text-2xl font-bold text-muted-foreground">kg</span>
            </div>
            <div className="relative py-10 select-none">
              <div ref={targetWeightRulerRef} onScroll={handleTargetWeightScroll} onMouseDown={(e) => handleRulerDragStart(e, targetWeightRulerRef)} onMouseUp={handleRulerDragEnd} onMouseLeave={handleRulerDragEnd} onMouseMove={(e) => handleRulerDragMove(e, targetWeightRulerRef)} onTouchStart={(e) => handleRulerDragStart(e, targetWeightRulerRef)} onTouchEnd={handleRulerDragEnd} onTouchMove={(e) => handleRulerDragMove(e, targetWeightRulerRef)} className="w-full flex items-end gap-0 overflow-x-auto no-scrollbar px-[50%] py-4 scroll-smooth cursor-grab active:cursor-grabbing">
                {Array.from({ length: 276 }).map((_, i) => {
                  const val = i + 25;
                  const isMajor = val % 10 === 0;
                  return (
                    <div key={val} className="flex flex-col items-center shrink-0 w-[10px]">
                      <div className="bg-muted-foreground/20 h-6 w-0.5" />
                      {isMajor && <span className="text-xs text-muted-foreground mt-2 font-medium">{val}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-1 bg-primary rounded-full shadow-lg z-10 pointer-events-none" />
            </div>
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl bg-primary text-white">PRÓXIMO PASSO</Button>
            </div>
          </div>
        );

      case 18:
        return (
          <div className="space-y-8 text-center px-4 max-sm mx-auto">
            <h2 className="text-4xl font-bold text-[#0F172A] leading-tight">Qual sua idade?</h2>
            <div className="pt-4">
              <Input type="number" placeholder="Exemplo: 39" className="h-16 rounded-3xl text-center text-xl italic border-primary/20 bg-white shadow-sm focus-visible:ring-primary" value={state.age || ""} onChange={(e) => updateState("age", e.target.value)} />
            </div>
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl bg-primary text-white">PRÓXIMO PASSO</Button>
            </div>
          </div>
        );

      case 19:
        return (
          <div className="space-y-10 text-center py-4 w-full max-w-lg mx-auto px-4">
            <div className="space-y-2">
              <div className="flex flex-col items-center gap-1 mb-2">
                <h3 className="text-xl font-bold text-slate-900">Analisando o seu perfil...</h3>
                <p className="text-sm text-muted-foreground font-medium italic">aguarde um momento ...</p>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-4 items-center justify-end">
                  <span className="text-xs font-bold inline-block text-primary">
                    {step19Progress}%
                  </span>
                </div>
                <Progress value={step19Progress} className="h-2.5 bg-secondary shadow-inner" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.1] tracking-tight px-2">
              No total, durante os últimos 3 meses, nossos usuários perderam em média <br />
              <span className="text-[#10B981] text-4xl font-black">14+ kg</span> <span className="text-3xl">🤩</span>
            </h2>

            <Carousel setApi={setApi} className="w-full max-w-[360px] mx-auto" opts={{ loop: true }}>
              <CarouselContent>
                {[
                  {
                    name: "Rafaela",
                    date: "01/04/2026",
                    text: '"Essa foi de longe a melhor escolha que eu fiz na minha vida! Exercícios que realmente funciona e trazem resultados rápidos.. 🙏"',
                    img: "https://picsum.photos/seed/rafaela/100/100"
                  },
                  {
                    name: "Letícia",
                    date: "05/04/2026",
                    text: '"Eu estava desanimada, mas o Programa Feminino de Definição mudou tudo. Perdi 8kg e me sinto outra mulher! 😍"',
                    img: "https://picsum.photos/seed/leticia/100/100"
                  },
                  {
                    name: "Amanda",
                    date: "12/04/2026",
                    text: '"Incrível como os exercícios são simples mas funcionam tanto. Minha barriga sumiu! Recomendo demais. 🙌"',
                    img: "https://picsum.photos/seed/amanda/100/100"
                  }
                ].map((testimonial, i) => (
                  <CarouselItem key={i}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-50 relative overflow-hidden text-left premium-shadow"
                    >
                      <div className="flex gap-4 items-start mb-5">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 shadow-sm">
                          <Image src={testimonial.img} alt={testimonial.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                           <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                          </div>
                          <h4 className="font-black text-slate-900 leading-none text-lg">{testimonial.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{testimonial.date}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed italic text-base">
                        {testimonial.text}
                      </p>
                      <div className="absolute top-4 right-4 text-primary/5">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 15.238 16.255 13 19.017 13H21V21H14.017ZM3.017 21L3.017 18C3.017 15.238 5.255 13 8.017 13H10V21H3.017Z" /></svg>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        );

      case 20:
        return (
          <div className="space-y-6 text-center py-4 max-w-md mx-auto w-full px-4">
            <h2 className="text-3xl font-black leading-tight text-slate-900">Prepare-se para ver <span className="text-[#10B981]">{state.targetWeight}kg</span> no espelho!</h2>
            <div className="relative">
              <div className="flex justify-between items-end px-8 relative z-20 pointer-events-none h-14">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase leading-none mb-1">Seu peso</span>
                  <span className="text-2xl font-black text-slate-900 leading-none">{currentWeightValue}kg</span>
                </div>
                <div className="text-right flex flex-col items-center">
                  <div className="bg-primary text-white px-4 py-1.5 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 leading-none">{targetWeightValue}kg</div>
                  <span className="text-[10px] font-bold text-primary mt-1 uppercase leading-none">3 semanas</span>
                </div>
              </div>

              <div className="relative w-full h-[320px] mt-2 overflow-hidden bg-white rounded-[2.5rem] border border-primary/5 p-4 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradientStep20" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="50%" stopColor="#facc15" stopOpacity={0.8}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" hide />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
                    <CustomAreaChartArea type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={5} fill="url(#areaGradientStep20)" animationDuration={2000} />
                    <ReferenceDot x="SEMANA 1" y={currentWeightValue} r={6} fill="#fff" stroke="#94a3b8" strokeWidth={3} />
                    <ReferenceDot x="SEMANA 3" y={targetWeightValue} r={6} fill="#fff" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-8">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl bg-primary text-white flex items-center justify-center gap-3">CONTINUAR <ArrowRight className="w-6 h-6" /></Button>
            </div>
          </div>
        );

      case 21:
        return (
          <div className="space-y-12 text-center px-4">
            <h2 className="text-2xl font-bold text-[#0F172A] leading-tight px-6">Quanto tempo você deseja dedicar em seu corpo no dia?</h2>
            <div className="grid grid-cols-2 gap-4">
              {["5 minutos", "10 minutos", "15 minutos", "30 minutos"].map((opt) => (
                <Button key={opt} variant={state.dedicationTime === opt ? "default" : "outline"} className={cn("h-20 rounded-2xl border-2 transition-all flex flex-col justify-center items-center gap-1 bg-white", state.dedicationTime === opt ? "border-primary shadow-lg ring-1 ring-primary" : "border-primary/10 hover:border-primary/40")} onClick={() => { updateState("dedicationTime", opt); setTimeout(nextStep, 300); }}>
                  <span className={cn("font-bold text-base", state.dedicationTime === opt ? "text-primary" : "text-foreground")}>{opt}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 22:
        return (
          <div className="space-y-10 py-6 text-center w-full max-lg mx-auto">
            <div className="space-y-4 px-4">
               <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Analizando o seu perfil...</span>
                <span className="text-[10px] font-bold text-primary">{step22Progress}%</span>
              </div>
              <Progress value={step22Progress} className="h-1.5 bg-secondary" />
              <p className="text-sm font-bold text-muted-foreground">Criando seu plano de treino personalizado de definição feminina</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-primary leading-none">1 milhão de pessoas</h2>
          </div>
        );

      case 23:
        return <LoadingScreen title="Seu plano feminino personalizado está sendo criado..." steps={["Ajustando exercícios exclusivos", "Criando plano para pernas e glúteos", "Otimizando queima de gordura abdominal", "Finalizando rotina personalizada"]} onComplete={finishQuiz} duration={4000} />;

      case 24:
        return (
          <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 pb-10">
            <div className="relative w-full">
              <div className="flex justify-between items-end px-8 relative z-20 pointer-events-none mt-20 h-14">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase leading-none mb-1">Seu peso</span>
                  <span className="text-2xl font-black text-slate-900 leading-none">{currentWeightValue}kg</span>
                </div>
                <div className="text-right flex flex-col items-center">
                  <div className="bg-primary text-white px-4 py-1.5 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 leading-none">{targetWeightValue}kg</div>
                  <span className="text-[10px] font-bold text-primary mt-1 uppercase leading-none">3 semanas</span>
                </div>
              </div>

              <div className="relative w-full h-[320px] mt-2 overflow-hidden bg-white rounded-[2.5rem] border border-primary/5 p-4 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradientStep24" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="50%" stopColor="#facc15" stopOpacity={0.8}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" hide />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
                    <CustomAreaChartArea type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={5} fill="url(#areaGradientStep24)" animationDuration={2500} />
                    <ReferenceDot x="SEMANA 1" y={currentWeightValue} r={6} fill="#fff" stroke="#94a3b8" strokeWidth={3} />
                    <ReferenceDot x="SEMANA 3" y={targetWeightValue} r={6} fill="#fff" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-center space-y-4 mb-8 mt-10">
              <h1 className="text-2xl font-black text-slate-900 leading-tight">seu plano de definição em 21 dias está pronto!</h1>
            </div>
            <div className="bg-[#f3e8ff] p-8 rounded-[2rem] text-center mb-8 border-none w-full">
              <h3 className="text-primary font-black text-2xl mb-2">Mudança para sempre</h3>
              <p className="text-primary text-sm leading-relaxed font-medium">Assim que atingir o seu peso ideal, utilizaremos as últimas semanas do seu programa para o ajudar a criar hábitos saudáveis!</p>
            </div>
            <div className="mt-4 w-full">
              <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl bg-primary text-white uppercase tracking-widest">CONTINUAR</Button>
            </div>
          </div>
        );

      case 25:
        const CTACard = () => (
          <section className="relative w-full max-w-[440px] mx-auto px-4 py-10">
            <div className="rounded-[2.5rem] border-2 border-primary bg-white overflow-hidden shadow-2xl">
              <div className="bg-primary py-3 text-center">
                <span className="text-white font-black text-[10px] uppercase tracking-[0.15em]">
                  ESSE DESCONTO ACABARÁ HOJE!
                </span>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 text-left">
                    <h3 className="text-xl font-black text-slate-900">Programa Feminino de Definição</h3>
                    <div className="space-y-0">
                      <p className="text-red-500 line-through text-base italic font-medium">R$ 47,90</p>
                      <p className="text-primary font-black text-4xl tracking-tight">R$ 27,90</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 text-center min-w-[100px]">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none tracking-widest mb-1">VITALÍCIO</p>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-xs font-black text-slate-900">R$</span>
                      <span className="text-2xl font-black text-slate-900">0,93</span>
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none tracking-widest mt-1">POR DIA</p>
                  </div>
                </div>
                <Button className="w-full py-10 text-xl font-black rounded-[1.8rem] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 uppercase tracking-tight h-auto">
                  OBTER MEU PLANO AGORA
                </Button>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Acesso imediato e vitalício
              </p>
            </div>
          </section>
        );

        return (
          <div className="w-full bg-background overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 flex flex-col items-center">
              
              <div 
                ref={sliderRef}
                className="relative w-full aspect-square max-w-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white cursor-ew-resize select-none"
                onMouseMove={handleComparisonMove}
                onTouchMove={handleComparisonMove}
              >
                <div className="absolute inset-0">
                  <Image src="/foto1.png" alt="Antes" fill className="object-cover" priority />
                </div>
                <div 
                  className="absolute inset-0 z-10" 
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <Image src="/foto2.png" alt="Depois" fill className="object-cover" priority />
                </div>
                <div 
                  className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-xl flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center -translate-x-1/2">
                    <div className="flex gap-0.5">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-400" />
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4 px-4">
                <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] leading-tight">
                  Seu plano de Programa Feminino de Definição está pronto!
                </h1>
              </div>

              <CTACard />

              <section className="w-full max-w-2xl mx-auto space-y-10 py-10">
                <h2 className="text-3xl font-black text-slate-900 text-center uppercase tracking-tight">
                  O que você vai receber
                </h2>
                
                <div className="space-y-5 px-4">
                  {[
                    "Exercícios fáceis, suaves e seguros para qualquer nível físico",
                    "Exercícios para melhorar a flexibilidade, reduzir dores nos músculos e melhorar a circulação",
                    "Stress e ansiedade reduzidos",
                    "Melhoria da pressão arterial e da saúde das articulações",
                    "Corpo forte, tonificado e definido",
                    "+21 aulas para você assistir onde quiser",
                    "Receitas Personalizadas para acelerar o seu emagrecimento"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 bg-primary rounded-sm p-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                      </div>
                      <span className="font-bold text-slate-800 text-lg leading-tight">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border-8 border-white bg-slate-100 mt-8">
                  <Image 
                    src="/videos.gif" 
                    alt="Vídeo das aulas" 
                    fill 
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </section>

              <section className="w-full max-w-2xl mx-auto space-y-10 py-10 text-center px-4">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                  Descubra os benefícios do <br /> Programa Feminino de Definição
                </h2>
                
                <div className="space-y-16">
                  <div className="space-y-8">
                    <div className="relative w-full max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden shadow-lg bg-slate-50">
                      <Image 
                        src="/perdadepeso.webp" 
                        alt="Benefício Perda de Peso" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900">Perda de peso</h3>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium">
                        O excesso de peso representa grandes riscos para a nossa autoestima e saúde geral. 
                        Você pode se livrar do excesso de gordura de maneira rápida e efetiva com o nosso programa. 
                        Você consegue se livrar rapidamente da gordura localizada com o plano personalizado.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="relative w-full max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden shadow-lg bg-slate-50">
                      <Image 
                        src="/forca.webp" 
                        alt="Benefício Força e Definição" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900">Força e Definição</h3>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium">
                        Você se encontra constantemente sem energia ou força para fazer as coisas que costumava fazer? 
                        Esse plano personalizado irá te ajudar a se sentir mais enérgico e aumentar sua força rapidamente com apenas 10 minutos por dia.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="relative w-full max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden shadow-lg bg-slate-50">
                      <Image 
                        src="/gluteos1.png" 
                        alt="Benefício Glúteos e Pernas" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900">Glúteos e Pernas</h3>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium">
                        A definição da parte inferior do corpo é um dos pilares do nosso programa. 
                        Com exercícios de ativação muscular profunda, você vai tonificar glúteos e pernas, combatendo a flacidez e esculpindo suas curvas de forma natural e eficiente.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="w-full max-w-2xl mx-auto space-y-12 py-10 text-center px-4">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  Confira os resultados de algumas das nossas alunas que aplicaram o método
                </h2>

                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-primary">Marta | -9kg</h3>
                      <p className="font-bold text-slate-900">Perdeu 9kg em apenas 17 dias.</p>
                    </div>
                    <div className="relative w-full max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white">
                      <Image 
                        src="/feedback1.webp" 
                        alt="Resultado Marta" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-primary">Adriana | -9kg</h3>
                      <p className="font-bold text-slate-900">Perdeu 9kg em apenas 19 dias.</p>
                    </div>
                    <div className="relative w-full max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white">
                      <Image 
                        src="/feedback2.webp" 
                        alt="Resultado Adriana" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-primary">Juliana | -6kg</h3>
                      <p className="font-bold text-slate-900">Perdeu 10kg em apenas 23 dias</p>
                    </div>
                    <div className="relative w-full max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white">
                      <Image 
                        src="/feedback3.webp" 
                        alt="Resultado Juliana" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <CTACard />

              <section className="w-full max-w-2xl mx-auto px-4 py-10 space-y-8 flex flex-col items-center">
                <div className="bg-[#f3e8ff] p-8 rounded-[2.5rem] text-center space-y-4 w-full border-none">
                  <h3 className="text-primary font-black text-2xl">Garantia de 90 Dias</h3>
                  <p className="text-primary text-base leading-relaxed font-medium">
                    Se em até 90 dias você não estiver completamente satisfeita com os resultados, basta entrar em contato com a equipe, e nós devolvemos 100% do seu dinheiro, sem perguntas.
                  </p>
                  <p className="text-primary text-lg font-bold">
                    Seu investimento é totalmente seguro!
                  </p>
                </div>
                <div className="relative w-48 h-48 mt-4">
                  <Image 
                    src="/garantia.webp" 
                    alt="Garantia de 90 Dias" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </section>

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

      <div className={cn("w-full flex-1 flex flex-col items-center", stepId >= TOTAL_STEPS - 2 ? "pt-10" : "pt-20")}>
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
          <motion.div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-4 px-6">
        <AnimatePresence mode="wait">
          <motion.p key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-lg font-bold text-primary animate-pulse">{steps[currentStep]}</motion.p>
        </AnimatePresence>
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary" style={{ width: `${prog}%` }} />
        </div>
      </div>
    </div>
  );
}

const CustomAreaChartArea = (props: any) => {
  const { path } = props;
  if (!path || path.includes('NaN')) return null;
  return <RechartsArea {...props} />;
};
CustomAreaChartArea.displayName = "CustomAreaChartArea";

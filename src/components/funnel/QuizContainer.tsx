
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Activity, Users, Star, Lock, Heart, Clock, Utensils, Droplets, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { generatePersonalizedAfricanMethodPlan, type GeneratePersonalizedAfricanMethodPlanInput, type GeneratePersonalizedAfricanMethodPlanOutput } from "@/ai/flows/generate-personalized-african-method-plan";
import { QuizStep } from "./QuizStep";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 45;
const STORAGE_KEY = "vitalidade_africana_quiz_state";

const INITIAL_STATE: GeneratePersonalizedAfricanMethodPlanInput = {
  name: "",
  age: 30,
  heightCm: 165,
  currentWeightKg: 75,
  targetWeightKg: 60,
  ageRange: "30 a 39 anos",
  mainGoal: "Perder peso",
  dreamBodyType: "Fitness",
  currentPhysiqueDescription: "Gordinha",
  weightChangeTendency: "Eu ganho peso facilmente",
  timeSinceBestPhysique: "Faz 1 a 3 anos",
  importantEvent: "Nenhum evento especial em breve",
  eventsLeadingToWeightGain: ["Nenhum dos itens acima"],
  preferredDietType: ["Tradicional"],
  mealTimes: {
    breakfast: "Entre 8h00 e 10h00",
    lunch: "Entre meio-dia e 13h00",
    dinner: "Entre 19h00 e 20h00",
  },
  sleepFrequency: "6-7 horas",
  waterIntake: "2 a 6 copos",
  energyLevels: "Sinto uma qeuda de energia depois do almoço",
  typicalDayDescription: "Eu passo a maior parte do dia sentada",
  workRoutine: "Das 9h às 17h",
  walkingFrequency: "De vez em quando",
  exerciseFrequency: "Várias vezes por mês",
  breathlessnessOnStairs: "Fico sem fôlego, mas consigo falar",
  difficulties: ["Inchaço abdominal"],
  focusAreas: ["Barriga"],
  flexibility: "Estou começando",
  triedMethodsBefore: false,
  weeklyRoutineConsistency: "3 a 5 dias",
  dailyTimeDedication: "10 minutos",
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

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar estado do quiz", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isClient]);

  const nextStep = () => {
    if (stepId < TOTAL_STEPS) {
      router.push(`/step/${stepId + 1}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (stepId > 1) {
      router.push(`/step/${stepId - 1}`);
    }
  };

  const updateState = (key: keyof GeneratePersonalizedAfricanMethodPlanInput, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const updateMealTime = (meal: keyof typeof state.mealTimes, value: string) => {
    setState((prev) => ({
      ...prev,
      mealTimes: { ...prev.mealTimes, [meal]: value as any },
    }));
  };

  const finishQuiz = async () => {
    setLoading(true);
    try {
      const result = await generatePersonalizedAfricanMethodPlan(state);
      setQuizOutput(result);
      router.push(`/step/${stepId + 1}`);
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  const progress = (stepId / TOTAL_STEPS) * 100;

  const ageRanges = [
    { label: "18 a 29 anos", imageUrl: "/18-29y.webp" },
    { label: "30 a 39 anos", imageUrl: "/29-39y.webp" },
    { label: "40 a 49 anos", imageUrl: "/39-49y.webp" },
    { label: "50+ anos", imageUrl: "/+50y.webp" }
  ];

  const renderStep = () => {
    switch (stepId) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold leading-tight">Qual sua idade?</h1>
            <p className="text-muted-foreground">Isso nos ajuda a adaptar seu plano ao seu momento atual.</p>
            <div className="grid grid-cols-2 gap-4">
              {ageRanges.map((range) => {
                return (
                  <Card 
                    key={range.label} 
                    className="p-0 flex flex-col items-center cursor-pointer border-2 border-primary transition-all hover:scale-[1.02] overflow-hidden bg-white"
                    onClick={() => { updateState("ageRange", range.label); nextStep(); }}
                  >
                    <div className="relative w-full aspect-square">
                      <Image 
                        src={range.imageUrl} 
                        alt={range.label} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="py-4 w-full text-center">
                      <span className="font-bold text-lg text-primary">{range.label}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        const displayAge = state.ageRange.split(' ')[0];
        return (
          <div className="space-y-8 text-center px-2">
            <h2 className="text-4xl font-black text-primary leading-none uppercase tracking-tight">
              Mais de 500.000 mulheres
            </h2>
            <p className="text-lg text-muted-foreground leading-snug">
              em <span className="font-bold text-foreground">seus {displayAge} anos</span> já experimentaram o nosso protocolo do Método Africano
            </p>
            <div className="relative w-full aspect-[4/5] max-w-sm mx-auto">
              <Image 
                src="/mulheres.webp" 
                alt="Mulheres" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-wide">
              Continuar
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">O que você vai receber</h2>
            <div className="space-y-4">
              {[
                "Guia alimentar simples para o dia a dia",
                "Receitas naturais inspiradas em hábitos africanos",
                "Estratégias para reduzir fome emocional",
                "Plano adaptado à sua rotina",
                "Orientação para melhorar saciedade",
                "Acesso imediato no celular"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="relative h-48 w-full mt-4">
              <Image src={PlaceHolderImages.find(img => img.id === 'mockup-phone')?.imageUrl || ''} alt="Mockup" fill className="object-contain" />
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-primary">
              <Image src={PlaceHolderImages.find(img => img.id === 'woman-posing')?.imageUrl || ''} alt="Woman" width={128} height={128} className="object-cover" />
            </div>
            <h2 className="text-2xl font-bold">Seu plano personalizado está quase pronto</h2>
            <p className="text-muted-foreground">Responda algumas perguntas rápidas para ajustarmos sua recomendação.</p>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Começar avaliação</Button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Seu possível progresso</h2>
            <div className="bg-white p-6 rounded-2xl shadow-inner h-48 flex items-end justify-around gap-2 border border-primary/20">
              {[40, 60, 50, 80, 70, 95, 100].map((h, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-lg transition-all" style={{ height: `${h}%` }}>
                  {i === 6 && <div className="h-full bg-primary rounded-t-lg" />}
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary p-4 rounded-xl flex gap-3">
              <Zap className="w-6 h-6 text-primary shrink-0" />
              <p className="text-sm text-primary font-medium">Plano criado para ser simples, leve e realista.</p>
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Qual é o seu nome?</h2>
            <Input 
              value={state.name} 
              onChange={(e) => updateState("name", e.target.value)} 
              placeholder="Digite seu nome" 
              className="text-center py-6 text-xl rounded-xl border-primary"
            />
            <Button disabled={!state.name} onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-xl font-medium">Analisando perfis semelhantes ao seu...</h2>
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "47%" }} 
                className="bg-primary h-full"
              />
            </div>
            <p className="text-muted-foreground">47% concluído</p>
            <Card className="p-4 bg-primary/5 border-primary text-left">
              <p className="text-sm italic">&quot;Milhares de mulheres já buscaram uma rotina mais leve e simples.&quot;</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <span className="text-xs font-bold">Ana S., 34 anos</span>
              </div>
            </Card>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Quantos dias por semana você consegue seguir uma rotina simples?</h2>
            <div className="space-y-3">
              {["1 a 2 dias", "3 a 5 dias", "Todos os dias"].map((opt) => (
                <Card 
                  key={opt}
                  className={cn("p-5 flex items-center justify-between cursor-pointer border-2 transition-all", state.weeklyRoutineConsistency === opt ? "border-primary bg-primary/5" : "border-primary/20")}
                  onClick={() => { updateState("weeklyRoutineConsistency", opt); nextStep(); }}
                >
                  <span className="font-semibold">{opt}</span>
                  <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                    {state.weeklyRoutineConsistency === opt && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Quanto tempo você consegue dedicar ao seu corpo no dia?</h2>
            <div className="grid grid-cols-2 gap-4">
              {["5 minutos", "10 minutos", "20 minutos", "30 minutos"].map((opt) => (
                <Button 
                  key={opt}
                  variant={state.dailyTimeDedication === opt ? "default" : "outline"}
                  className={cn("py-10 text-lg rounded-2xl flex flex-col gap-1 border-primary", state.dailyTimeDedication === opt ? "" : "text-primary hover:bg-primary/10")}
                  onClick={() => { updateState("dailyTimeDedication", opt); nextStep(); }}
                >
                  {opt}
                  <span className="text-[10px] font-normal opacity-70">por dia</span>
                </Button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">Não precisa ser perfeito. Precisa ser possível.</p>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">O plano que você precisa para começar sua mudança</h2>
            <div className="relative h-40 w-full">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl" />
              <div className="absolute inset-x-4 bottom-4 h-24 bg-primary/20 rounded-xl overflow-hidden">
                <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="h-full w-full bg-gradient-to-r from-primary/50 to-primary flex items-center justify-end px-4">
                  <Activity className="text-white w-8 h-8" />
                </motion.div>
              </div>
            </div>
            <Card className="p-4 bg-primary text-white border-none">
              <p className="text-sm font-medium">Protocolo de 21 dias quase pronto. Baseado nas suas respostas, vamos montar uma recomendação simples para sua rotina.</p>
            </Card>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 11:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-xl font-bold">Analisando seu perfil...</h2>
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden border border-primary/20">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "55%" }} 
                className="bg-primary h-full"
              />
            </div>
            <div className="space-y-2 animate-pulse">
              <p className="text-sm text-primary font-medium">Verificando rotina</p>
              <p className="text-xs text-muted-foreground">Calculando objetivo</p>
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 12:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Você tem algum evento importante pela frente?</h2>
            <p className="text-center text-muted-foreground text-sm">Isso ajuda a adaptar sua meta de curto prazo.</p>
            <div className="grid grid-cols-2 gap-3">
              {["Férias", "Casamento", "Aniversário", "Reunião importante", "Outro", "Nenhum evento especial em breve"].map((opt) => (
                <Button 
                  key={opt}
                  variant={state.importantEvent === opt ? "default" : "outline"}
                  className="py-8 rounded-xl border-primary"
                  onClick={() => { updateState("importantEvent", opt); nextStep(); }}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        );

      case 13:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl font-bold">Qual sua idade?</h2>
            <div className="text-5xl font-bold text-primary">{state.age}</div>
            <Slider 
              value={[state.age]} 
              min={18} 
              max={80} 
              step={1} 
              onValueChange={([val]) => updateState("age", val)}
              className="text-primary"
            />
            <div className="bg-primary/10 p-4 rounded-xl text-primary text-sm flex gap-2 border border-primary/20">
              <Activity className="shrink-0 w-5 h-5" />
              <span>A recomendação muda conforme idade, rotina e objetivo.</span>
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 14:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl font-bold">E qual é o seu objetivo de peso ideal?</h2>
            <div className="text-5xl font-bold text-primary">{state.targetWeightKg} kg</div>
            <Slider 
              value={[state.targetWeightKg]} 
              min={30} 
              max={150} 
              step={1} 
              onValueChange={([val]) => updateState("targetWeightKg", val)}
            />
            <p className="text-xs text-muted-foreground">Você poderá ajustar isso depois.</p>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 15:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl font-bold">Qual seu peso atual?</h2>
            <div className="text-5xl font-bold text-primary">{state.currentWeightKg} kg</div>
            <Slider 
              value={[state.currentWeightKg]} 
              min={30} 
              max={200} 
              step={1} 
              onValueChange={([val]) => updateState("currentWeightKg", val)}
            />
            <div className="flex justify-between items-center px-4 py-2 bg-secondary rounded-full text-xs font-bold border border-primary/20">
              <span>Atual: {state.currentWeightKg}kg</span>
              <ArrowRight className="w-3 h-3 text-primary" />
              <span className="text-primary">Meta: {state.targetWeightKg}kg</span>
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 16:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl font-bold">Qual sua altura?</h2>
            <div className="text-5xl font-bold text-primary">{state.heightCm} cm</div>
            <Slider 
              value={[state.heightCm]} 
              min={100} 
              max={220} 
              step={1} 
              onValueChange={([val]) => updateState("heightCm", val)}
            />
            <div className="bg-primary/5 p-4 rounded-xl text-primary text-sm border border-primary/20">
              Combinamos sua altura com objetivo para montar uma recomendação mais coerente.
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 17:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Algum desses eventos da vida levou a um ganho de peso nos últimos anos?</h2>
            <div className="grid gap-2">
              {[
                "Casamento ou relacionamento",
                "Vida profissional ou familiar ocupada",
                "Desafios financeiros",
                "Lesão ou limitação",
                "Sintomas ou problemas de saúde mental",
                "Metabolismo mais lento devido ao envelhecimento",
                "Compulsão ou ansiedade alimentar",
                "Nenhum dos itens acima"
              ].map((opt) => (
                <Card 
                  key={opt}
                  className={cn("p-4 flex items-center gap-3 cursor-pointer transition-all border-2", state.eventsLeadingToWeightGain.includes(opt as any) ? "border-primary bg-primary/5" : "border-primary/20")}
                  onClick={() => {
                    const current = state.eventsLeadingToWeightGain;
                    if (current.includes(opt as any)) {
                      updateState("eventsLeadingToWeightGain", current.filter(i => i !== opt));
                    } else {
                      updateState("eventsLeadingToWeightGain", [...current.filter(i => i !== "Nenhum dos itens acima"), opt]);
                    }
                  }}
                >
                  <Checkbox checked={state.eventsLeadingToWeightGain.includes(opt as any)} className="border-primary" readOnly />
                  <span className="text-sm font-medium">{opt}</span>
                </Card>
              ))}
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 18:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Que tipo de dieta você prefere?</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase mb-2">OPÇÕES</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Tradicional", "Keto", "Vegetariana", "Vegana", "Mediterrânea", "Sem lactose", "Sem glúten"].map(d => (
                    <Button key={d} variant={state.preferredDietType.includes(d as any) ? "default" : "outline"} className="border-primary" onClick={() => updateState("preferredDietType", [d])}>{d}</Button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full mt-4">Próxima etapa</Button>
          </div>
        );

      case 19:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Que horas você janta?</h2>
            <div className="space-y-3">
              {["Entre 18h00 e 19h00", "Entre 19h00 e 20h00", "Entre 20h00 e 21h00", "Eu normalmente pulo o jantar"].map(opt => (
                <Button key={opt} variant={state.mealTimes.dinner === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl border-primary" onClick={() => { updateMealTime("dinner", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 20:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">E o almoço?</h2>
            <div className="space-y-3">
              {["Entre 11h00 e meio-dia", "Entre meio-dia e 13h00", "Entre 13h00 e 14h00", "Eu normalmente pulo o almoço"].map(opt => (
                <Button key={opt} variant={state.mealTimes.lunch === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl border-primary" onClick={() => { updateMealTime("lunch", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 21:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Quando você normalmente toma café da manhã?</h2>
            <div className="space-y-3">
              {["Entre 6h00 e 8h00", "Entre 8h00 e 10h00", "Entre 10h00 e meio-dia", "Eu normalmente pulo o café da manhã"].map(opt => (
                <Button key={opt} variant={state.mealTimes.breakfast === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl border-primary" onClick={() => { updateMealTime("breakfast", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 22:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Com que frequência você dorme?</h2>
            <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary">
              <Image src={PlaceHolderImages.find(img => img.id === 'sleep-woman')?.imageUrl || ''} alt="Sleep" fill className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Menos de 5 horas", "6-7 horas", "8-9 horas", "Mais de 9 horas"].map(opt => (
                <Button key={opt} variant={state.sleepFrequency === opt ? "default" : "outline"} className="py-8 rounded-xl border-primary" onClick={() => { updateState("sleepFrequency", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 23:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Quantos copos de água você bebe diariamente?</h2>
            <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary">
              <Image src={PlaceHolderImages.find(img => img.id === 'water-woman')?.imageUrl || ''} alt="Water" fill className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Tento apenas não ter sede", "Cerca de 2 copos", "2 a 6 copos", "Mais de 6 copos"].map(opt => (
                <Button key={opt} variant={state.waterIntake === opt ? "default" : "outline"} className="py-8 rounded-xl border-primary" onClick={() => { updateState("waterIntake", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 24:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-primary">Nós vamos te ajudar</h2>
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">Com base nas suas respostas, vamos montar uma recomendação simples para você começar sem precisar mudar tudo de uma vez.</p>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 25:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Como são seus níveis de energia durante o dia?</h2>
            <div className="space-y-3">
              {[
                "Baixo, me sinto cansada durante o dia",
                "Sinto uma queda de energia depois do almoço",
                "Me arrasto entre as refeições",
                "Elevados e estáveis"
              ].map(opt => (
                <Button key={opt} variant={state.energyLevels === opt ? "default" : "outline"} className="w-full py-6 px-4 text-left justify-start rounded-2xl h-auto border-primary" onClick={() => { updateState("energyLevels", opt); nextStep(); }}>
                  <Zap className={cn("shrink-0 mr-3 w-5 h-5", state.energyLevels === opt ? "text-white" : "text-primary")} />
                  <span className="text-sm font-semibold">{opt}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 26:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Como você descreveria seu dia típico?</h2>
            <div className="space-y-3">
              {[
                "Eu passo a maior parte do dia sentada",
                "Sou ativa poucas vezes",
                "Estou de pé o dia todo"
              ].map(opt => (
                <Button key={opt} variant={state.typicalDayDescription === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl border-primary" onClick={() => { updateState("typicalDayDescription", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 27:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Como é a sua rotina de trabalho?</h2>
            <div className="space-y-3">
              {[
                "Das 9h às 17h",
                "Meus horários são flexíveis",
                "Trabalho em turnos",
                "Estou aposentada / não estou trabalhando"
              ].map(opt => (
                <Button key={opt} variant={state.workRoutine === opt ? "default" : "outline"} className="w-full py-6 h-auto text-left justify-start px-4 rounded-2xl border-primary" onClick={() => { updateState("workRoutine", opt); nextStep(); }}>
                  <Clock className="w-5 h-5 mr-3 shrink-0 text-primary" />
                  <span className="font-semibold">{opt}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 28:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Com que frequência você sai para caminhadas?</h2>
            <div className="grid grid-cols-2 gap-3">
              {["Quase todos os dias", "De vez em quando", "1-2 vezes p/ semana", "Uma vez p/ mês"].map(opt => (
                <Button key={opt} variant={state.walkingFrequency === opt ? "default" : "outline"} className="py-8 rounded-xl h-auto border-primary" onClick={() => { updateState("walkingFrequency", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 29:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Quantas vezes você faz exercício?</h2>
            <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-6 border-4 border-primary">
              <Image src={PlaceHolderImages.find(img => img.id === 'exercise-woman')?.imageUrl || ''} alt="Exercise" fill className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Quase todos os dias", "Várias vezes por semana", "Várias vezes por mês", "Nunca"].map(opt => (
                <Button key={opt} variant={state.exerciseFrequency === opt ? "default" : "outline"} className="py-8 rounded-xl h-auto border-primary" onClick={() => { updateState("exerciseFrequency", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 30:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Você perde o fôlego quando sobe escadas?</h2>
            <div className="space-y-3">
              {[
                "Fico sem fôlego quase sempre",
                "Fico sem fôlego, mas consigo falar",
                "Me sinto OK depois de subir escadas",
                "Consigo subir vários lances"
              ].map(opt => (
                <Button key={opt} variant={state.breathlessnessOnStairs === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl h-auto px-4 border-primary" onClick={() => { updateState("breathlessnessOnStairs", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 31:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Você tem dificuldade com algum dos itens abaixo?</h2>
            <div className="grid gap-2">
              {[
                "Cansaço constante",
                "Inchaço abdominal",
                "Vontade de doces à noite",
                "Ansiedade alimentar"
              ].map(opt => (
                <Card 
                  key={opt}
                  className={cn("p-4 flex items-center gap-3 cursor-pointer border-2 transition-all", state.difficulties.includes(opt as any) ? "border-primary bg-primary/5" : "border-primary/20")}
                  onClick={() => {
                    const current = state.difficulties;
                    if (current.includes(opt as any)) {
                      updateState("difficulties", current.filter(i => i !== opt));
                    } else {
                      updateState("difficulties", [...current, opt]);
                    }
                  }}
                >
                  <Checkbox checked={state.difficulties.includes(opt as any)} className="border-primary" readOnly />
                  <span className="font-medium">{opt}</span>
                </Card>
              ))}
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Próxima etapa</Button>
          </div>
        );

      case 32:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Quais são suas regiões de foco?</h2>
            <p className="text-center text-sm text-muted-foreground">Selecione uma ou mais.</p>
            <div className="grid grid-cols-2 gap-4">
              {["Barriga", "Glúteos", "Pernas", "Braços"].map(opt => (
                <Card 
                  key={opt}
                  className={cn("p-6 flex flex-col items-center gap-2 cursor-pointer transition-all border-2", state.focusAreas.includes(opt as any) ? "border-primary bg-primary/5" : "border-primary/20")}
                  onClick={() => {
                    const current = state.focusAreas;
                    if (current.includes(opt as any)) {
                      updateState("focusAreas", current.filter(i => i !== opt));
                    } else {
                      updateState("focusAreas", [...current, opt]);
                    }
                  }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold">{opt}</span>
                </Card>
              ))}
            </div>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full mt-4">Continuar</Button>
          </div>
        );

      case 33:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Você se considera flexível?</h2>
            <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary">
              <Image src="https://picsum.photos/seed/yoga/400/400" alt="Flexibility" fill className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Bastante flexível", "Estou começando", "Não muito", "Não tenho certeza"].map(opt => (
                <Button key={opt} variant={state.flexibility === opt ? "default" : "outline"} className="py-8 rounded-xl h-auto border-primary" onClick={() => { updateState("flexibility", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 34:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Há quanto tempo você esteve no melhor físico da sua vida?</h2>
            <div className="space-y-3">
              {["Há menos de 1 ano", "Faz 1 a 3 anos", "Há mais de 3 anos", "Nunca"].map(opt => (
                <Button key={opt} variant={state.timeSinceBestPhysique === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl h-auto border-primary" onClick={() => { updateState("timeSinceBestPhysique", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 35:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Como seu peso muda tipicamente?</h2>
            <div className="space-y-3">
              {[
                "Não tenho dificuldade para perder peso",
                "Eu ganho peso facilmente",
                "Eu ganho peso facilmente mas tenho dificuldade para perder"
              ].map(opt => (
                <Button key={opt} variant={state.weightChangeTendency === opt ? "default" : "outline"} className="w-full py-8 h-auto text-center px-4 rounded-2xl border-primary" onClick={() => { updateState("weightChangeTendency", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 36:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Qual é o seu corpo dos sonhos?</h2>
            <div className="grid grid-cols-2 gap-3">
              {["Magra", "Definida", "Com curvas", "Fitness"].map(opt => (
                <Button key={opt} variant={state.dreamBodyType === opt ? "default" : "outline"} className="py-10 rounded-2xl h-auto font-bold border-primary" onClick={() => { updateState("dreamBodyType", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 37:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Como você descreveria seu físico?</h2>
            <div className="space-y-3">
              {["Magra", "Gordinha", "Maior", "Com excesso de peso"].map(opt => (
                <Button key={opt} variant={state.currentPhysiqueDescription === opt ? "default" : "outline"} className="w-full py-8 text-lg rounded-2xl h-auto border-primary" onClick={() => { updateState("currentPhysiqueDescription", opt); nextStep(); }}>{opt}</Button>
              ))}
            </div>
          </div>
        );

      case 38:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Qual é o seu principal objetivo?</h2>
            <div className="space-y-3">
              {[
                "Perder peso",
                "Aumentar a força muscular",
                "Desenvolver flexibilidade",
                "Reduzir o estresse e ansiedade",
                "Melhorar a postura"
              ].map(opt => (
                <Button key={opt} variant={state.mainGoal === opt ? "default" : "outline"} className="w-full py-6 h-auto text-left px-4 rounded-2xl border-primary" onClick={() => { updateState("mainGoal", opt); nextStep(); }}>
                  <Star className="w-5 h-5 mr-3 shrink-0 text-primary" />
                  <span className="font-semibold">{opt}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 39:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold">Você vai arrasar!</h2>
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-primary">
              <Image src="https://picsum.photos/seed/happy/300/300" alt="Happy" width={128} height={128} className="object-cover" />
            </div>
            <p className="text-lg text-muted-foreground">Estamos montando sua recomendação com base nas suas respostas. Pequenos hábitos podem criar grandes mudanças quando são simples de seguir.</p>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 40:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Você já experimentou métodos de emagrecimento antes?</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant={state.triedMethodsBefore ? "default" : "outline"} className="py-12 rounded-2xl flex flex-col gap-2 border-primary" onClick={() => { updateState("triedMethodsBefore", true); nextStep(); }}>
                <Check className="w-6 h-6" />
                <span>Sim, já tentei</span>
              </Button>
              <Button variant={!state.triedMethodsBefore ? "default" : "outline"} className="py-12 rounded-2xl flex flex-col gap-2 border-primary" onClick={() => { updateState("triedMethodsBefore", false); nextStep(); }}>
                <Users className="w-6 h-6" />
                <span>Nunca tentei</span>
              </Button>
            </div>
          </div>
        );

      case 41:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl font-bold leading-tight">Mais de 500.000 mulheres já buscaram uma rotina mais leve</h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative border border-primary/20">
                  <Image src={`https://picsum.photos/seed/face${i}/150/150`} alt="User" fill className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground">Entre para uma comunidade de mulheres que querem transformar hábitos sem complicação.</p>
            <Button onClick={nextStep} className="w-full py-6 text-lg rounded-full">Continuar</Button>
          </div>
        );

      case 42:
        return (
          <div className="space-y-12 text-center">
            <h2 className="text-2xl font-bold">Preparando seu resultado personalizado...</h2>
            <div className="w-full h-4 bg-secondary rounded-full overflow-hidden border border-primary/20">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "100%" }} 
                transition={{ duration: 3, ease: "linear" }}
                onAnimationComplete={finishQuiz}
                className="bg-primary h-full"
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary animate-pulse">Calculando rotina ideal</p>
              <p className="text-sm text-muted-foreground">Organizando recomendações</p>
            </div>
          </div>
        );

      case 43:
        if (!quizOutput) return <div className="text-center py-20 text-primary">Processando seu plano...</div>;
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Badge variant="outline" className="border-primary text-primary bg-primary/5 py-1 px-3">Análise Concluída</Badge>
              <h2 className="text-3xl font-bold text-primary">{quizOutput.planSummary}</h2>
              <h3 className="text-lg font-medium text-muted-foreground">{quizOutput.personalizationTitle}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-white border-primary shadow-sm space-y-1">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Objetivo</span>
                <p className="font-bold text-lg">{state.mainGoal}</p>
              </Card>
              <Card className="p-4 bg-white border-primary shadow-sm space-y-1">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Duração</span>
                <p className="font-bold text-lg">{quizOutput.suggestedDurationDays} dias</p>
              </Card>
              <Card className="p-4 bg-white border-primary shadow-sm space-y-1">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Nível</span>
                <p className="font-bold text-lg">{quizOutput.level}</p>
              </Card>
              <Card className="p-4 bg-white border-primary shadow-sm space-y-1">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Peso a Perder</span>
                <p className="font-bold text-lg">{quizOutput.weightLossGoalKg}kg</p>
              </Card>
            </div>
            <div className="bg-primary/10 border border-primary p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">{quizOutput.focusAreasSummary}</span>
              </div>
              <p className="text-sm leading-relaxed text-primary">{quizOutput.methodDescription}</p>
            </div>
            <Button onClick={nextStep} className="w-full py-8 text-xl rounded-full shadow-lg shadow-primary/30">Ver meu plano completo</Button>
          </div>
        );

      case 44:
        return (
          <div className="space-y-12">
            <header className="text-center space-y-6">
              <h1 className="text-3xl font-bold leading-tight text-primary">Descubra o Método Africano que está ajudando mulheres a controlar o apetite e apoiar a perda de peso natural</h1>
              <p className="text-lg text-muted-foreground">Um guia simples com receitas, horários e hábitos fáceis para aplicar no dia a dia.</p>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-primary">
                <Image src={PlaceHolderImages.find(img => img.id === 'result-celebration')?.imageUrl || ''} alt="Happy Woman" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <p className="font-bold">Acesso Imediato Liberado</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-primary">O que você recebe no Método:</h2>
              <div className="grid gap-4">
                {[
                  { title: "Plano Alimentar", desc: quizOutput?.recommendations.dietary, icon: <Utensils /> },
                  { title: "Guia de Hidratação", desc: quizOutput?.recommendations.hydration, icon: <Droplets /> },
                  { title: "Protocolo de Sono", desc: quizOutput?.recommendations.sleep, icon: <Clock /> },
                  { title: "Mentalidade Blindada", desc: quizOutput?.recommendations.mindset, icon: <Zap /> },
                ].map((item, i) => (
                  <Card key={i} className="p-4 flex gap-4 border-primary shadow-sm bg-white">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary border border-primary/20">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{item.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section className="bg-primary p-8 rounded-3xl text-white text-center space-y-6 shadow-xl">
              <h2 className="text-2xl font-bold">Oferta Especial de Lançamento</h2>
              <div className="space-y-1">
                <p className="text-sm line-through opacity-70">De R$ 97,00</p>
                <p className="text-5xl font-bold">R$ 29,90</p>
                <p className="text-xs opacity-70">ou 3x de R$ 10,50</p>
              </div>
              <Button onClick={nextStep} className="w-full py-8 text-xl rounded-full bg-white text-primary hover:bg-gray-100 font-bold border-none">QUERO ACESSAR AGORA</Button>
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1"><Lock className="w-3 h-3" /> SEGURO</div>
                <div className="flex items-center gap-1"><Check className="w-3 h-3" /> IMEDIATO</div>
              </div>
            </section>
          </div>
        );

      case 45:
        return (
          <div className="space-y-12 text-center py-10">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto text-white border-4 border-primary/20">
                <Check className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold text-primary">Seu acesso foi liberado</h1>
              <p className="text-muted-foreground">Receba o guia completo, as receitas e o protocolo direto no seu celular.</p>
            </div>

            <Card className="p-8 border-4 border-dashed border-primary bg-white space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Resumo do Pedido</h3>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Método Africano 21 Dias</span>
                  <span className="font-bold text-primary">R$ 29,90</span>
                </div>
              </div>
              <Button className="w-full py-10 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 animate-bounce">ACESSAR MEU PLANO AGORA</Button>
              <div className="space-y-3 pt-4 border-t border-primary/20">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-primary">
                  <Check className="w-4 h-4" /> Garantia de 7 dias incondicional
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-primary">
                  <Check className="w-4 h-4" /> Suporte VIP pelo WhatsApp
                </div>
              </div>
            </Card>

            <footer className="pt-10 space-y-4 text-[10px] text-muted-foreground">
              <p>*Resultados podem variar conforme rotina, alimentação e consistência.</p>
              <div className="flex justify-center gap-4 text-primary font-medium">
                <span>Termos de Uso</span>
                <span>Políticas de Privacidade</span>
              </div>
            </footer>
          </div>
        );

      default:
        return <div className="text-primary text-center py-10">Etapa {stepId}</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fafafa]">
      {/* Top Progress Bar */}
      {stepId < 43 && (
        <div className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-primary/20">
          <Button variant="ghost" size="icon" onClick={prevStep} disabled={stepId === 1} className="shrink-0 h-8 w-8 text-primary">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="flex-1 space-y-1">
            <Progress value={progress} className="h-1.5" />
          </div>
          <span className="text-[10px] font-bold text-primary shrink-0">{Math.round(progress)}%</span>
        </div>
      )}

      {/* Main Content */}
      <div className={cn("w-full pt-16 pb-20 flex-1 flex flex-col items-center", stepId >= 43 ? "pt-8" : "")}>
        <AnimatePresence mode="wait">
          <QuizStep key={stepId} stepId={stepId}>
            {renderStep()}
          </QuizStep>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Badge for Results/Offer */}
      {stepId === 44 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-lg border-t border-primary/20 md:hidden">
          <Button onClick={nextStep} className="w-full py-6 font-bold rounded-full shadow-lg shadow-primary/20">QUERO MEU PLANO AGORA</Button>
        </div>
      )}
    </div>
  );
}

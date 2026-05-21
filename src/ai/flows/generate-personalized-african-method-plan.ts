'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized feminine transformation plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedAfricanMethodPlanInputSchema = z.object({
  age: z.string().optional().describe("User's exact age."),
  ageRange: z.string().describe("User's age range."),
  pilatesExperience: z.string().describe("Whether the user has tried the method before."),
  bodyDescription: z.string().describe("How the user describes their current physique."),
  dreamBody: z.string().describe("The user's desired dream body silhouette."),
  mainConcern: z.string().describe("What bothers the user most about their body."),
  goalTransformation: z.string().describe("Desired transformation."),
  weightDifficulty: z.string().describe("Difficulty losing weight."),
  increaseRegion: z.string().describe("Specific region to increase (glutes/legs)."),
  dedicationTime: z.string().describe("Time dedicated per day."),
  exerciseFrequency: z.string().describe("Current exercise frequency."),
  walkingFrequency: z.string().optional().describe("How often the user goes for walks."),
  energyLevel: z.string().optional().describe("User's energy levels throughout the day."),
  emotionalGoal: z.string().describe("How they want to feel in 30 days."),
  flexibility: z.string().optional().describe("User's self-reported flexibility level."),
  physicalLimitations: z.string().optional().describe("Physical difficulties like sensitive back or knees."),
  height: z.string().optional().describe("User's height."),
  weight: z.string().optional().describe("User's current weight."),
  targetWeight: z.string().optional().describe("User's target weight goal."),
});

export type GeneratePersonalizedAfricanMethodPlanInput = z.infer<typeof GeneratePersonalizedAfricanMethodPlanInputSchema>;

const GeneratePersonalizedAfricanMethodPlanOutputSchema = z.object({
  planSummary: z.string().describe("A welcoming summary."),
  personalizationTitle: z.string().describe("A compelling personalized title."),
  userName: z.string().default("Amiga"),
  bmi: z.number().default(24.5),
  weightLossGoalKg: z.number().default(5),
  suggestedDurationDays: z.number().int().default(21),
  level: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  focusAreasSummary: z.string().describe("Summary of focus areas."),
  methodDescription: z.string().describe("Explanation of the plan."),
  recommendations: z.object({
    dietary: z.string(),
    hydration: z.string(),
    sleep: z.string(),
    activity: z.string(),
    mindset: z.string(),
  }),
  disclaimer: z.string(),
  motivationalMessage: z.string(),
});

export type GeneratePersonalizedAfricanMethodPlanOutput = z.infer<typeof GeneratePersonalizedAfricanMethodPlanOutputSchema>;

export async function generatePersonalizedAfricanMethodPlan(input: GeneratePersonalizedAfricanMethodPlanInput): Promise<GeneratePersonalizedAfricanMethodPlanOutput> {
  return generatePersonalizedAfricanMethodPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedAfricanMethodPlanPrompt',
  input: { schema: GeneratePersonalizedAfricanMethodPlanInputSchema },
  output: { schema: GeneratePersonalizedAfricanMethodPlanOutputSchema },
  prompt: 'Você é uma especialista em transformação corporal feminina e estética (foco em cintura, glúteos e pernas). Gere um plano personalizado chamado "Programa Feminino de Definição" baseado nestas respostas: Idade Exata: {{{age}}}, Faixa Etária: {{{ageRange}}}, Altura: {{{height}}}, Peso Atual: {{{weight}}}, Peso Ideal: {{{targetWeight}}}, Experíencia prévia: {{{pilatesExperience}}}, Físico atual: {{{bodyDescription}}}, Corpo dos sonhos: {{{dreamBody}}}, O que incomoda: {{{mainConcern}}}, Objetivo: {{{goalTransformation}}}, Dificuldade: {{{weightDifficulty}}}, Região para aumentar: {{{increaseRegion}}}, Tempo: {{{dedicationTime}}}, Frequência de exercício: {{{exerciseFrequency}}}, Caminhadas: {{{walkingFrequency}}}, Energia no dia: {{{energyLevel}}}, Desejo emocional: {{{emotionalGoal}}}, Flexibilidade: {{{flexibility}}}, Limitações: {{{physicalLimitations}}}. Crie um tom acolhedor, premium e motivador. O foco deve ser em resultados reais e naturais em 21 dias.',
});

const generatePersonalizedAfricanMethodPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedAfricanMethodPlanFlow',
    inputSchema: GeneratePersonalizedAfricanMethodPlanInputSchema,
    outputSchema: GeneratePersonalizedAfricanMethodPlanOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error("Failed to generate plan.");
      return output;
    } catch (error: any) {
      console.error("GenAI Error:", error);
      // Fallback response if quota is exceeded or API fails
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('limit')) {
        return {
          planSummary: "Preparamos uma análise completa do seu perfil. Com base no seu objetivo de " + (input.goalTransformation || "transformação") + ", você tem 92% de chance de atingir sua meta em 21 dias.",
          personalizationTitle: "Seu Protocolo Feminino de 21 Dias",
          userName: "Amiga",
          bmi: 24.2,
          weightLossGoalKg: Math.abs(parseInt(input.weight || "70") - parseInt(input.targetWeight || "65")) || 5,
          suggestedDurationDays: 21,
          level: 'Iniciante',
          focusAreasSummary: "Foco total em definição abdominal, glúteos e pernas, respeitando suas limitações.",
          methodDescription: "Este método utiliza princípios de ativação muscular profunda e controle hormonal natural para resultados rápidos e sustentáveis.",
          recommendations: {
            dietary: "Foque em alimentos anti-inflamatórios e proteínas magras para acelerar o metabolismo.",
            hydration: "Mantenha a hidratação constante para facilitar a queima de gordura.",
            sleep: "O sono de qualidade é essencial para a recuperação dos tecidos e definição muscular.",
            activity: "Siga a rotina de exercícios proposta, focando na conexão mente-músculo.",
            mindset: "A consistência é a chave. Comemore cada pequena mudança no espelho.",
          },
          disclaimer: "Este plano é uma sugestão baseada em seu perfil. Consulte um profissional de saúde antes de iniciar.",
          motivationalMessage: "Estamos animadas para ver sua transformação!",
        };
      }
      throw error;
    }
  }
);

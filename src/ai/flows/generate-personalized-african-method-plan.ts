'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized "Método Africano" weight loss plan.
 *
 * - generatePersonalizedAfricanMethodPlan - A function that generates a personalized plan based on user quiz answers.
 * - GeneratePersonalizedAfricanMethodPlanInput - The input type for the generatePersonalizedAfricanMethodPlan function, containing all quiz answers.
 * - GeneratePersonalizedAfricanMethodPlanOutput - The return type for the generatePersonalizedAfricanMethodPlan function, representing the personalized plan report.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedAfricanMethodPlanInputSchema = z.object({
  name: z.string().describe("User's name."),
  age: z.number().int().min(18).describe("User's numerical age."),
  heightCm: z.number().int().min(100).describe("User's height in centimeters."),
  currentWeightKg: z.number().min(30).describe("User's current weight in kilograms."),
  targetWeightKg: z.number().min(30).describe("User's target weight in kilograms."),
  ageRange: z.enum(['18 a 29 anos', '30 a 39 anos', '40 a 49 anos', '50+ anos']).describe("User's age range category."),
  mainGoal: z.enum(['Perder peso', 'Aumentar a força muscular', 'Desenvolver flexibilidade', 'Reduzir o estresse e ansiedade', 'Melhorar a postura']).describe("User's main objective for their body."),
  dreamBodyType: z.enum(['Magra', 'Definida', 'Com curvas', 'Fitness']).describe("User's ideal body type."),
  currentPhysiqueDescription: z.enum(['Magra', 'Gordinha', 'Maior', 'Com excesso de peso']).describe("User's self-description of their current physique."),
  weightChangeTendency: z.enum(['Não tenho dificuldade para perder peso', 'Eu ganho peso facilmente', 'Eu ganho peso facilmente mas tenho dificuldade para perder']).describe("How user's weight typically changes."),
  timeSinceBestPhysique: z.enum(['Há menos de 1 ano', 'Faz 1 a 3 anos', 'Há mais de 3 anos', 'Nunca']).describe("How long since user was in their best physical shape."),
  importantEvent: z.enum(['Férias', 'Casamento', 'Aniversário', 'Reunião importante', 'Outro', 'Nenhum evento especial em breve']).describe("Any upcoming important event that influences short-term goals."),
  eventsLeadingToWeightGain: z.array(z.enum([
    'Casamento ou relacionamento',
    'Vida profissional ou familiar ocupada',
    'Desafios financeiros',
    'Lesão ou limitação',
    'Sintomas ou problemas de saúde mental',
    'Metabolismo mais lento devido ao envelhecimento',
    'Compulsão ou ansiedade alimentar',
    'Nenhum dos itens acima'
  ])).describe("Life events that may have led to weight gain."),
  preferredDietType: z.array(z.enum([
    'Tradicional', 'Keto', 'Vegetariana', 'Vegana', 'Mediterrânea', 'Pescetariana', 'Sem lactose', 'Sem glúten'
  ])).describe("User's preferred diet types."),
  mealTimes: z.object({
    breakfast: z.enum(['Entre 6h00 e 8h00', 'Entre 8h00 e 10h00', 'Entre 10h00 e meio-dia', 'Eu normalmente pulo o café da manhã']).describe("User's typical breakfast time."),
    lunch: z.enum(['Entre 11h00 e meio-dia', 'Entre meio-dia e 13h00', 'Entre 13h00 e 14h00', 'Eu normalmente pulo o almoço']).describe("User's typical lunch time."),
    dinner: z.enum(['Entre 18h00 e 19h00', 'Entre 19h00 e 20h00', 'Entre 20h00 e 21h00', 'Eu normalmente pulo o jantares']).describe("User's typical dinner time."),
  }).describe("User's typical meal times."),
  sleepFrequency: z.enum(['Menos de 5 horas', '6-7 horas', '8-9 horas', 'Mais de 9 horas']).describe("How many hours user typically sleeps."),
  waterIntake: z.enum(['Tento apenas não ter sede', 'Cerca de 2 copos', '2 a 6 copos', 'Mais de 6 copos']).describe("User's daily water intake."),
  energyLevels: z.enum(['Baixo, me sinto cansada durante o dia', 'Sinto uma queda de energia depois do almoço', 'Me arrasto entre as refeições', 'Elevados e estáveis']).describe("User's daily energy levels."),
  typicalDayDescription: z.enum(['Eu passo a maior parte do dia sentada', 'Sou ativa poucas vezes', 'Estou de pé o dia todo']).describe("Description of user's typical daily activity."),
  workRoutine: z.enum(['Das 9h às 17h', 'Meus horários são flexíveis', 'Trabalho em turnos', 'Estou aposentada / não estou trabalhando no momento']).describe("Description of user's work routine."),
  walkingFrequency: z.enum(['Quase todos os dias', 'De vez em quando', '1-2 vezes por semana', 'Uma vez por mês']).describe("How often user goes for walks."),
  exerciseFrequency: z.enum(['Quase todos os dias', 'Várias vezes por semana', 'Várias vezes por mês', 'Nunca']).describe("How often user exercises."),
  breathlessnessOnStairs: z.enum(['Fico sem fôlego quase sempre', 'Fico sem fôlego, mas consigo falar', 'Me sinto OK depois de subir escadas', 'Consigo subir vários lances sem problema']).describe("User's experience with breathlessness when climbing stairs."),
  difficulties: z.array(z.enum(['Cansaço constante', 'Inchaço abdominal', 'Vontade de doces à noite', 'Ansiedade alimentar'])).describe("Difficulties user experiences."),
  focusAreas: z.array(z.enum(['Barriga', 'Glúteos', 'Pernas', 'Braços'])).describe("Specific body areas user wants to focus on."),
  flexibility: z.enum(['Bastante flexível', 'Estou começando', 'Não muito', 'Não tenho certeza']).describe("User's self-assessment of their flexibility."),
  triedMethodsBefore: z.boolean().describe("Whether the user has tried weight loss methods before."),
  weeklyRoutineConsistency: z.enum(['1 a 2 dias', '3 a 5 dias', 'Todos os dias']).describe("How many days per week user can follow a simple routine."),
  dailyTimeDedication: z.enum(['5 minutos', '10 minutos', '20 minutos', '30 minutos']).describe("How much time user can dedicate to their body daily."),
});

export type GeneratePersonalizedAfricanMethodPlanInput = z.infer<typeof GeneratePersonalizedAfricanMethodPlanInputSchema>;

const GeneratePersonalizedAfricanMethodPlanOutputSchema = z.object({
  planSummary: z.string().describe("A brief, welcoming summary for the personalized plan, including the user's name. Example: 'Olá [Nome]! Seu plano personalizado está pronto.'"),
  personalizationTitle: z.string().describe("A compelling title reflecting the personalization of the plan. Example: 'O plano que você precisa para começar sua mudança'."),
  userName: z.string().describe("The user's name for a personalized greeting."),
  bmi: z.number().describe("Calculated Body Mass Index (BMI) based on current weight and height."),
  weightLossGoalKg: z.number().describe("The user's total weight loss goal in kilograms (Current Weight - Target Weight). This should be a positive number or zero if target is met/exceeded."),
  suggestedDurationDays: z.number().int().describe("Suggested duration for the initial plan in days (e.g., 21 days for 'Protocolo de 21 dias')."),
  level: z.enum(['Iniciante', 'Intermediário', 'Avançado']).describe("Recommended activity/program level based on user's current habits and physical state."),
  focusAreasSummary: z.string().describe("A summary of the user's primary focus areas (e.g., 'Foco: saciedade + rotina simples', 'Foco: Barriga, Pernas')."),
  methodDescription: z.string().describe("An explanation of the 'Método Africano' protocol tailored to the user's answers, emphasizing simple habits, recipes, and routine for appetite control and satiety."),
  recommendations: z.object({
    dietary: z.string().describe("Specific dietary advice and tips, considering preferred diet types, meal times, and difficulties (e.g., sugar cravings, emotional eating)."),
    hydration: z.string().describe("Recommendations for daily water intake, including actionable tips."),
    sleep: z.string().describe("Advice for improving sleep patterns, highlighting its importance for weight management."),
    activity: z.string().describe("General activity and exercise recommendations, considering work routine, daily dedication, walking/exercise frequency, and breathlessness on stairs."),
    mindset: z.string().describe("Tips for managing emotional aspects, anxiety, consistency, and maintaining motivation. Focus on 'não é sobre perfeição, é sobre constância'."),
  }).describe("Detailed recommendations across various health aspects, presented in a supportive tone."),
  disclaimer: z.string().describe("A standard disclaimer about varying results. Example: 'Resultados podem variar conforme rotina, alimentação e consistência.'"),
  motivationalMessage: z.string().describe("An uplifting message to encourage the user. Example: 'Você vai arrasar! Pequenos hábitos podem criar grandes mudanças quando são simples de seguir.'"),
});

export type GeneratePersonalizedAfricanMethodPlanOutput = z.infer<typeof GeneratePersonalizedAfricanMethodPlanOutputSchema>;

export async function generatePersonalizedAfricanMethodPlan(input: GeneratePersonalizedAfricanMethodPlanInput): Promise<GeneratePersonalizedAfricanMethodPlanOutput> {
  return generatePersonalizedAfricanMethodPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedAfricanMethodPlanPrompt',
  input: { schema: GeneratePersonalizedAfricanMethodPlanInputSchema },
  output: { schema: GeneratePersonalizedAfricanMethodPlanOutputSchema },
  prompt: `Você é um especialista em bem-estar e saúde feminina, com foco no "Método Africano", um protocolo alimentar natural que guia mulheres a controlar o apetite, melhorar a saciedade e apoiar a perda de peso de forma leve através de hábitos, receitas e rotina diária.
Seu objetivo é gerar um plano de recomendação altamente personalizado, empático, feminino, direto, profissional e inspirador, com um tom de reportagem/descoberta. O plano deve ser baseado nas respostas detalhadas do quiz da usuária. Prometa apoio e orientação, não milagres.

A usuária completou um quiz e forneceu as seguintes informações:

--- Detalhes da Usuária ---
Nome: {{{name}}}
Idade: {{{age}}} anos (faixa etária: {{{ageRange}}})
Altura: {{{heightCm}}} cm
Peso Atual: {{{currentWeightKg}}} kg
Peso Ideal: {{{targetWeightKg}}} kg
Objetivo Principal: {{{mainGoal}}}
Corpo dos Sonhos: {{{dreamBodyType}}}
Descrição do Físico Atual: {{{currentPhysiqueDescription}}}
Tendência de Mudança de Peso: {{{weightChangeTendency}}}
Tempo desde o Melhor Físico: {{{timeSinceBestPhysique}}}
Evento Importante Próximo: {{{importantEvent}}}
Eventos que Levaram ao Ganho de Peso: {{#each eventsLeadingToWeightGain}}- {{{this}}}{{/each}}
Tipos de Dieta Preferidos: {{#each preferredDietType}}- {{{this}}}{{/each}}
Horários de Refeição:
  - Café da Manhã: {{{mealTimes.breakfast}}}
  - Almoço: {{{mealTimes.lunch}}}
  - Jantar: {{{mealTimes.dinner}}}
Frequência de Sono: {{{sleepFrequency}}}
Consumo de Água: {{{waterIntake}}}
Níveis de Energia: {{{energyLevels}}}
Descrição do Dia Típico: {{{typicalDayDescription}}}
Rotina de Trabalho: {{{workRoutine}}}
Frequência de Caminhadas: {{{walkingFrequency}}}
Frequência de Exercícios: {{{exerciseFrequency}}}
Fôlego ao Subir Escadas: {{{breathlessnessOnStairs}}}
Dificuldades: {{#each difficulties}}- {{{this}}}{{/each}}
Regiões de Foco: {{#each focusAreas}}- {{{this}}}{{/each}}
Flexibilidade: {{{flexibility}}}
Já Tentou Métodos Antes: {{#if triedMethodsBefore}}Sim{{else}}Não{{/if}}
Consistência Semanal na Rotina: {{{weeklyRoutineConsistency}}}
Tempo Diário Dedicado ao Corpo: {{{dailyTimeDedication}}}

--- Instruções para o Plano ---
1.  **Cálculos para Geração (LLM deve realizar):**
    *   **BMI (Índice de Massa Corporal):** Use a fórmula \`peso (kg) / (altura (m))^2\`. A altura deve ser convertida de cm para metros. Arredonde para duas casas decimais.
    *   **Peso a Perder:** Calcule a diferença entre \`currentWeightKg\` e \`targetWeightKg\`. Se o resultado for negativo ou zero, o objetivo de peso já foi atingido ou superado, então o \`weightLossGoalKg\` deve ser 0.
    *   **SuggestedDurationDays:** Sempre use 21 dias, pois o "Método Africano" é um "Protocolo de 21 dias".
2.  **Level (Nível):** Determine se a usuária é 'Iniciante', 'Intermediário' ou 'Avançado' com base na sua frequência de exercícios, rotina de trabalho, tempo dedicado e fôlego nas escadas.
    *   \`Iniciante\`: Pouca ou nenhuma atividade física, dificuldades significativas, pouco tempo dedicado, fôlego fraco.
    *   \`Intermediário\`: Alguma atividade regular, tempo moderado dedicado, fôlego razoável.
    *   \`Avançado\`: Alta frequência de atividade, bom tempo dedicado, bom fôlego, flexibilidade.
3.  **focusAreasSummary:** Combine as "Regiões de Foco" e qualquer menção a saciedade ou rotina simples. Se nenhuma região de foco for especificada, ou se o foco principal for saciedade e rotina, priorize "Saciedade + Rotina Simples".
    *   Exemplo: "Foco: saciedade + rotina simples" ou "Foco: Barriga, Pernas".
4.  **methodDescription:** Descreva o "Método Africano" como um protocolo alimentar natural focado em hábitos, receitas e rotina diária para controlar apetite, melhorar saciedade e apoiar a perda de peso, conectando-o às necessidades específicas da usuária.
5.  **Recomendações:** Baseie todas as recomendações nas respostas fornecidas, usando uma linguagem encorajadora e prática.
    *   \`dietary\`: Mencione os tipos de dieta preferidos, horários de refeição e dificuldades como "vontade de doces à noite" ou "ansiedade alimentar". Sugira pequenas mudanças e opções naturais.
    *   \`hydration\`: Dê dicas específicas para atingir/melhorar o consumo de água, como levar uma garrafa ou usar lembretes.
    *   \`sleep\`: Enfatize a importância do sono para o bem-estar e o controle de peso, e dê dicas para melhorar a frequência de sono com base na entrada da usuária.
    *   \`activity\`: Sugira atividades adequadas ao nível e rotina (sedentária vs. ativa, tempo diário, caminhadas, exercícios), sempre focando no "possível" e na "constância".
    *   \`mindset\`: Aborde as dificuldades emocionais, ansiedade alimentar, e a importância da consistência sobre a perfeição. Use frases como "Não é sobre perfeição. É sobre constância." e "Pequenos hábitos. Grandes mudanças.".
6.  **Tone:** Mantenha um tom que seja ao mesmo tempo acolhedor, empoderador e informativo. Use a primeira pessoa do plural para prometer apoio ("Nós vamos te ajudar").

Gere o JSON de saída estritamente conforme o \`GeneratePersonalizedAfricanMethodPlanOutputSchema\`, sem adicionar qualquer texto extra antes ou depois do JSON.
`,
});

const generatePersonalizedAfricanMethodPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedAfricanMethodPlanFlow',
    inputSchema: GeneratePersonalizedAfricanMethodPlanInputSchema,
    outputSchema: GeneratePersonalizedAfricanMethodPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      throw new Error("Failed to generate personalized African Method Plan. No output received from the model.");
    }

    return output;
  }
);

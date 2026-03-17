import { z } from "zod";

export const MealSchema = z.object({
  name: z.string().min(1),
  calories: z.number().int().min(50).max(2500),
  timeMinutes: z.number().int().min(1).max(60),
  steps: z.array(z.string().min(1)).min(2).max(12)
});

export const GroceryItemSchema = z.object({
  item: z.string().min(1),
  quantity: z.string().optional()
});

export const MealPlanResponseSchema = z.object({
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
  snack: MealSchema,
  dailyTotals: z.object({
    calories: z.number().int().min(200).max(8000),
    proteinGrams: z.number().int().min(0).max(500),
    carbsGrams: z.number().int().min(0).max(1000),
    fatGrams: z.number().int().min(0).max(500)
  }),
  groceryList: z.array(GroceryItemSchema).min(3).max(40)
});

export type MealPlanResponse = z.infer<typeof MealPlanResponseSchema>;

export const MealPlanRequestSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance"]),
  dietType: z.enum(["vegetarian", "non_vegetarian", "vegan"]),
  cookingTimeMinutes: z.union([z.literal(5), z.literal(10), z.literal(20)]),
  caloriesTarget: z.number().int().min(800).max(5000),
  ingredientsAvailable: z.array(z.string().min(1)).max(40)
});

export type MealPlanRequest = z.infer<typeof MealPlanRequestSchema>;


import type { Recipe } from "@/types";

export const recipes: Recipe[] = [];

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug && recipe.published);
}

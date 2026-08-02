import Link from "next/link";
import type { Recipe } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getValidationStatusLabel } from "@/lib/formatters";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <PublicCard>
      <ImagePlaceholder
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        label={`Gambar ramuan ${recipe.name}`}
        variant="recipe"
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="brown">
            {getValidationStatusLabel(recipe.validationStatus)}
          </StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          <Link
            className="transition hover:text-herbal-green"
            href={`/ramuan/${recipe.slug}`}
          >
            {recipe.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
          {recipe.shortDescription}
        </p>
        <PublicCardAction href={`/ramuan/${recipe.slug}`}>
          Buka detail ramuan
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}

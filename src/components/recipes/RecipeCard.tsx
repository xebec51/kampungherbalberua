import Link from "next/link";
import type { Recipe } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getValidationStatusLabel } from "@/lib/formatters";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
      <ImagePlaceholder
        label={`Ilustrasi placeholder ramuan ${recipe.name}`}
        variant="recipe"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="brown">
            {getValidationStatusLabel(recipe.validationStatus)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 text-xl font-bold text-herbal-ink">
          <Link className="hover:text-herbal-green" href={`/ramuan/${recipe.slug}`}>
            {recipe.name}
          </Link>
        </h3>
        <p className="mt-4 flex-1 text-sm leading-6 text-herbal-muted">
          {recipe.shortDescription}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-herbal-green hover:underline"
          href={`/ramuan/${recipe.slug}`}
        >
          Lihat detail ramuan
        </Link>
      </div>
    </article>
  );
}

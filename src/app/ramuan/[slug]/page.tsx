import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRecipeBySlug, recipes } from "@/data/recipes";
import { getValidationStatusLabel } from "@/lib/formatters";
import { createPageMetadata } from "@/lib/metadata";

type RecipeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return recipes
    .filter((recipe) => recipe.published)
    .map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: RecipeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return createPageMetadata({
      title: "Ramuan tidak ditemukan",
      description: "Data ramuan yang diminta belum tersedia.",
      path: "/ramuan",
    });
  }

  return createPageMetadata({
    title: recipe.name,
    description: recipe.shortDescription,
    path: `/ramuan/${recipe.slug}`,
  });
}

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <article className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Breadcrumb
          items={[
            { label: "Ramuan", href: "/ramuan" },
            { label: recipe.name },
          ]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <ImagePlaceholder
              label={`Ilustrasi placeholder ramuan ${recipe.name}`}
              variant="recipe"
            />
            <div className="mt-5 rounded-md border border-herbal-green/10 bg-white p-5 text-sm leading-6 text-herbal-muted shadow-sm">
              <h2 className="text-base font-bold text-herbal-ink">
                Status validasi
              </h2>
              <p className="mt-3">{recipe.author}</p>
              <p className="mt-2">{recipe.validator}</p>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="brown">
                {getValidationStatusLabel(recipe.validationStatus)}
              </StatusBadge>
              <StatusBadge tone="neutral">Pemanfaatan tradisional</StatusBadge>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-herbal-ink sm:text-5xl">
              {recipe.name}
            </h1>
            <p className="mt-5 text-base leading-8 text-herbal-muted">
              {recipe.traditionalPurpose}
            </p>

            <section className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-herbal-ink">
                Bahan dan takaran
              </h2>
              <ul className="mt-4 grid gap-3 text-sm text-herbal-muted">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    className="flex items-start justify-between gap-4 border-b border-herbal-green/10 pb-3 last:border-0 last:pb-0"
                    key={ingredient.name}
                  >
                    <span>{ingredient.name}</span>
                    <span className="text-right font-semibold text-herbal-ink">
                      {ingredient.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <DetailList items={recipe.steps} title="Langkah pembuatan" />
            <DetailList
              items={[recipe.servingSuggestion]}
              title="Saran penyajian"
            />
            <DetailList items={recipe.warnings} title="Peringatan" />

            <div className="mt-8">
              <Disclaimer>
                Informasi tanaman dan ramuan pada website ini disediakan untuk
                edukasi mengenai pemanfaatan tradisional. Informasi ini bukan
                diagnosis, resep, atau pengganti konsultasi dengan dokter,
                apoteker, maupun tenaga kesehatan lainnya.
              </Disclaimer>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}

type DetailListProps = {
  title: string;
  items: string[];
};

function DetailList({ title, items }: DetailListProps) {
  return (
    <section className="mt-6 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-herbal-ink">{title}</h2>
      <ol className="mt-4 grid gap-3 text-sm leading-6 text-herbal-muted">
        {items.map((item, index) => (
          <li className="flex gap-3" key={item}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-herbal-soft text-xs font-bold text-herbal-green">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

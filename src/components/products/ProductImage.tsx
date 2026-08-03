import Image from "next/image";
import type { Product } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  className?: string;
  product: Product;
  priority?: boolean;
  size?: "card" | "detail";
};

export function ProductImage({
  className,
  product,
  priority = false,
  size = "card",
}: ProductImageProps) {
  const image = product.image.trim();

  if (!image || image.startsWith("/images/placeholders/")) {
    return (
      <ImagePlaceholder
        className={cn(
          size === "detail" ? "aspect-[4/3]" : "aspect-[16/10]",
          className,
        )}
        label={`Ilustrasi produk ${product.name}`}
        variant="product"
      />
    );
  }

  return (
    <div
      className={cn(
        "public-card-media relative overflow-hidden bg-herbal-mist",
        size === "detail"
          ? "aspect-[4/3] rounded-[var(--radius-card)] border border-herbal-green/10 shadow-[var(--shadow-soft)]"
          : "aspect-[16/10]",
        className,
      )}
    >
      <Image
        alt={`Ilustrasi produk ${product.name}`}
        className="object-cover transition duration-500 group-hover/card:scale-[1.03]"
        fill
        priority={priority}
        sizes={
          size === "detail"
            ? "(max-width: 1024px) 92vw, 42rem"
            : "(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1279px) 23vw, 230px"
        }
        src={image}
      />
    </div>
  );
}

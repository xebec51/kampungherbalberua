import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function SearchInput({ className, label, id, ...props }: SearchInputProps) {
  const inputId = id ?? "search-input";

  return (
    <div>
      <label
        className="block text-sm font-medium text-herbal-ink"
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        className={cn(
          "mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20",
          className,
        )}
        id={inputId}
        type="search"
        {...props}
      />
    </div>
  );
}

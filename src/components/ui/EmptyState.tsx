type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-herbal-green/30 bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-herbal-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-herbal-muted">{description}</p>
    </div>
  );
}

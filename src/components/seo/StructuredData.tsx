import { createRootStructuredData } from "@/lib/metadata";

export function StructuredData() {
  const json = JSON.stringify(createRootStructuredData()).replaceAll("<", "\\u003c");

  return (
    <script
      dangerouslySetInnerHTML={{ __html: json }}
      type="application/ld+json"
    />
  );
}

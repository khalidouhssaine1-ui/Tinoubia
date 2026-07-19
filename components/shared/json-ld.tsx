export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Admin-entered text (title/description) flows into this JSON. Escaping
  // "<" prevents a literal "</script>" in that text from closing the tag
  // early and injecting HTML — JSON.stringify alone does not do this.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

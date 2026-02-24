interface ReadmePreviewProps {
  html: string | null;
}

export function ReadmePreview({ html }: ReadmePreviewProps) {
  if (!html) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
        No README available for this agent.
      </div>
    );
  }

  return (
    <div
      className="prose prose-invert prose-sm max-w-none rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 prose-headings:text-white prose-a:text-lime-400 prose-code:text-lime-300 prose-pre:bg-black/50"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

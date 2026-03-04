interface EraContextProps {
  context: string;
}

export default function EraContext({ context }: EraContextProps) {
  return (
    <blockquote className="relative pl-6 border-l-2 border-accent/30 max-w-2xl">
      <p className="font-display text-lg md:text-xl text-foreground/50 leading-relaxed italic">
        {context}
      </p>
    </blockquote>
  );
}

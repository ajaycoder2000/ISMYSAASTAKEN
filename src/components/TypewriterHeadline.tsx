interface TypewriterHeadlineProps {
  line1?: string;
  line2?: string;
  className?: string;
}

export default function TypewriterHeadline({
  line1 = 'Is your SaaS idea',
  line2 = 'already taken?',
  className = '',
}: TypewriterHeadlineProps) {
  return (
    <h1
      className={`text-display font-[family-name:var(--font-space-grotesk)] tracking-tight text-[hsl(40,20%,92%)] select-none ${className}`}
      aria-label={`${line1} ${line2}`}
    >
      <span>{line1} </span>
      <span className="text-[hsl(42,95%,55%)] typewriter-cursor">{line2}</span>
    </h1>
  );
}

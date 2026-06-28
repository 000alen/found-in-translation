import { formatLanguageLabel, formatLanguagePair, getLanguage } from "@/lib/languages";
import { cn } from "@/lib/utils";

type LanguageLabelProps = {
  code: string;
  className?: string;
  /** Show native endonym (default) or English name */
  variant?: "native" | "english";
};

export function LanguageLabel({ code, className, variant = "native" }: LanguageLabelProps) {
  const lang = getLanguage(code);
  const text = variant === "english" ? lang.name : lang.nativeName;

  return (
    <span className={cn(className)} lang={lang.bcp47}>
      {text}
    </span>
  );
}

type LanguagePairProps = {
  source: string;
  target: string;
  className?: string;
};

export function LanguagePair({ source, target, className }: LanguagePairProps) {
  return (
    <span className={cn(className)}>
      {formatLanguagePair(source, target)}
    </span>
  );
}

export { formatLanguageLabel, formatLanguagePair };

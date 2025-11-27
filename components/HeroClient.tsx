"use client";

import { useEffect, useMemo, useState } from "react";

export function HeroClient({ defaultPhrase }: { defaultPhrase: string }) {
  const heroPhrases = useMemo(() => [defaultPhrase, "少一点添加，多一点真实", "为真实生活补能"], [defaultPhrase]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const typedText = useMemo(() => heroPhrases[phraseIndex].slice(0, charIndex), [phraseIndex, charIndex, heroPhrases]);

  useEffect(() => {
    const currentPhrase = heroPhrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex <= currentPhrase.length) {
      timeout = setTimeout(() => setCharIndex((prev) => prev + 1), 120);
    } else if (!isDeleting && charIndex > currentPhrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((prev) => prev - 1), 50);
    } else {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
      }, 400);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, heroPhrases]);

  return (
    <div className="text-2xl font-semibold text-[#e9ffec]">
      {typedText}
      <span className="ml-1 inline-block h-6 w-0.5 animate-pulse rounded-full bg-[#e9ffec]" aria-hidden="true" />
    </div>
  );
}


import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, description, action, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-black/10 bg-white p-5 shadow-sm",
        "dark:border-white/15 dark:bg-zinc-900",
        className,
      )}
    >
      {(title ?? description ?? action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

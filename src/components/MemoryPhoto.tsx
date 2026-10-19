import { cn } from "@/lib/utils";
import type { Memory } from "@/lib/types";

export function MemoryPhoto({ memory, className }: { memory: Memory; className?: string }) {
  if (memory.photoUrl) {
    return <img src={memory.photoUrl} alt={memory.caption || "A saved memory"} loading="lazy" className={cn("object-cover", className)} />;
  }
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br from-butter-soft to-peach-soft p-3", className)}>
      <span className="line-clamp-4 text-center font-display text-sm text-foreground/80">{memory.caption || "A little moment"}</span>
    </div>
  );
}

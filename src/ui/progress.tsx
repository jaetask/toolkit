import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "../utils.js";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max = 100, ...props }, ref) => {
  const indeterminate = value == null;
  const percentage = Math.max(
    0,
    Math.min(100, max > 0 ? ((value ?? 0) / max) * 100 : 0),
  );

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      max={max}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted-foreground/80 dark:bg-muted-foreground/65",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full bg-primary dark:bg-foreground",
          indeterminate
            ? "w-1/3 animate-[toolkit-progress-indeterminate_1.6s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:translate-x-full"
            : "w-full transition-transform",
        )}
        style={
          indeterminate
            ? undefined
            : { transform: `translateX(-${100 - percentage}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

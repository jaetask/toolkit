// The suite's two button looks, built on the ported ui Button: the warm grey button and the one
// dark button. Not exported; apps use Button from @jaetask/toolkit/ui/button.
import { Button, type ButtonProps } from "../ui/button.js";
import { cn } from "../utils.js";

/** The surface a grey button sits on: a warm grey panel (default) or a white card or page. */
export type Surface = "panel" | "white";

export function GreyButton({
  surface = "panel",
  className,
  ...props
}: ButtonProps & { surface?: Surface }) {
  return (
    <Button
      variant="secondary"
      data-variant="grey"
      data-surface={surface}
      className={cn("tk-button", className)}
      {...props}
    />
  );
}

export function DarkButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="default"
      data-variant="primary"
      className={cn("tk-button", className)}
      {...props}
    />
  );
}

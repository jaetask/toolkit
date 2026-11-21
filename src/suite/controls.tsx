import { Button, type ButtonProps } from "../ui/button.js";
import { cn } from "../utils.js";

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

import { Button } from "@/components/ui/button";

interface JumpToLatestButtonProps {
  show: boolean;
  onClick: () => void;
}

export function JumpToLatestButton({ show, onClick }: JumpToLatestButtonProps) {
  if (!show) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 mb-2 -top-10">
      <Button size="sm" variant="secondary" onClick={onClick}>
        Jump to latest message
      </Button>
    </div>
  );
}

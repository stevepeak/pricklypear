import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  style,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      /* Expose progress percentage through a CSS variable */
      style={{ '--progress': `${value ?? 0}%`, ...style } as React.CSSProperties}
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        /* Width now controlled by parent‐set custom property */
        className="bg-primary h-full flex-1 transition-all w-[--progress]"
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

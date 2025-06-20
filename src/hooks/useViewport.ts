import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { isWeb } from "@/utils/platform";

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Reactive viewport-size hook that works in both web and native
 * environments.  For native it listens to `Dimensions` changes;
 * for web it listens to `resize` events.
 */
export function useViewport(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(() => {
    if (isWeb()) {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });

  useEffect(() => {
    // Web – window.resize
    if (isWeb()) {
      const handler = () =>
        setSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }

    // Native – Dimensions listener
    const handler = ({
      window: { width, height },
    }: {
      window: ViewportSize;
    }) => setSize({ width, height });

    // RN 0.71+ returns a subscription with remove()
    const subscription: any = Dimensions.addEventListener("change", handler);
    return () => {
      if (subscription?.remove) subscription.remove();
      else Dimensions.removeEventListener("change", handler as any);
    };
  }, []);

  return size;
}

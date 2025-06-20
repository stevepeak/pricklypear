/* eslint-disable @typescript-eslint/no-unused-vars */
/* A very small subset of React-Native APIs used by our cross-platform hooks
   and components.  Only the bits referenced in web-only code are mocked. */

type Listener = () => void;

export const Platform = {
  OS: 'web',
  /* simple polyfill for Platform.select */
  select<T>(spec: { web?: T; default?: T } & Record<string, T>): T | undefined {
    return spec.web ?? spec.default;
  },
};

export const Dimensions = {
  get(_key: 'window' | 'screen') {
    return { width: 1024, height: 768 };
  },
  addEventListener(_event: 'change', _listener: Listener) {
    return {
      remove: () => {
        /* no-op */
      },
    };
  },
  // keep for backwards compatibility with older code paths
  removeEventListener(_event: 'change', _listener: Listener) {
    /* no-op */
  },
};

export default { Platform, Dimensions };

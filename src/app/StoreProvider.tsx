'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import { Hydrate } from './Hydrate';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  if (storeRef.current === null) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <Hydrate>{children}</Hydrate>
    </Provider>
  );
}

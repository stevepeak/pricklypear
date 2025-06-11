import React, { ReactNode } from 'react';

interface SearchBarProps {
  children: ReactNode;
}

interface SearchBarLeftProps {
  children: ReactNode;
}

interface SearchBarRightProps {
  children: ReactNode;
}

export function SearchBar({ children }: SearchBarProps) {
  return (
    <div className="sticky top-[53px] z-[7] flex items-center justify-between border-b bg-background px-2 py-2">
      {children}
    </div>
  );
}

export function SearchBarLeft({ children }: SearchBarLeftProps) {
  return <div className="w-full max-w-xs">{children}</div>;
}

export function SearchBarRight({ children }: SearchBarRightProps) {
  return <div className="flex gap-2 ml-auto">{children}</div>;
}

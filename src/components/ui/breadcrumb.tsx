import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn('flex w-full', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      {children}
    </nav>
  );
}

export function BreadcrumbList({
  children,
  className,
  ...props
}: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn('flex items-center space-x-1 text-sm', className)}
      {...props}
    >
      {children}
    </ol>
  );
}

export function BreadcrumbItem({
  children,
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn('flex items-center', className)} {...props}>
      {children}
    </li>
  );
}

export function BreadcrumbLink({
  href,
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return href ? (
    <a
      href={href}
      className={cn(
        'text-muted-foreground hover:text-primary transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </a>
  ) : (
    <span className={cn('text-muted-foreground', className)} {...props}>
      {children}
    </span>
  );
}

export function BreadcrumbPage({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('font-medium', className)}
      aria-current="page"
      {...props}
    >
      {children}
    </span>
  );
}

export function BreadcrumbSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('mx-1', className)} aria-hidden="true" {...props}>
      <ChevronRight className="w-4 h-4" />
    </span>
  );
}

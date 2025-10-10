import React from 'npm:react';
import type { ReactElement } from 'npm:react';
import { renderAsync } from 'npm:@react-email/render';

/**
 * Renders a React Email template to HTML.
 *
 * @param Component - the React component representing the email template
 * @param props     - strongly typed props for the template
 * @returns         - fully rendered HTML string
 */
export async function renderEmail<TProps extends Record<string, unknown>>(
  Component: (props: TProps) => ReactElement,
  props: TProps
): Promise<string> {
  // React.createElement is required because renderAsync expects a JSX element
  // Using type assertion for React 19 compatibility
  const element = React.createElement(
    Component as React.ComponentType<TProps>,
    props
  );
  // Type assertion needed due to npm vs local React type mismatch in Deno
  return await renderAsync(element as Parameters<typeof renderAsync>[0]);
}

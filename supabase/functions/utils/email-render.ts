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
export async function renderEmail<TProps>(
  Component: (props: TProps) => ReactElement,
  props: TProps
): Promise<string> {
  // React.createElement is required because renderAsync expects a JSX element
  const element = React.createElement(Component, props);
  return await renderAsync(element);
}

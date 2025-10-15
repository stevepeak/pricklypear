import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThreadStatusBadge } from './ThreadStatusBadge';
import { createMockThread } from '@/test-utils';

describe('ThreadStatusBadge', () => {
  it('renders Open status with default styling', () => {
    const thread = createMockThread({ status: 'Open' });

    render(<ThreadStatusBadge thread={thread} />);

    const badge = screen.getByText('Open');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders Closed status with outline styling', () => {
    const thread = createMockThread({ status: 'Closed' });

    render(<ThreadStatusBadge thread={thread} />);

    const badge = screen.getByText('Closed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-muted', 'text-muted-foreground');
  });

  it('renders Archived status with outline styling', () => {
    const thread = createMockThread({ status: 'Archived' });

    render(<ThreadStatusBadge thread={thread} />);

    const badge = screen.getByText('Archived');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-muted');
  });

  it('applies custom className', () => {
    const thread = createMockThread({ status: 'Open' });

    render(<ThreadStatusBadge thread={thread} className="custom-class" />);

    const badge = screen.getByText('Open');
    expect(badge).toHaveClass('custom-class');
  });

  it('maintains base styling with custom className', () => {
    const thread = createMockThread({ status: 'Open' });

    render(<ThreadStatusBadge thread={thread} className="custom-class" />);

    const badge = screen.getByText('Open');
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs', 'custom-class');
  });

  it('uses different variants for different statuses', () => {
    const openThread = createMockThread({ status: 'Open' });
    const closedThread = createMockThread({ status: 'Closed' });

    const { rerender } = render(<ThreadStatusBadge thread={openThread} />);
    let badge = screen.getByText('Open');
    expect(badge).toHaveClass('bg-green-100');

    rerender(<ThreadStatusBadge thread={closedThread} />);
    badge = screen.getByText('Closed');
    expect(badge).not.toHaveClass('bg-green-100');
  });
});

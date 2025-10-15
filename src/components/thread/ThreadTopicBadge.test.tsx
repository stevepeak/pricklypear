import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThreadTopicBadge } from './ThreadTopicBadge';
import { createMockThread, createMockAIThread } from '@/test-utils';

describe('ThreadTopicBadge', () => {
  it('renders AI Chat badge for AI threads', () => {
    const thread = createMockAIThread();

    const { container } = render(<ThreadTopicBadge thread={thread} />);

    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    // Badge component gets className applied
    const badge = container.querySelector('.bg-purple-100');
    expect(badge).toBeInTheDocument();
  });

  it('renders Support badge for customer support threads', () => {
    const thread = createMockThread({ type: 'customer_support' });

    const { container } = render(<ThreadTopicBadge thread={thread} />);

    expect(screen.getByText('Support')).toBeInTheDocument();
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });

  it('renders topic label for regular threads', () => {
    const thread = createMockThread({
      type: 'default',
      topic: 'travel',
    });

    render(<ThreadTopicBadge thread={thread} />);

    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('renders Other topic for threads with other topic', () => {
    const thread = createMockThread({
      type: 'default',
      topic: 'other',
    });

    render(<ThreadTopicBadge thread={thread} />);

    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('displays topic icon for regular threads', () => {
    const thread = createMockThread({
      type: 'default',
      topic: 'travel',
    });

    const { container } = render(<ThreadTopicBadge thread={thread} />);

    // Icon should be rendered
    const iconSpan = container.querySelector('.mr-1');
    expect(iconSpan).toBeInTheDocument();
    expect(iconSpan?.textContent).toContain('✈️'); // Travel icon
  });

  it('displays Bot icon for AI threads', () => {
    const thread = createMockAIThread();

    const { container } = render(<ThreadTopicBadge thread={thread} />);

    // Bot icon should be rendered
    const iconContainer = container.querySelector('.mr-1');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
  });

  it('displays Headset icon for customer support threads', () => {
    const thread = createMockThread({ type: 'customer_support' });

    const { container } = render(<ThreadTopicBadge thread={thread} />);

    // Headset icon should be rendered
    const iconContainer = container.querySelector('.mr-1');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const thread = createMockThread();

    const { container } = render(
      <ThreadTopicBadge thread={thread} className="custom-class" />
    );

    expect(screen.getByText('Other')).toBeInTheDocument();
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('renders all topic types correctly', () => {
    const topics: Array<{
      topic:
        | 'travel'
        | 'parenting_time'
        | 'health'
        | 'education'
        | 'activity'
        | 'legal'
        | 'expense'
        | 'other';
      label: string;
    }> = [
      { topic: 'travel', label: 'Travel' },
      { topic: 'parenting_time', label: 'Parenting Time' },
      { topic: 'health', label: 'Health' },
      { topic: 'education', label: 'Education' },
      { topic: 'activity', label: 'Activity' },
      { topic: 'legal', label: 'Legal' },
      { topic: 'expense', label: 'Expense' },
      { topic: 'other', label: 'Other' },
    ];

    topics.forEach(({ topic, label }) => {
      const thread = createMockThread({ type: 'default', topic });
      const { unmount } = render(<ThreadTopicBadge thread={thread} />);

      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies different colors for different thread types', () => {
    const aiThread = createMockAIThread();
    const supportThread = createMockThread({ type: 'customer_support' });
    const defaultThread = createMockThread({ type: 'default' });

    // AI thread
    let { container, unmount } = render(<ThreadTopicBadge thread={aiThread} />);
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(container.querySelector('.bg-purple-100')).toBeInTheDocument();
    unmount();

    // Support thread
    ({ container, unmount } = render(
      <ThreadTopicBadge thread={supportThread} />
    ));
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
    unmount();

    // Default thread (no special color)
    ({ container } = render(<ThreadTopicBadge thread={defaultThread} />));
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(container.querySelector('.bg-purple-100')).toBeNull();
    expect(container.querySelector('.bg-blue-100')).toBeNull();
  });
});

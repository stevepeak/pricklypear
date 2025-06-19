import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComposerTextarea } from './ComposerTextarea';

describe('ComposerTextarea', () => {
  const mockThread = {
    id: 'thread-123',
    title: 'Test Thread',
    createdAt: new Date('2023-01-01'),
    status: 'Open' as const,
    participants: ['user1', 'user2'],
    topic: 'other' as const,
    type: 'ai_chat' as const,
  };

  const mockOnChange = vi.fn();
  const mockOnKeyDown = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render textarea with correct placeholder for AI thread', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={false}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).toHaveAttribute(
      'placeholder',
      'What can Prickly AI help you with?'
    );
  });

  it('should render textarea with correct placeholder for non-AI thread', () => {
    const nonAIThread = { ...mockThread, type: 'customer_support' as const };

    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={false}
        thread={nonAIThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).toHaveAttribute('placeholder', 'Type your message...');
  });

  it('should call onChange when textarea value changes', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={false}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    fireEvent.change(textarea, { target: { value: 'New message' } });

    expect(mockOnChange).toHaveBeenCalledWith('New message');
  });

  it('should call onKeyDown when key is pressed', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={false}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(mockOnKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={true}
        autoFocus={false}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).toBeDisabled();
  });

  it('should have autoFocus when autoFocus prop is true and not disabled', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={true}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).toHaveFocus();
  });

  it('should not have autoFocus when disabled', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={true}
        autoFocus={true}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).not.toHaveAttribute('autoFocus');
  });

  it('should display the current value', () => {
    const testValue = 'Test message content';

    render(
      <ComposerTextarea
        value={testValue}
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={false}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).toHaveValue(testValue);
  });

  it('should have correct CSS classes', () => {
    render(
      <ComposerTextarea
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
        disabled={false}
        autoFocus={false}
        thread={mockThread}
      />
    );

    const textarea = screen.getByTestId('thread-message-composer');
    expect(textarea).toHaveClass(
      'w-full',
      'resize-none',
      'border-0',
      'focus-visible:ring-0',
      'focus-visible:ring-offset-0',
      'focus:outline-none',
      'px-4',
      'pt-4',
      'shadow-none',
      'bg-background'
    );
  });
});

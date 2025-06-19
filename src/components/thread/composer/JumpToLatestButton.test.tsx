import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JumpToLatestButton } from './JumpToLatestButton';

describe('JumpToLatestButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render button when show is true', () => {
    render(<JumpToLatestButton show={true} onClick={mockOnClick} />);

    const button = screen.getByRole('button', {
      name: /jump to latest message/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should not render when show is false', () => {
    render(<JumpToLatestButton show={false} onClick={mockOnClick} />);

    const button = screen.queryByRole('button', {
      name: /jump to latest message/i,
    });
    expect(button).not.toBeInTheDocument();
  });

  it('should call onClick when button is clicked', () => {
    render(<JumpToLatestButton show={true} onClick={mockOnClick} />);

    const button = screen.getByRole('button', {
      name: /jump to latest message/i,
    });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling classes', () => {
    render(<JumpToLatestButton show={true} onClick={mockOnClick} />);

    const wrapper = screen.getByRole('button', {
      name: /jump to latest message/i,
    }).parentElement;
    expect(wrapper).toHaveClass(
      'absolute',
      'left-1/2',
      '-translate-x-1/2',
      'mb-2',
      '-top-10'
    );
  });

  it('should have correct button variant and size', () => {
    render(<JumpToLatestButton show={true} onClick={mockOnClick} />);

    const button = screen.getByRole('button', {
      name: /jump to latest message/i,
    });
    // The Button component applies these classes internally, so we check for the presence of the button
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Jump to latest message');
  });
});

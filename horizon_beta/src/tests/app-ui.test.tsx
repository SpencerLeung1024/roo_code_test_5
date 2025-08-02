import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import '../tests/setup';

describe('App UI', () => {
  it('renders and shows start controls', async () => {
    render(<App />);
    // Should see title
    expect(screen.getByText(/Monopoly Vertical Slice/i)).toBeTruthy();
    // Should see players input and start button
    expect(screen.getByLabelText('players-input')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Start New Game/i })).toBeTruthy();
  });
});
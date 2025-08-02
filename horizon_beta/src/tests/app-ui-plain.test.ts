import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import './setup';

describe('App UI (plain TS)', () => {
  it('renders and shows start controls', async () => {
    render(React.createElement(App));
    expect(screen.getByText(/Monopoly Vertical Slice/i)).toBeTruthy();
    expect(screen.getByLabelText('players-input')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Start New Game/i })).toBeTruthy();
  });
});
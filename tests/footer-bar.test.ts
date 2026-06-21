// @vitest-environment jsdom
import { describe, test, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { FooterBar } from '../src/components/FooterBar';

afterEach(cleanup);

describe('FooterBar', () => {
  test('renders copyright text', () => {
    render(createElement(FooterBar));
    expect(screen.getByText(/©2026 Noah Webster-James/)).toBeTruthy();
  });

  test('renders Instagram link', () => {
    render(createElement(FooterBar, { links: [{ label: 'Instagram', url: 'https://instagram.com/nwjdesigns' }] }));
    const link = screen.getByText('Instagram');
    expect(link).toBeTruthy();
    expect(link.closest('a')?.getAttribute('href')).toBe('https://instagram.com/nwjdesigns');
    expect(link.closest('a')?.getAttribute('target')).toBe('_blank');
  });

  test('renders multiple links when provided', () => {
    render(createElement(FooterBar, {
      links: [
        { label: 'Instagram', url: 'https://instagram.com/nwjdesigns' },
        { label: 'Patreon', url: 'https://patreon.com/nwjdesigns' },
      ],
    }));
    expect(screen.getByText('Instagram')).toBeTruthy();
    expect(screen.getByText('Patreon')).toBeTruthy();
  });

  test('renders with no links when none provided', () => {
    render(createElement(FooterBar));
    expect(screen.getByText(/©2026 Noah Webster-James/)).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

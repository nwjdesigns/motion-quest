// @vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TopBar } from '../src/components/TopBar';

afterEach(cleanup);

const baseProps = {
  theme: 'dark' as const,
  onThemeToggle: () => {},
};

describe('TopBar', () => {
  describe('homepage context (no nav)', () => {
    test('renders the SVG mark', () => {
      render(createElement(TopBar, baseProps));
      expect(screen.getByLabelText('Motion Quest')).toBeTruthy();
    });

    test('renders theme toggle', () => {
      render(createElement(TopBar, baseProps));
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy();
    });

    test('does not render navigation links', () => {
      render(createElement(TopBar, baseProps));
      expect(screen.queryByText('Gallery')).toBeNull();
      expect(screen.queryByText(/Prev/)).toBeNull();
      expect(screen.queryByText(/Next/)).toBeNull();
    });

    test('theme toggle calls onThemeToggle', () => {
      const onThemeToggle = vi.fn();
      render(createElement(TopBar, { ...baseProps, onThemeToggle }));
      fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
      expect(onThemeToggle).toHaveBeenCalledOnce();
    });
  });

  describe('detail page context (with nav)', () => {
    const detailProps = {
      ...baseProps,
      nav: {
        baseUrl: '/motion-quest',
        prev: 'exp-01',
        next: 'exp-03',
      },
    };

    test('renders Gallery link', () => {
      render(createElement(TopBar, detailProps));
      expect(screen.getByText('Gallery')).toBeTruthy();
    });

    test('renders Prev link when prev exists', () => {
      render(createElement(TopBar, detailProps));
      const prev = screen.getByText(/Prev/);
      expect(prev).toBeTruthy();
      expect(prev.closest('a')?.getAttribute('href')).toBe('/motion-quest/experiments/exp-01');
    });

    test('renders Next link when next exists', () => {
      render(createElement(TopBar, detailProps));
      const next = screen.getByText(/Next/);
      expect(next).toBeTruthy();
      expect(next.closest('a')?.getAttribute('href')).toBe('/motion-quest/experiments/exp-03');
    });

    test('omits Prev link when prev is null', () => {
      render(createElement(TopBar, { ...detailProps, nav: { ...detailProps.nav, prev: null } }));
      expect(screen.queryByText(/Prev/)).toBeNull();
    });

    test('omits Next link when next is null', () => {
      render(createElement(TopBar, { ...detailProps, nav: { ...detailProps.nav, next: null } }));
      expect(screen.queryByText(/Next/)).toBeNull();
    });

    test('still renders SVG mark and theme toggle', () => {
      render(createElement(TopBar, detailProps));
      expect(screen.getByLabelText('Motion Quest')).toBeTruthy();
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy();
    });
  });

  describe('theme reactivity', () => {
    test('toggle label shows Light when theme is dark', () => {
      render(createElement(TopBar, { ...baseProps, theme: 'dark' }));
      expect(screen.getByRole('button', { name: /toggle theme/i }).textContent).toBe('Light');
    });

    test('toggle label shows Dark when theme is light', () => {
      render(createElement(TopBar, { ...baseProps, theme: 'light' }));
      expect(screen.getByRole('button', { name: /toggle theme/i }).textContent).toBe('Dark');
    });
  });
});

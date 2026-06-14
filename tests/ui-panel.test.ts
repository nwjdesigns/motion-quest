// @vitest-environment jsdom
import { describe, test, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UIPanel } from '../src/components/UIPanel';

afterEach(cleanup);

const baseProps = {
  layout: 'constellation' as const,
  onLayoutChange: () => {},
  links: [
    { label: 'Instagram', url: 'https://instagram.com/x' },
    { label: 'Patreon', url: 'https://patreon.com/x' },
  ],
  theme: 'dark' as const,
  onThemeToggle: () => {},
};

describe('UIPanel', () => {
  describe('desktop (isTouch=false)', () => {
    test('shows links without any interaction', () => {
      render(createElement(UIPanel, { ...baseProps, isTouch: false }));
      expect(screen.getByText('Instagram')).toBeTruthy();
      expect(screen.getByText('Patreon')).toBeTruthy();
    });

    test('does not render a collapse toggle', () => {
      render(createElement(UIPanel, { ...baseProps, isTouch: false }));
      expect(screen.queryByRole('button', { name: /menu/i })).toBeNull();
    });
  });

  describe('touch (isTouch=true)', () => {
    test('hides links until the panel is opened', () => {
      render(createElement(UIPanel, { ...baseProps, isTouch: true }));
      expect(screen.queryByText('Instagram')).toBeNull();
    });

    test('renders a toggle button to open the panel', () => {
      render(createElement(UIPanel, { ...baseProps, isTouch: true }));
      expect(screen.getByRole('button', { name: /open menu/i })).toBeTruthy();
    });

    test('tapping the toggle reveals the links', () => {
      render(createElement(UIPanel, { ...baseProps, isTouch: true }));
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      expect(screen.getByText('Instagram')).toBeTruthy();
      expect(screen.getByText('Patreon')).toBeTruthy();
    });

    test('tapping again collapses the panel', () => {
      render(createElement(UIPanel, { ...baseProps, isTouch: true }));
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
      expect(screen.queryByText('Instagram')).toBeNull();
    });
  });
});

// @vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useLayoutShortcuts } from '../src/hooks/useLayoutShortcuts';

afterEach(cleanup);

describe('useLayoutShortcuts', () => {
  test('pressing 1 fires callback with constellation', () => {
    const onLayout = vi.fn();
    renderHook(() => useLayoutShortcuts(onLayout));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(onLayout).toHaveBeenCalledWith('constellation');
  });

  test('pressing 2 fires callback with grid', () => {
    const onLayout = vi.fn();
    renderHook(() => useLayoutShortcuts(onLayout));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    expect(onLayout).toHaveBeenCalledWith('grid');
  });

  test('pressing 3 fires callback with spiral', () => {
    const onLayout = vi.fn();
    renderHook(() => useLayoutShortcuts(onLayout));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    expect(onLayout).toHaveBeenCalledWith('spiral');
  });

  test('does not fire for unrelated keys', () => {
    const onLayout = vi.fn();
    renderHook(() => useLayoutShortcuts(onLayout));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '4' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onLayout).not.toHaveBeenCalled();
  });

  test('does not fire when an input element is focused', () => {
    const onLayout = vi.fn();
    renderHook(() => useLayoutShortcuts(onLayout));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(onLayout).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  test('does not fire when a textarea element is focused', () => {
    const onLayout = vi.fn();
    renderHook(() => useLayoutShortcuts(onLayout));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    expect(onLayout).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  test('removes listener on unmount', () => {
    const onLayout = vi.fn();
    const { unmount } = renderHook(() => useLayoutShortcuts(onLayout));

    unmount();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(onLayout).not.toHaveBeenCalled();
  });
});

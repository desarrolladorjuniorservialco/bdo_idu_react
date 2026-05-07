import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  afterEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('toggle cambia de light a dark', () => {
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('toggle cambia de dark a light', () => {
    useThemeStore.setState({ theme: 'dark' });
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

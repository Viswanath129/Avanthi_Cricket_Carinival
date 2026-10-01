import { describe, it, expect } from 'vitest';
import { generatePlayerInitialPassword, generateFranchiseInitialPassword } from '../credentials';

describe('Official ACC 2026 Credential Conventions', () => {
  it('generates exact player initial password matching spec', () => {
    expect(generatePlayerInitialPassword('Rohit Nambiar')).toBe('RohitNambiar@ACC2026');
    expect(generatePlayerInitialPassword('Sai Teja')).toBe('SaiTeja@ACC2026');
    expect(generatePlayerInitialPassword('Murali Krishna')).toBe('MuraliKrishna@ACC2026');
  });

  it('normalizes player names with special characters or spaces', () => {
    expect(generatePlayerInitialPassword('V. Kalyan')).toBe('VKalyan@ACC2026');
    expect(generatePlayerInitialPassword('P. Shiva-Kumar')).toBe('PShivaKumar@ACC2026');
  });

  it('generates exact franchise initial password matching spec', () => {
    expect(generateFranchiseInitialPassword('Warriors', 3)).toBe('Warriors@ACC03');
    expect(generateFranchiseInitialPassword('Titans', 8)).toBe('Titans@ACC08');
    expect(generateFranchiseInitialPassword('Super Kings', 11)).toBe('SuperKings@ACC11');
  });

  it('pads single-digit franchise numbers with zero', () => {
    expect(generateFranchiseInitialPassword('CSE Champions', 1)).toBe('CSEChampions@ACC01');
    expect(generateFranchiseInitialPassword('Electro Kings', 2)).toBe('ElectroKings@ACC02');
  });
});

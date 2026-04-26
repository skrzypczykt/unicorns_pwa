import { describe, it, expect } from 'vitest'
import { formatDuration } from '../formatDuration'

describe('formatDuration', () => {
  describe('Minuty (≤ 120 min)', () => {
    it('formatuje 30 minut', () => {
      expect(formatDuration(30)).toBe('30 min')
    })

    it('formatuje 60 minut', () => {
      expect(formatDuration(60)).toBe('60 min')
    })

    it('formatuje 90 minut', () => {
      expect(formatDuration(90)).toBe('90 min')
    })

    it('formatuje 120 minut (granica)', () => {
      expect(formatDuration(120)).toBe('120 min')
    })

    it('formatuje 0 minut', () => {
      expect(formatDuration(0)).toBe('0 min')
    })

    it('formatuje 1 minutę', () => {
      expect(formatDuration(1)).toBe('1 min')
    })
  })

  describe('Godziny (> 120 min, < 24h)', () => {
    it('formatuje 180 minut jako 3h', () => {
      expect(formatDuration(180)).toBe('3h')
    })

    it('formatuje 240 minut jako 4h', () => {
      expect(formatDuration(240)).toBe('4h')
    })

    it('formatuje 121 minut jako 2h 1min', () => {
      expect(formatDuration(121)).toBe('2h 1min')
    })

    it('formatuje 150 minut jako 2h 30min', () => {
      expect(formatDuration(150)).toBe('2h 30min')
    })

    it('formatuje 195 minut jako 3h 15min', () => {
      expect(formatDuration(195)).toBe('3h 15min')
    })

    it('formatuje 359 minut jako 5h 59min', () => {
      expect(formatDuration(359)).toBe('5h 59min')
    })
  })

  describe('Dni (≥ 24h)', () => {
    it('formatuje 1440 minut jako 1 dzień', () => {
      expect(formatDuration(1440)).toBe('1 dzień')
    })

    it('formatuje 2880 minut jako 2 dni', () => {
      expect(formatDuration(2880)).toBe('2 dni')
    })

    it('formatuje 1500 minut jako 1 dzień 1h', () => {
      expect(formatDuration(1500)).toBe('1 dzień 1h')
    })

    it('formatuje 2970 minut jako 2 dni 1h', () => {
      // 2970 / 1440 = 2 dni, pozostaje 90 minut = 1h 30min
      // Ale zgodnie z logiką: tylko pełne godziny, więc 1h
      expect(formatDuration(2970)).toBe('2 dni 1h')
    })

    it('formatuje 3 dni (4320 minut)', () => {
      expect(formatDuration(4320)).toBe('3 dni')
    })

    it('formatuje 7 dni (10080 minut)', () => {
      expect(formatDuration(10080)).toBe('7 dni')
    })

    it('formatuje 1 dzień 5h (1740 minut)', () => {
      expect(formatDuration(1740)).toBe('1 dzień 5h')
    })
  })

  describe('Edge cases', () => {
    it('obsługuje bardzo duże wartości', () => {
      const oneWeek = 7 * 24 * 60 // 10080
      expect(formatDuration(oneWeek)).toBe('7 dni')
    })

    it('obsługuje wartości graniczne między kategoriami', () => {
      expect(formatDuration(120)).toBe('120 min') // granica min/h
      expect(formatDuration(121)).toBe('2h 1min') // przekroczenie
      expect(formatDuration(1439)).toBe('23h 59min') // przed 24h
      expect(formatDuration(1440)).toBe('1 dzień') // dokładnie 24h
    })
  })

  describe('Poprawność gramatyczna (dni vs dzień)', () => {
    it('używa "dzień" dla 1 dnia', () => {
      expect(formatDuration(1440)).toContain('dzień')
      expect(formatDuration(1440)).not.toContain('dni')
    })

    it('używa "dni" dla 2+ dni', () => {
      expect(formatDuration(2880)).toContain('dni')
      expect(formatDuration(4320)).toContain('dni')
      expect(formatDuration(2880)).not.toContain('dzień ')
    })
  })
})

/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { StartBeforeEnd, StartNotInPast, MinLessThanMax, PriceRequiresPayment } from './custom-class-validation';

describe('CreateActivityInput custom validators', () => {
  describe('StartBeforeEnd', () => {
    const validator = new StartBeforeEnd();

    it('should return true if startTime is before endTime', () => {
      const input = { startTime: new Date('2025-10-10T10:00:00Z'), endTime: new Date('2025-10-10T12:00:00Z') };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(true);
    });

    it('should return false if startTime is after endTime', () => {
      const input = { startTime: new Date('2025-10-10T13:00:00Z'), endTime: new Date('2025-10-10T12:00:00Z') };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });

    it('should return false if startTime is equal endTime', () => {
      const input = { startTime: new Date('2025-10-10T12:00:00Z'), endTime: new Date('2025-10-10T12:00:00Z') };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });
  });

  describe('StartNotInPast', () => {
    const validator = new StartNotInPast();
    it('should return false if startTime is in the past', () => {
      const input = { startTime: new Date(Date.now() - 60_000) }; // 1 minute ago
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });

    it('should return true if startTime is in the future', () => {
      const input = { startTime: new Date(Date.now() + 60_000) }; // 1 minute from now
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(true);
    });
  });

  describe('MinLessThanMax', () => {
    const validator = new MinLessThanMax();

    it('should return true if minPlayers < maxPlayers', () => {
      const input = { minPlayers: 5, maxPlayers: 10 };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(true);
    });

    it('should return false if minPlayers >= maxPlayers', () => {
      const input = { minPlayers: 10, maxPlayers: 5 };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });

    it('should return false if maxPlayers is undefined and minPlayers is defined', () => {
      const input = { minPlayers: 10 };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });

    it('should return false if minPlayers is undefined and maxPlayers is defined', () => {
      const input = { maxPlayers: 10 };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });

    it('should return true if both min and max Players are undefined', () => {
      const input = { minPlayers: undefined, maxPlayers: undefined };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(true);
    });
  });

  describe('PriceRequiresPayment', () => {
    const validator = new PriceRequiresPayment();

    it('should return true if price is undefined', () => {
      const input = { paymentRequired: false };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(true);
    });

    it('should return true if price is set and paymentRequired is true', () => {
      const input = { price: 10, paymentRequired: true };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(true);
    });

    it('should return false if price is set but paymentRequired is false', () => {
      const input = { price: 10, paymentRequired: false };
      const result = validator.validate(null, { object: input } as any);
      expect(result).toBe(false);
    });
  });
});

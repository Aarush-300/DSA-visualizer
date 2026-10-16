export interface ValidationResult {
  isValid: boolean;
  values: number[];
  error?: string;
}

export function parseIntegerList(
  input: string,
  minCount: number = 3,
  maxCount: number = 32,
  minVal: number = 1,
  maxVal: number = 999
): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      values: [],
      error: `⚠ Enter between ${minCount} and ${maxCount} integers ranging from ${minVal} to ${maxVal}.`,
    };
  }

  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  const values: number[] = [];

  for (const part of parts) {
    const num = Number(part);
    if (!Number.isInteger(num)) {
      return {
        isValid: false,
        values: [],
        error: `⚠ "${part}" is not a valid integer.`,
      };
    }
    if (num < minVal || num > maxVal) {
      return {
        isValid: false,
        values: [],
        error: `⚠ Value ${num} is out of range (${minVal} to ${maxVal}).`,
      };
    }
    values.push(num);
  }

  if (values.length < minCount || values.length > maxCount) {
    return {
      isValid: false,
      values: [],
      error: `⚠ Enter between ${minCount} and ${maxCount} integers ranging from ${minVal} to ${maxVal}.`,
    };
  }

  return {
    isValid: true,
    values,
  };
}

export function generateRandomDataset(count: number = 16, min: number = 10, max: number = 95): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return arr;
}


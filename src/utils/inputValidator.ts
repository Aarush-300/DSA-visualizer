export interface ValidationResult {
  isValid: boolean;
  values: number[];
  error?: string;
}

export interface ParseIntegerListOptions {
  minCount?: number;
  minLength?: number;
  maxCount?: number;
  maxLength?: number;
  minVal?: number;
  maxVal?: number;
  allowEmpty?: boolean;
}

export function parseIntegerList(
  input: string,
  optionsOrMin?: number | ParseIntegerListOptions,
  maxCountArg: number = 32,
  minValArg: number = 1,
  maxValArg: number = 999
): ValidationResult {
  let minCount = 3;
  let maxCount = 32;
  let minVal = 1;
  let maxVal = 999;
  let allowEmpty = false;

  if (typeof optionsOrMin === 'object' && optionsOrMin !== null) {
    minCount = optionsOrMin.minLength ?? optionsOrMin.minCount ?? (optionsOrMin.allowEmpty ? 0 : 3);
    maxCount = optionsOrMin.maxLength ?? optionsOrMin.maxCount ?? 32;
    minVal = optionsOrMin.minVal ?? 1;
    maxVal = optionsOrMin.maxVal ?? 999;
    allowEmpty = optionsOrMin.allowEmpty ?? (minCount === 0);
  } else if (typeof optionsOrMin === 'number') {
    minCount = optionsOrMin;
    maxCount = maxCountArg;
    minVal = minValArg;
    maxVal = maxValArg;
    allowEmpty = minCount === 0;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    if (allowEmpty || minCount === 0) {
      return {
        isValid: true,
        values: [],
      };
    }
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


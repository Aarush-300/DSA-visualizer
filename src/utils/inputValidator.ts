import { ActiveModuleId } from '../types/engine';

export interface ValidationResult {
  isValid: boolean;
  values: number[];
  parsedValues?: number[];
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

export interface ModuleValidationRule {
  minVal: number;
  maxVal: number;
  minLength: number;
  maxLength: number;
  allowEmpty: boolean;
  minOrder?: number;
  maxOrder?: number;
}

export const VALIDATION_RULES_BY_MODULE: Record<ActiveModuleId, ModuleValidationRule> = {
  sorting: {
    minVal: -999,
    maxVal: 999,
    minLength: 1,
    maxLength: 32,
    allowEmpty: false,
  },
  stacksQueues: {
    minVal: -999,
    maxVal: 999,
    minLength: 0,
    maxLength: 16,
    allowEmpty: true,
  },
  linkedList: {
    minVal: -999,
    maxVal: 999,
    minLength: 0,
    maxLength: 16,
    allowEmpty: true,
  },
  trees: {
    minVal: -999,
    maxVal: 999,
    minLength: 0,
    maxLength: 31,
    allowEmpty: true,
    minOrder: 3,
    maxOrder: 5,
  },
  graphs: {
    minVal: -999,
    maxVal: 999,
    minLength: 0,
    maxLength: 100,
    allowEmpty: true,
  },
};

export function validateModuleInput(module: ActiveModuleId, input: string): ValidationResult {
  if (module === 'graphs') {
    return { isValid: true, values: [] };
  }
  const rules = VALIDATION_RULES_BY_MODULE[module] ?? VALIDATION_RULES_BY_MODULE.sorting;
  return parseIntegerList(input, {
    minLength: rules.minLength,
    maxLength: rules.maxLength,
    minVal: rules.minVal,
    maxVal: rules.maxVal,
    allowEmpty: rules.allowEmpty,
  });
}

export function parseIntegerList(
  input: string,
  optionsOrMin?: number | ParseIntegerListOptions,
  maxCountArg: number = 32,
  minValArg: number = -999,
  maxValArg: number = 999
): ValidationResult {
  let minCount = 1;
  let maxCount = 32;
  let minVal = -999;
  let maxVal = 999;
  let allowEmpty = false;

  if (typeof optionsOrMin === 'object' && optionsOrMin !== null) {
    minCount = optionsOrMin.minLength ?? optionsOrMin.minCount ?? (optionsOrMin.allowEmpty ? 0 : 1);
    maxCount = optionsOrMin.maxLength ?? optionsOrMin.maxCount ?? 32;
    minVal = optionsOrMin.minVal ?? -999;
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
        parsedValues: [],
      };
    }
    return {
      isValid: false,
      values: [],
      parsedValues: [],
      error: `INVALID ELEMENT COUNT (0): Expected between ${minCount} and ${maxCount} integers ranging from ${minVal} to ${maxVal}.`,
    };
  }

  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  const values: number[] = [];

  for (let idx = 0; idx < parts.length; idx++) {
    const part = parts[idx];
    const num = Number(part);
    if (!Number.isInteger(num)) {
      return {
        isValid: false,
        values: [],
        parsedValues: [],
        error: `INVALID TOKEN '${part}' AT POSITION ${idx + 1}: Expected comma-separated integers between ${minVal} and ${maxVal}.`,
      };
    }
    if (num < minVal || num > maxVal) {
      return {
        isValid: false,
        values: [],
        parsedValues: [],
        error: `VALUE OUT OF RANGE (${num}) AT POSITION ${idx + 1}: Expected integer between ${minVal} and ${maxVal}.`,
      };
    }
    values.push(num);
  }

  if (values.length < minCount || values.length > maxCount) {
    return {
      isValid: false,
      values: [],
      parsedValues: [],
      error: `INVALID ELEMENT COUNT (${values.length}): Expected between ${minCount} and ${maxCount} integers.`,
    };
  }

  return {
    isValid: true,
    values,
    parsedValues: values,
  };
}

export function generateRandomDataset(count: number = 16, min: number = 10, max: number = 95): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return arr;
}

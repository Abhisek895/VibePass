export function serializeStringArray(values?: string[] | null): string | undefined | null {
  if (values === undefined) {
    return undefined;
  }

  if (values === null) {
    return null;
  }

  return JSON.stringify(values);
}

export function parseStringArray(value: string | null): string[] | null {
  if (value === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
  } catch {
    // Keep compatibility with older comma-separated values.
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function parseJsonField<T>(value: string | null): T | string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return value;
    }
  }

  return value;
}

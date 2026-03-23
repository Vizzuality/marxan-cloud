export type ValidationResult =
  | { valid: true }
  | { valid: false; status: number; error: string };

export function validateRequiredParams(
  params: Record<string, string | undefined>,
): ValidationResult {
  const missing = Object.entries(params)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return {
      valid: false,
      status: 400,
      error: `Invalid request: missing required parameters: ${missing.join(', ')}`,
    };
  }

  return { valid: true };
}

export function validateBaseUrl(baseUrl: string | undefined): ValidationResult {
  if (!baseUrl) {
    return { valid: false, status: 400, error: 'No baseUrl was provided.' };
  }

  try {
    new URL(baseUrl);
  } catch {
    return {
      valid: false,
      status: 400,
      error: `The provided baseUrl (${baseUrl}) is not a valid URL.`,
    };
  }

  return { valid: true };
}

export function validateRequest(
  params: Record<string, string | undefined>,
  baseUrl: string | undefined,
): ValidationResult {
  const paramsResult = validateRequiredParams(params);
  if (!paramsResult.valid) return paramsResult;

  return validateBaseUrl(baseUrl);
}

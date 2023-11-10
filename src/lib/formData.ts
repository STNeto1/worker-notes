export const extractFormData = (data: FormData): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of data.entries()) {
    result[key] = value;
  }
  return result;
};

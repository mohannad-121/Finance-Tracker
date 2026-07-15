export const formatJOD = (value: number) => new Intl.NumberFormat('en-JO', {
  style: 'currency',
  currency: 'JOD',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
}).format(value);

export const formatJODCompact = (value: number) => `JOD ${new Intl.NumberFormat('en-JO', { maximumFractionDigits: 1 }).format(value)}`;

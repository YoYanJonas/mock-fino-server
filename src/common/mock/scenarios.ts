export type MockScenario =
  | 'normal'
  | 'slow'
  | 'server-error'
  | 'validation-error'
  | 'conflict';

export const MOCK_SCENARIO_HEADER = 'x-mock-scenario';

export function parseMockScenario(raw: string | undefined): MockScenario {
  if (!raw) {
    return 'normal';
  }
  const value = raw.trim().toLowerCase();
  switch (value) {
    case 'normal':
    case 'slow':
    case 'server-error':
    case 'validation-error':
    case 'conflict':
      return value;
    default:
      return 'normal';
  }
}

const STORAGE_KEY = 'support-desk:demo-simulations';

export type DemoSimulationFlag = 'assistFailure' | 'saveFailure' | 'staleTicket';

type DemoSimulations = Record<DemoSimulationFlag, boolean>;

const EMPTY: DemoSimulations = {
  assistFailure: false,
  saveFailure: false,
  staleTicket: false,
};

function readStorage(): DemoSimulations {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<DemoSimulations>) };
  } catch {
    return { ...EMPTY };
  }
}

function writeStorage(next: DemoSimulations): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function paramTruthy(value: string | null): boolean {
  return value === '1' || value === 'true';
}

/** Dev/demo failure flags. Query params win over localStorage. */
export function getDemoSimulations(): DemoSimulations {
  if (typeof window === 'undefined') return { ...EMPTY };
  const params = new URLSearchParams(window.location.search);
  const stored = readStorage();
  return {
    assistFailure: paramTruthy(params.get('simulateAssistFailure')) || stored.assistFailure,
    saveFailure: paramTruthy(params.get('simulateSaveFailure')) || stored.saveFailure,
    staleTicket: paramTruthy(params.get('simulateStaleTicket')) || stored.staleTicket,
  };
}

export function setDemoSimulation(flag: DemoSimulationFlag, enabled: boolean): void {
  const next = { ...readStorage(), [flag]: enabled };
  writeStorage(next);
}

export function clearDemoSimulations(): void {
  writeStorage({ ...EMPTY });
}

export function isDemoModeEnabled(): boolean {
  return import.meta.env.DEV;
}

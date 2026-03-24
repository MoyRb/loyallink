export interface BusinessProfileUpdateState {
  error: string | null;
  success: string | null;
  logoUrl: string | null;
}

export function getBusinessProfileUpdateInitialState(logoUrl: string | null): BusinessProfileUpdateState {
  return {
    error: null,
    success: null,
    logoUrl,
  };
}

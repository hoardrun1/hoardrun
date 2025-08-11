export const COUNTRY_CODES = {
  AF: '93',  // Afghanistan
  AL: '355', // Albania
  DZ: '213', // Algeria
  // ... more countries
  GH: '233', // Ghana
  UG: '256', // Uganda
  CM: '237', // Cameroon
  CI: '225', // Ivory Coast
  // ... rest of African countries
  US: '1',   // United States
  GB: '44',  // United Kingdom
  // ... more countries
  ZW: '263'  // Zimbabwe
} as const;

export type CountryCode = keyof typeof COUNTRY_CODES;

export const isValidCountryCode = (code: string): code is CountryCode => {
  return code in COUNTRY_CODES;
};

// Get country name from code
export const COUNTRY_NAMES: Record<CountryCode, string> = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  // ... more countries
  GH: 'Ghana',
  UG: 'Uganda',
  CM: 'Cameroon',
  CI: "Côte d'Ivoire",
  US: 'United States',
  GB: 'United Kingdom',
  // ... rest of countries
  ZW: 'Zimbabwe'
};
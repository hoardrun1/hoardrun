const COUNTRY_CODES = {
  GH: '233', // Ghana
  UG: '256', // Uganda
  CM: '237', // Cameroon
  CI: '225', // Ivory Coast
  // Add more supported countries
};

export class PhoneValidator {
  static validateMomoNumber(phone: string, country: keyof typeof COUNTRY_CODES): boolean {
    const patterns = {
      GH: /^(?:233|\+233|0)(24|25|26|27|23|54|55|59|57|20|50|53)\d{7}$/,
      UG: /^(?:256|\+256|0)(70|71|72|74|75|76|77|78|79)\d{7}$/,
      CM: /^(?:237|\+237|0)(6|2)\d{8}$/,
      CI: /^(?:225|\+225|0)(0[1-8])\d{7}$/,
    };

    return patterns[country].test(phone);
  }

  static formatPhoneNumber(phone: string, country: keyof typeof COUNTRY_CODES): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Remove leading zeros
    const withoutLeadingZero = cleaned.replace(/^0+/, '');
    
    // Add country code if not present
    if (!withoutLeadingZero.startsWith(COUNTRY_CODES[country])) {
      return COUNTRY_CODES[country] + withoutLeadingZero;
    }
    
    return withoutLeadingZero;
  }
}
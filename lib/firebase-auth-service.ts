// Firebase auth service stub - Firebase has been removed in favor of AWS Cognito
// This file exists to prevent build errors from existing imports

export const firebaseAuthService = {
  // Stub functions to prevent build errors
  signUp: async (userData: { email: string; password: string; name: string }) => {
    throw new Error('Firebase auth has been removed. Use AWS Cognito instead.');
  },
  
  signIn: async (email: string, password: string) => {
    throw new Error('Firebase auth has been removed. Use AWS Cognito instead.');
  },
  
  signOut: async () => {
    throw new Error('Firebase auth has been removed. Use AWS Cognito instead.');
  },
  
  sendEmailVerification: async (user: any) => {
    throw new Error('Firebase auth has been removed. Use AWS Cognito instead.');
  },
  
  verifyEmail: async (actionCode: string) => {
    throw new Error('Firebase auth has been removed. Use AWS Cognito instead.');
  }
};

// Export individual functions for backward compatibility
export const signUp = firebaseAuthService.signUp;
export const signIn = firebaseAuthService.signIn;
export const signOut = firebaseAuthService.signOut;
export const sendEmailVerification = firebaseAuthService.sendEmailVerification;
export const verifyEmail = firebaseAuthService.verifyEmail;

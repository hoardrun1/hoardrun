// Winston daily rotate is disabled for Vercel deployment
// File system operations are not available in serverless environment

// Create a mock transport for compatibility
export const rotatingFileTransport = {
  log: (info: any, callback: any) => {
    console.log('Winston file transport disabled for Vercel:', info);
    if (callback) callback();
  }
};

export const errorRotatingFileTransport = {
  log: (info: any, callback: any) => {
    console.error('Winston error file transport disabled for Vercel:', info);
    if (callback) callback();
  }
};
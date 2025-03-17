export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    backoff?: boolean;
    initialDelay?: number;
  }
): Promise<T> => {
  const { retries, backoff = true, initialDelay = 300 } = options;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const delay = backoff 
        ? initialDelay * Math.pow(2, i)
        : initialDelay;
        
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry failed');
};
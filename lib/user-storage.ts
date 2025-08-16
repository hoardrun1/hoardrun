// Simple in-memory user storage for testing (replace with database in production)

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  emailVerified?: boolean;
  createdAt?: Date;
}

// In-memory storage
const users: User[] = [];

export const userStorage = {
  // Find user by email
  findByEmail: (email: string): User | undefined => {
    return users.find(user => user.email === email);
  },

  // Find user by ID
  findById: (id: string): User | undefined => {
    return users.find(user => user.id === id);
  },

  // Create new user
  create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const user: User = {
      ...userData,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date(),
      emailVerified: true, // Skip email verification for testing
    };
    
    users.push(user);
    return user;
  },

  // Get all users (for debugging)
  getAll: (): User[] => {
    return [...users];
  },

  // Clear all users (for testing)
  clear: (): void => {
    users.length = 0;
  }
};

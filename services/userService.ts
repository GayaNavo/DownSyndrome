import { User } from '../models/User';

export class UserService {
  private users: User[] = [];

  constructor() {
    // Initialize with some dummy data
    this.users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        createdAt: new Date(),
      },
    ];
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...userData,
    };
    
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLength;
  }
}
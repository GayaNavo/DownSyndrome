import { User } from '../models/User';

export interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

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

  async getAllUsers(): Promise<ServiceResponse<User[]>> {
    try {
      const users = await this.users;
      return {
        success: true,
        message: '✅ Users retrieved successfully',
        data: users,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to retrieve users: ${error.message}`,
        error,
      };
    }
  }

  async getUserById(id: string): Promise<ServiceResponse<User | null>> {
    try {
      const user = this.users.find(u => u.id === id);
      if (user) {
        return {
          success: true,
          message: '✅ User retrieved successfully',
          data: user,
        };
      }
      return {
        success: false,
        message: '⚠️ User not found',
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to retrieve user: ${error.message}`,
        error,
      };
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<ServiceResponse<User>> {
    try {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date(),
      };
      this.users.push(newUser);
      return {
        success: true,
        message: `✅ User ${newUser.name} created successfully!`,
        data: newUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to create user: ${error.message}`,
        error,
      };
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ServiceResponse<User | null>> {
    try {
      const index = this.users.findIndex(u => u.id === id);
      if (index === -1) {
        return {
          success: false,
          message: '⚠️ User not found',
          data: null,
        };
      }
      
      this.users[index] = {
        ...this.users[index],
        ...userData,
      };
      
      return {
        success: true,
        message: `✅ User ${this.users[index].name} updated successfully!`,
        data: this.users[index],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to update user: ${error.message}`,
        error,
      };
    }
  }

  async deleteUser(id: string): Promise<ServiceResponse<void>> {
    try {
      const initialLength = this.users.length;
      this.users = this.users.filter(u => u.id !== id);
      if (this.users.length < initialLength) {
        return {
          success: true,
          message: '✅ User deleted successfully',
        };
      }
      return {
        success: false,
        message: '⚠️ User not found',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to delete user: ${error.message}`,
        error,
      };
    }
  }
}
import { User } from '../models/User';
import { UserService, ServiceResponse } from '../services/userService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.userService.getAllUsers();
    if (!response.success) {
      throw new Error(response.message || 'Failed to get all users');
    }
    return response.data || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const response = await this.userService.getUserById(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get user by ID');
    }
    return response.data || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const response = await this.userService.createUser(userData);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create user');
    }
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const response = await this.userService.updateUser(id, userData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update user');
    }
    return response.data || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const response = await this.userService.deleteUser(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
    return true;
  }
}
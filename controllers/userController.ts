import { User } from '../models/User';
import { UserService } from '../services/userService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.userService.createUser(userData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    return this.userService.updateUser(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userService.deleteUser(id);
  }
}
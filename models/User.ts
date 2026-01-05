// User Model
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class UserModel {
  static validate(user: User): boolean {
    return !!user.name && !!user.email;
  }
}
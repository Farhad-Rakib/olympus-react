import { User } from '../models/user.model';
import { CreateUserRequestDto, GetUsersRequestDto, UpdateUserRequestDto } from '../dto/user.dto';
import { PaginatedResult } from '../types/pagination.type';

export interface IUserRepository {
  getUsers(params?: GetUsersRequestDto): Promise<PaginatedResult<User>>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(payload: CreateUserRequestDto): Promise<User>;
  updateUser(id: string, payload: UpdateUserRequestDto): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

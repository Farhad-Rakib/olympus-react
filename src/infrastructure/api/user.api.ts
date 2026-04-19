import { httpClient } from './http.client';
import { User } from '../../domain/models/user.model';
import { CreateUserRequestDto, GetUsersRequestDto, UpdateUserRequestDto } from '../../domain/dto/user.dto';
import { PaginatedResult } from '../../domain/types/pagination.type';

export class UserApi {
  private readonly basePath = '/users';

  async getUsers(params?: GetUsersRequestDto): Promise<PaginatedResult<User>> {
    const response = await httpClient.get<PaginatedResult<User>>(this.basePath, { params });
    return response.data;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const response = await httpClient.get<User>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createUser(payload: CreateUserRequestDto): Promise<User> {
    const response = await httpClient.post<User>(this.basePath, payload);
    return response.data;
  }

  async updateUser(id: string, payload: UpdateUserRequestDto): Promise<User> {
    const response = await httpClient.put<User>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await httpClient.delete<void>(`${this.basePath}/${id}`);
  }
}

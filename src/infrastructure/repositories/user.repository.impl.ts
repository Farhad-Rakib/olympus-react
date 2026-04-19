import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/models/user.model';
import { CreateUserRequestDto, GetUsersRequestDto, UpdateUserRequestDto } from '../../domain/dto/user.dto';
import { PaginatedResult } from '../../domain/types/pagination.type';
import { UserApi } from '../api/user.api';
import { MockUserService } from '../../mocks/services/user.service';
import { EnvConfig } from '../config/env.config';

export class UserRepositoryImpl implements IUserRepository {
  private readonly remoteApi = new UserApi();
  private readonly mockApi = new MockUserService();

  async getUsers(params?: GetUsersRequestDto): Promise<PaginatedResult<User>> {
    return EnvConfig.useMockApi ? this.mockApi.getUsers(params) : this.remoteApi.getUsers(params);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return EnvConfig.useMockApi ? this.mockApi.getUserById(id) : this.remoteApi.getUserById(id);
  }

  async createUser(payload: CreateUserRequestDto): Promise<User> {
    return EnvConfig.useMockApi ? this.mockApi.createUser(payload) : this.remoteApi.createUser(payload);
  }

  async updateUser(id: string, payload: UpdateUserRequestDto): Promise<User> {
    return EnvConfig.useMockApi ? this.mockApi.updateUser(id, payload) : this.remoteApi.updateUser(id, payload);
  }

  async deleteUser(id: string): Promise<void> {
    return EnvConfig.useMockApi ? this.mockApi.deleteUser(id) : this.remoteApi.deleteUser(id);
  }
}

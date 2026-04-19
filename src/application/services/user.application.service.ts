import { CreateUserRequestDto, GetUsersRequestDto, UpdateUserRequestDto } from '../../domain/dto/user.dto';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user.repository.impl';
import { CreateUserUseCase } from '../use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../use-cases/users/delete-user.use-case';
import { GetUsersUseCase } from '../use-cases/users/get-users.use-case';
import { UpdateUserUseCase } from '../use-cases/users/update-user.use-case';

class UserApplicationService {
  private readonly repository = new UserRepositoryImpl();
  private readonly getUsersUseCase = new GetUsersUseCase(this.repository);
  private readonly createUserUseCase = new CreateUserUseCase(this.repository);
  private readonly updateUserUseCase = new UpdateUserUseCase(this.repository);
  private readonly deleteUserUseCase = new DeleteUserUseCase(this.repository);

  getUsers(params?: GetUsersRequestDto) {
    return this.getUsersUseCase.execute(params);
  }

  createUser(payload: CreateUserRequestDto) {
    return this.createUserUseCase.execute(payload);
  }

  updateUser(id: string, payload: UpdateUserRequestDto) {
    return this.updateUserUseCase.execute(id, payload);
  }

  deleteUser(id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}

export const userApplicationService = new UserApplicationService();

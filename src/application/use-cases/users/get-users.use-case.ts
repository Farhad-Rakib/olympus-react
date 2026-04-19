import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { GetUsersRequestDto } from '../../../domain/dto/user.dto';

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  execute(params?: GetUsersRequestDto) {
    return this.userRepository.getUsers(params);
  }
}

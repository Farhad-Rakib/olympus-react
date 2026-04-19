import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { CreateUserRequestDto } from '../../../domain/dto/user.dto';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  execute(payload: CreateUserRequestDto) {
    return this.userRepository.createUser(payload);
  }
}

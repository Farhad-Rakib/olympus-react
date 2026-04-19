import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { UpdateUserRequestDto } from '../../../domain/dto/user.dto';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  execute(id: string, payload: UpdateUserRequestDto) {
    return this.userRepository.updateUser(id, payload);
  }
}

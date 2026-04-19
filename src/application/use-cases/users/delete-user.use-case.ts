import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  execute(id: string) {
    return this.userRepository.deleteUser(id);
  }
}

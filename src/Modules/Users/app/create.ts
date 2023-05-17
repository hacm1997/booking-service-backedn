import { Guest } from '../domain/entities/Guest';
import { GuestRepository } from '../domain/guest.repository';
import { UserDto } from '../dto/User';
import { MapperUserDOmainDto } from '../mappers/DomainDto';

export class CreateUserUseCase {
  private readonly _userRepository: GuestRepository;
  private readonly _mapper = new MapperUserDOmainDto();

  constructor (userRepository: GuestRepository) {
    this._userRepository = userRepository;
  }

  async run (user: UserDto): Promise<UserDto> {
    const userDomain: Guest = this._mapper.from(user);
    const userExists = await this._userRepository.get(userDomain.id);
    if (userExists !== undefined) {
      if (userExists.cellphone === userDomain.cellphone && userExists.email === userDomain.email && userExists.name === userDomain.name && userExists.details === userDomain.details) {
        return user;
      } else {
        await this._userRepository.update(userDomain);
      }
    } else {
      await this._userRepository.save(userDomain);
    }
    return user;
  }
}

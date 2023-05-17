import { CreateUserUseCase } from '../app/create';
import { GuestDynamoDBRepository } from '../db/GuestDynamoDB.repository';
import { UserDto } from '../dto/User';

export const createUserController = async (user: UserDto, tenant: string): Promise<UserDto> => {
  const repository = new GuestDynamoDBRepository(tenant);
  const useCase = new CreateUserUseCase(repository);
  return await useCase.run(user);
};

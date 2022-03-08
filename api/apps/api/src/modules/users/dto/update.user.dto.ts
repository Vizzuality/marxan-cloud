import { PartialType } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { CreateUserDTO } from './create.user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

export class ExactEmailParamsDTO {
  @IsEmail()
  email!: string;
}

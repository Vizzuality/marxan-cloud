import { PartialType } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, IsEmail } from 'class-validator';
import { CreateUserDTO } from './create.user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

export class BlockUsersBatchDTO {
  @IsArray()
  @IsString({ each: true })
  @IsUUID('all', { each: true })
  userIds!: string[];
}

export class ExactEmailParamsDTO {
  @IsEmail()
  email!: string;
}

import { applyDecorators } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';

export const IsPassword = () => applyDecorators(IsString(), MaxLength(72));

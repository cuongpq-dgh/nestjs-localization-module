import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTranslationDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  lang!: string;

  @IsString()
  @IsOptional()
  ns?: string = 'translation';
}
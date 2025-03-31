import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsNotEmpty()
  lang!: string;

  @IsString()
  @IsOptional()
  ns?: string = 'translation';
}

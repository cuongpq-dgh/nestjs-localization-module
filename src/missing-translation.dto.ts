import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MissingTranslationDto {
  @IsString()
  @IsNotEmpty()
  lang!: string;

  @IsString()
  @IsNotEmpty()
  ns!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;
}

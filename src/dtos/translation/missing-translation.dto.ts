import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MissingTranslationDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  lang!: string;

  @IsString()
  @IsOptional()
  ns?: string = 'translation';

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

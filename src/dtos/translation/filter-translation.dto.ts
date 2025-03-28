import { IsOptional, IsString } from 'class-validator';

export class FilterTranslationDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  lang?: string;

  @IsString()
  @IsOptional()
  ns?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

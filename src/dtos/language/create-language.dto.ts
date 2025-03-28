import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @IsString()
  @IsOptional()
  flagIcon?: string;
}

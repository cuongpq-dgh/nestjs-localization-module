import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTranslationDto {
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
  @IsNotEmpty()
  value!: string;
}

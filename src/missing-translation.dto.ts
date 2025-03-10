import { IsNotEmpty, IsString } from 'class-validator';

export class MissingTranslationDto {
  @IsString()
  @IsNotEmpty()
  lang!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  defaultValue?: string;
}

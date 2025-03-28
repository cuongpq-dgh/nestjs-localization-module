import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

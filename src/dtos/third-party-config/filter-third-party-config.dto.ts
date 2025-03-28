import { IsOptional, IsString } from 'class-validator';

export class FilterThirdPartyConfigDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  group?: string;
}

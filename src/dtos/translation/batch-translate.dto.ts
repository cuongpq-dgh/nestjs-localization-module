import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BatchTranslateDto {
    //   @ApiProperty({
    //     description: 'Array of texts to translate',
    //     example: ['Hello world', 'How are you?'],
    //     type: [String]
    //   })
    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    texts!: string[];

    //   @ApiProperty({
    //     description: 'Target language code',
    //     example: 'fr',
    //     type: String
    //   })
    @IsString()
    @IsNotEmpty()
    targetLang!: string;

    //   @ApiPropertyOptional({
    //     description: 'Source language code (optional, will use default language if not provided)',
    //     example: 'en',
    //     type: String
    //   })
    @IsString()
    @IsOptional()
    sourceLang?: string;
}

export class BatchTranslateResponseDto {
    //   @ApiProperty({
    //     description: 'Array of translated texts',
    //     example: ['Bonjour le monde', 'Comment allez-vous?'],
    //     type: [String]
    //   })
    translations!: { key : string, value: string }[];
}

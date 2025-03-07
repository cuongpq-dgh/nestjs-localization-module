import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from './translations.entity';
import { UpdateTranslationDto } from './translations.dto';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(Translation)
    private readonly translationRepo: Repository<Translation>,
  ) {}

  async getTranslations(lang: string): Promise<Record<string, string>> {
    const translations = await this.translationRepo.find({ where: { lang } });
    return translations.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async updateTranslation(dto: UpdateTranslationDto): Promise<void> {
    await this.translationRepo
      .createQueryBuilder()
      .insert()
      .into(Translation)
      .values(dto)
      .orUpdate(['value'], ['lang', 'key'])
      .execute();
  }
}

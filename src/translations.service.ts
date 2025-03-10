import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from './translations.entity';
import { UpdateTranslationDto } from './translations.dto';
import { MissingTranslationDto } from './missing-translation.dto';

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

  async addMissingTranslation(dto: MissingTranslationDto): Promise<void> {
    const existing = await this.translationRepo.findOne({ where: { lang: dto.lang, key: dto.key } });
    if (!existing) {
      const newTranslation = this.translationRepo.create({
        lang: dto.lang,
        key: dto.key,
        value: dto.defaultValue ? dto.defaultValue : dto.key,
      });
      await this.translationRepo.save(newTranslation);
    }
  }
}

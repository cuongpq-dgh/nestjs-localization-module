import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Translations table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_translations_lang_ns" ON "nlm_translations" ("lang", "ns")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_translations_categoryId" ON "nlm_translations" ("categoryId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_translations_key" ON "nlm_translations" ("key")`);

    // Languages table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_languages_code" ON "nlm_languages" ("code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_languages_active" ON "nlm_languages" ("active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_languages_isDefault" ON "nlm_languages" ("isDefault")`);

    // Categories table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_categories_slug" ON "nlm_categories" ("slug")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_categories_parentId" ON "nlm_categories" ("parentId")`);

    // Third party config table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_third_party_config_code" ON "nlm_third_party_config" ("code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_third_party_config_group" ON "nlm_third_party_config" ("group")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_nlm_third_party_config_type" ON "nlm_third_party_config" ("type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop translations indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_translations_lang_ns"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_translations_categoryId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_translations_key"`);

    // Drop languages indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_languages_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_languages_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_languages_isDefault"`);

    // Drop categories indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_categories_slug"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_categories_parentId"`);

    // Drop third party config indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_third_party_config_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_third_party_config_group"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_nlm_third_party_config_type"`);
  }
}

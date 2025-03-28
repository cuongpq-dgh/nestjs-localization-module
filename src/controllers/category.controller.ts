import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../dtos/category/update-category.dto';
import { LocalizationAuthGuard } from '../localization-auth.guard';

@Controller('categories')
@UseGuards(LocalizationAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createDto: CreateCategoryDto) {
    return this.categoryService.create(createDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
  
  @Get(':id/progress')
  getProgress(
    @Param('id') id: string,
    @Query('lang') languageCode?: string
  ) {
    return this.categoryService.getTranslationProgress(id, languageCode);
  }
}

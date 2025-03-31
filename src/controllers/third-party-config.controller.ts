import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ThirdPartyConfigService } from '../services/third-party-config.service';
import { UpdateThirdPartyConfigDto } from '../dtos/third-party-config/update-third-party-config.dto';
import { FilterThirdPartyConfigDto } from '../dtos/third-party-config/filter-third-party-config.dto';
import { LocalizationAuthGuard } from '../guards/localization-auth.guard';
import { CreateThirdPartyConfigDto } from '../dtos/third-party-config/create-third-party-config.dto';

@Controller('third-party-config')
@UseGuards(LocalizationAuthGuard)
export class ThirdPartyConfigController {
  constructor(private readonly thirdPartyConfigService: ThirdPartyConfigService) {}

  @Post()
  create(@Body() createDto: CreateThirdPartyConfigDto) {
    return this.thirdPartyConfigService.create(createDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterThirdPartyConfigDto) {
    return this.thirdPartyConfigService.findAll(filterDto);
  }

  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.thirdPartyConfigService.findById(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.thirdPartyConfigService.findByCode(code);
  }

  @Get('group/:group')
  findByGroup(@Param('group') group: string) {
    return this.thirdPartyConfigService.findByGroup(group);
  }

  @Get('type/:type')
  findByType(@Param('type') type: string) {
    return this.thirdPartyConfigService.findByType(type);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateThirdPartyConfigDto) {
    return this.thirdPartyConfigService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thirdPartyConfigService.remove(id);
  }
}

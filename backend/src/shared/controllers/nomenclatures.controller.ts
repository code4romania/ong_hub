import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CitySearchDto } from '../dto/city-search.dto';
import { NomenclaturesService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('nomenclatures')
export class NomenclaturesController {
  constructor(private nomenclaturesService: NomenclaturesService) {}

  @Get('cities')
  getCities(@Query() citySearchDto: CitySearchDto) {
    return this.nomenclaturesService.getCitiesSearch(citySearchDto);
  }

  @Get('counties')
  getCounties() {
    return this.nomenclaturesService.getCounties({});
  }

  @Get('domains')
  getDomains() {
    return this.nomenclaturesService.getDomains({});
  }

  @Get('regions')
  getRegions() {
    return this.nomenclaturesService.getRegions({});
  }
}

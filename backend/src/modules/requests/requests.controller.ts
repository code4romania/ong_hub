import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Param,
  Body,
  Post,
  Query,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { RequestsService } from './services/requests.service';
import { Request } from '../requests/entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { BaseFilterDto } from 'src/common/base/base-filter.dto';
import { Pagination } from 'src/common/interfaces/pagination';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTooManyRequestsResponse()
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Roles(Role.SUPER_ADMIN)
  @ApiQuery({ type: () => BaseFilterDto })
  @Get('')
  async getAll(@Query() filters: BaseFilterDto): Promise<Pagination<Request>> {
    return this.requestsService.findAll(filters);
  }

  /**
   * ------------------------------
   * ------------------------------
   * ******* ORGANIZATION *********
   * ------------------------------
   */

  @Public()
  @ApiBody({ type: CreateRequestDto })
  @Post('organization')
  create(@Body() createRequestDto: CreateRequestDto): Promise<any> {
    return this.requestsService.createOrganizationRequest(createRequestDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @Get('organization/:id')
  findOne(@Param('id') id: string): Promise<Request> {
    return this.requestsService.findOneOrganizationRequest(+id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('organization/:id/approve')
  approve(@Param('id') id: number): Promise<Request> {
    return this.requestsService.approveOrganization(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('organization/:id/reject')
  reject(@Param('id') id: number): Promise<Request> {
    return this.requestsService.reject(id);
  }
}

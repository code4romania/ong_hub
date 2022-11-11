import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ExtractUser } from 'src/modules/user/decorators/user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { Role } from 'src/modules/user/enums/role.enum';
import { CreateCivicCenterServiceDto } from '../dto/create-civic-center-service.dto';
import { UpdateCivicCenterServiceDto } from '../dto/update-civic-center-service.dto';
import { CivicCenterService } from '../entities/civic-center-service.entity';
import { CivicCenterServiceService } from '../services/civic-center.service';

@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiTooManyRequestsResponse()
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('civic-center/services')
export class CivicCenterController {
  constructor(
    private readonly civicCenterServiceService: CivicCenterServiceService,
  ) {}

  @ApiBody({ type: CreateCivicCenterServiceDto })
  @Post()
  async create(
    @Body() body: CreateCivicCenterServiceDto,
    @ExtractUser() user: User,
  ): Promise<CivicCenterService> {
    return this.civicCenterServiceService.create({
      organizationId: user.organizationId,
      ...body,
    });
  }

  @ApiBody({ type: UpdateCivicCenterServiceDto })
  @ApiParam({ name: 'id', type: Number })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateCivicCenterServiceDto,
    @ExtractUser() user: User,
  ): Promise<CivicCenterService> {
    return this.civicCenterServiceService.update(id, {
      organizationId: user.organizationId,
      ...body,
    });
  }

  @Get()
  async findAll(@ExtractUser() user: User): Promise<CivicCenterService[]> {
    return this.civicCenterServiceService.findAll(user.organizationId);
  }

  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  async find(
    @Param('id') id: number,
    @ExtractUser() user: User,
  ): Promise<CivicCenterService> {
    return this.civicCenterServiceService.find(id, user.organizationId);
  }

  @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.civicCenterServiceService.delete(id);
  }
}

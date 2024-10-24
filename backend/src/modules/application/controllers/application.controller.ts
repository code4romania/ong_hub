import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Pagination } from 'src/common/interfaces/pagination';
import { ExtractUser } from '../../user/decorators/user.decorator';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/enums/role.enum';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { ApplicationFilterDto } from '../dto/filter-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { ApplicationTableView } from '../entities/application-table-view.entity';
import { Application } from '../entities/application.entity';
import {
  IOngApplication,
  IOngApplicationDetails,
} from '../interfaces/ong-application.interface';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicationOrganizationFilterDto } from '../dto/application-organization-filters.dto';
import { ApplicationOngView } from '../entities/application-ong-view.entity';
import { ApplicationAccessFilterDto } from '../dto/application-access-filter.dto';
import { OngApplicationService } from '../services/ong-application.service';
import { ApplicationService } from '../services/application.service';
import { OngApplicationStatus } from '../enums/ong-application-status.enum';
import { OrganizationApplicationFilterDto } from '../dto/organization-application.filters.dto';

@ApiTooManyRequestsResponse()
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('application')
export class ApplicationController {
  constructor(
    private readonly appService: ApplicationService,
    private readonly ongApplicationService: OngApplicationService,
  ) {}

  @Roles(Role.SUPER_ADMIN)
  @Get('')
  @ApiQuery({ type: () => ApplicationFilterDto })
  getAll(
    @Query() filters: ApplicationFilterDto,
  ): Promise<Pagination<ApplicationTableView>> {
    return this.appService.findAll(filters);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('/list')
  getAllAppsNames(): Promise<Pick<Application, 'id' | 'name'>[]> {
    return this.appService.getAllAppsNames();
  }

  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateApplicationDto })
  @Post()
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFiles() { logo }: { logo?: Express.Multer.File[] },
  ): Promise<Application> {
    return this.appService.create(createApplicationDto, logo);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateApplicationDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @UploadedFiles() { logo }: { logo?: Express.Multer.File[] },
  ) {
    return this.appService.update(id, updateApplicationDto, logo);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ type: () => OrganizationApplicationFilterDto })
  @Get('organization/:id')
  findApplicationsByOrganizationId(
    @Param('id') organizationId: number,
    @Query() filters: OrganizationApplicationFilterDto,
  ): Promise<IOngApplication[]> {
    return this.ongApplicationService.findApplicationsByOrganizationId(
      organizationId,
      filters,
    );
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ type: () => ApplicationAccessFilterDto })
  @Patch(':id/restrict')
  restrict(
    @Param('id') id: number,
    @Query() filter: ApplicationAccessFilterDto,
  ) {
    return this.ongApplicationService.update(
      filter.organizationId,
      id,
      OngApplicationStatus.RESTRICTED,
    );
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ type: () => ApplicationAccessFilterDto })
  @Patch(':id/restore')
  restore(
    @Param('id') id: number,
    @Query() filter: ApplicationAccessFilterDto,
  ) {
    return this.ongApplicationService.update(
      filter.organizationId,
      id,
      OngApplicationStatus.ACTIVE,
    );
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ type: () => ApplicationOrganizationFilterDto })
  @Get(':id/organization')
  findOrganizationsByApplicationId(
    @Param('id') id: number,
    @Query() filters: ApplicationOrganizationFilterDto,
  ): Promise<Pagination<ApplicationOngView>> {
    return this.appService.findOrganizationsByApplicationId(id, filters);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @ExtractUser() user: User,
  ): Promise<IOngApplicationDetails> {
    return this.appService.findOne(user, id);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'organizationId', type: String })
  @Delete(':id/organization/:organizationId')
  removeOneFoOng(
    @Param('id') id: number,
    @Param('organizationId') organizationId: number,
  ): Promise<void> {
    return this.ongApplicationService.delete(id, organizationId);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  removeOne(@Param('id') id: number): Promise<void> {
    return this.appService.delete(id);
  }
}

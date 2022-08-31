import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Pagination } from 'src/common/interfaces/pagination';
import { ExtractUser } from './decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserService } from './services/user.service';

@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('user')
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody({ type: CreateUserDto })
  @Post('')
  async create(@Body() body: CreateUserDto) {
    return this.userService.createEmployee({
      email: body.email,
      name: body.name,
      phone: body.phone,
      organizationId: body.organizationId,
    });
  }

  @ApiQuery({ type: () => UserFilterDto })
  @Get('')
  async getAll(
    @ExtractUser() user: User,
    @Query() filters: UserFilterDto,
  ): Promise<Pagination<User>> {
    return this.userService.findAll(filters, user.organizationId);
  }

  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  async getOne(
    @Param('id') userId: number,
    @ExtractUser() user: User,
  ): Promise<User> {
    return this.userService.getById(userId);
  }

  @ApiBody({ type: Number, isArray: true })
  @Patch('restrict')
  restrict(
    @Body(new ParseArrayPipe({ items: Number }))
    ids: number[],
    @ExtractUser() user: User,
  ) {
    return this.userService.restrictAccess(ids, user.organizationId);
  }

  @ApiBody({ type: Number, isArray: true })
  @Patch('activate')
  restore(
    @Body(new ParseArrayPipe({ items: Number }))
    ids: number[],
    @ExtractUser() user: User,
  ) {
    return this.userService.restoreAccess(ids, user.organizationId);
  }

  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  async update(
    @Param('id') userId: number,
    @Body() body: UpdateUserDto,
    @ExtractUser() user: User,
  ): Promise<User> {
    return this.userService.updateById(userId, body, user.organizationId);
  }

  @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  remove(@Param('id') id: number, @ExtractUser() user: User) {
    return this.userService.removeById(id, user.organizationId);
  }
}

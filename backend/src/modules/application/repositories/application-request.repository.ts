import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseDAO } from 'src/common/base/base-dao.class';
import { Repository } from 'typeorm';
import { ApplicationRequest } from '../entities/application-request.entity';

@Injectable()
export class ApplicationRequestRepository extends BaseDAO<ApplicationRequest> {
  constructor(
    @InjectRepository(ApplicationRequest)
    private readonly applicationRequestRepository: Repository<ApplicationRequest>,
  ) {
    super(applicationRequestRepository);
  }
}
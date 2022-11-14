import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FILE_ERRORS } from 'src/shared/constants/file-errors.constants';
import { FILE_TYPE } from 'src/shared/enum/FileType.enum';
import { FileManagerService } from 'src/shared/services/file-manager.service';
import { FindOneOptions } from 'typeorm';
import { ORGANIZATION_ERRORS } from '../constants/errors.constants';
import { UpdateOrganizationGeneralDto } from '../dto/update-organization-general.dto';
import { OrganizationGeneral } from '../entities';
import { OrganizationGeneralRepository } from '../repositories/organization-general.repository';
import { ContactService } from './contact.service';

@Injectable()
export class OrganizationGeneralService {
  private readonly logger = new Logger(OrganizationGeneralService.name);
  constructor(
    private readonly organizationGeneralRepository: OrganizationGeneralRepository,
    private readonly contactService: ContactService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  public async update(
    id: number,
    updateOrganizationGeneralDto: UpdateOrganizationGeneralDto,
    logoPath?: string,
    logo?: Express.Multer.File[],
  ) {
    let { contact, ...updateOrganizationData } = updateOrganizationGeneralDto;

    if (contact) {
      const contactEntity = await this.contactService.get({
        where: { id: contact.id },
      });
      updateOrganizationData['contact'] = { ...contactEntity, ...contact };
    }

    if (logo) {
      if (updateOrganizationGeneralDto.logo) {
        await this.fileManagerService.deleteFiles([
          updateOrganizationGeneralDto.logo,
        ]);
      }

      try {
        const uploadedFile = await this.fileManagerService.uploadFiles(
          logoPath,
          logo,
          FILE_TYPE.IMAGE,
        );

        updateOrganizationData = {
          ...updateOrganizationData,
          logo: uploadedFile[0],
        };
      } catch (error) {
        this.logger.error({
          error: { error },
          ...ORGANIZATION_ERRORS.UPLOAD,
        });
        const err = error?.response;
        switch (err?.errorCode) {
          case FILE_ERRORS.IMAGE.errorCode:
            throw new BadRequestException({
              ...FILE_ERRORS.IMAGE,
              error,
            });
          case FILE_ERRORS.SIZE.errorCode:
            throw new BadRequestException({
              ...FILE_ERRORS.SIZE,
              error,
            });
          default:
            throw new InternalServerErrorException({
              ...ORGANIZATION_ERRORS.UPLOAD,
              error,
            });
        }
      }
    }

    await this.organizationGeneralRepository.save({
      id,
      ...updateOrganizationData,
    });

    let organizationGeneral = await this.organizationGeneralRepository.get({
      where: { id },
      relations: ['city', 'county', 'contact'],
    });

    if (logo) {
      const logoPublicUrl = await this.fileManagerService.generatePresignedURL(
        organizationGeneral.logo,
      );
      organizationGeneral = {
        ...organizationGeneral,
        logo: logoPublicUrl,
      };
    }

    return organizationGeneral;
  }

  public async findOne(
    options: FindOneOptions<OrganizationGeneral>,
  ): Promise<OrganizationGeneral> {
    return this.organizationGeneralRepository.get(options);
  }
}

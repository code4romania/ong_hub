import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApplicationService } from 'src/modules/application/services/application.service';
import { CompletionStatus } from 'src/modules/organization/enums/organization-financial-completion.enum';
import { OrganizationStatisticsType } from 'src/modules/statistics/enums/organization-statistics-type.enum';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { RequestStatus } from 'src/modules/organization/enums/request-status.enum';
import {
  IAllOrganizationsStatistics,
  IGeneralONGHubStatistics,
  IOrganizationRequestStatistics,
  IOrganizationStatistics,
  IOrganizationStatusStatistics,
} from 'src/modules/statistics/interfaces/organization-statistics.interface';
import { OrganizationService } from 'src/modules/organization/services';
import { OrganizationRequestService } from 'src/modules/organization/services/organization-request.service';
import { UserService } from 'src/modules/user/services/user.service';
import { OrganizatioStatusnStatisticsViewRepository } from '../repositories/organization-status-statistics-view.repository';
import { StatisticsFilterDto } from '../dto/statistics-filter.dto';
import { STATISTICS_ERRORS } from '../constants/error.constants';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);
  constructor(
    private readonly organizationStatisticsViewRepository: OrganizatioStatusnStatisticsViewRepository,
    private readonly organizationRequestService: OrganizationRequestService,
    private readonly organizationsService: OrganizationService,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async getOrganizationRequestStatistics(
    filters: StatisticsFilterDto,
  ): Promise<IOrganizationRequestStatistics> {
    try {
      const filterMapping = {
        [OrganizationStatisticsType.DAILY]: {
          format: 'DD Mon',
          interval: '29 day',
          step: '1 day',
        },
        [OrganizationStatisticsType.MONTHLY]: {
          format: 'Mon YY',
          interval: '11 month',
          step: '1 month',
        },
        [OrganizationStatisticsType.YEARLY]: {
          format: 'YYYY',
          interval: '4 year',
          step: '1 year',
        },
      };

      const labelsQuery = `select to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }') AS "label" from generate_series((NOW() - interval '${
        filterMapping[filters.statisticsFilter].interval
      }'), NOW(), '${
        filterMapping[filters.statisticsFilter].step
      }'::interval) d ORDER BY d::date ASC`;

      const approvedQuery = `select to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }') AS "date", SUM(case when to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }') = to_char(o.updated_on,'${
        filterMapping[filters.statisticsFilter].format
      }') then 1 else 0 end) AS "result" from generate_series((NOW() - interval '${
        filterMapping[filters.statisticsFilter].interval
      }'), NOW(), '${
        filterMapping[filters.statisticsFilter].step
      }'::interval) d, "organization_request" o WHERE o.status = '${
        RequestStatus.APPROVED
      }' GROUP BY to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }')`;

      const declinedQuery = `select to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }') AS "date", SUM(case when to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }') = to_char(o.updated_on,'${
        filterMapping[filters.statisticsFilter].format
      }') then 1 else 0 end) AS "result" from generate_series((NOW() - interval '${
        filterMapping[filters.statisticsFilter].interval
      }'), NOW(), '${
        filterMapping[filters.statisticsFilter].step
      }'::interval) d, "organization_request" o WHERE o.status = '${
        RequestStatus.DECLINED
      }' GROUP BY to_char(d::date,'${
        filterMapping[filters.statisticsFilter].format
      }')`;

      const labels: string[] = await this.organizationRequestService
        .query(labelsQuery)
        .then((data: any) => {
          return data.map((record: any) => record?.label);
        });

      const approved: string[] = await this.organizationRequestService
        .query(approvedQuery)
        .then((data: any) => {
          const response = new Array(labels.length).fill('0');
          if (data.length) {
            data.map((record: any) => {
              response[labels.indexOf(record.date)] = record.result;
            });
          }
          return response;
        });

      const declined: string[] = await this.organizationRequestService
        .query(declinedQuery)
        .then((data: any) => {
          const response = new Array(labels.length).fill('0');
          if (data.length) {
            data.map((record: any) => {
              response[labels.indexOf(record.date)] = record.result;
            });
          }
          return response;
        });

      return {
        labels,
        approved,
        declined,
      };
    } catch (error) {
      this.logger.error({
        error: { error },
        ...STATISTICS_ERRORS.REQUEST_STATISTICS,
      });
      throw new InternalServerErrorException({
        ...STATISTICS_ERRORS.REQUEST_STATISTICS,
        error,
      });
    }
  }

  public async getOrganizationStatusStatistics(
    filters: StatisticsFilterDto,
  ): Promise<IOrganizationStatusStatistics> {
    try {
      const filterMapping = {
        [OrganizationStatisticsType.DAILY]: {
          type: OrganizationStatisticsType.DAILY,
          data_size: 30,
        },
        [OrganizationStatisticsType.MONTHLY]: {
          type: OrganizationStatisticsType.MONTHLY,
          data_size: 12,
        },
        [OrganizationStatisticsType.YEARLY]: {
          type: OrganizationStatisticsType.YEARLY,
          data_size: 5,
        },
      };

      const labels = [];
      const active = new Array(
        filterMapping[filters.statisticsFilter].data_size,
      ).fill('0');
      const restricted = new Array(
        filterMapping[filters.statisticsFilter].data_size,
      ).fill('0');

      const rawData = await this.organizationStatisticsViewRepository.getMany({
        where: { type: filterMapping[filters.statisticsFilter].type },
      });

      if (rawData.length) {
        rawData.map((row: any) => {
          if (!labels.includes(row.date)) {
            labels.push(row.date);
          }
          if (row.status === OrganizationStatus.ACTIVE) {
            active[labels.indexOf(row.date)] = row.count;
          }
          if (row.status === OrganizationStatus.RESTRICTED) {
            restricted[labels.indexOf(row.date)] = row.count;
          }
          active.push;
        });
      }

      return {
        labels,
        active,
        restricted,
      };
    } catch (error) {
      this.logger.error({
        error: { error },
        ...STATISTICS_ERRORS.ORGANIZATION_STATUS_STATISTICS,
      });
      throw new InternalServerErrorException({
        ...STATISTICS_ERRORS.ORGANIZATION_STATUS_STATISTICS,
        error,
      });
    }
  }

  public async getAllOrganizationsStatistics(): Promise<IAllOrganizationsStatistics> {
    try {
      const numberOfActiveOrganizations =
        await this.organizationsService.countOrganizations({
          where: { status: OrganizationStatus.ACTIVE },
        });

      const numberOfUpdatedOrganizations =
        await this.organizationsService.countOrganizations({
          where: {
            status: OrganizationStatus.ACTIVE,
            completionStatus: CompletionStatus.COMPLETED,
          },
        });

      const numberOfUsers = await this.userService.countUsers();

      const numberOfPendingRequests =
        await this.organizationRequestService.countOrganizationRequest({
          where: { status: RequestStatus.PENDING },
        });

      const numberOfApps = await this.applicationService.countApplications();

      return {
        numberOfActiveOrganizations,
        numberOfUpdatedOrganizations,
        numberOfPendingRequests,
        numberOfUsers,
        meanNumberOfUsers:
          numberOfActiveOrganizations && numberOfUsers
            ? Math.ceil(numberOfActiveOrganizations / numberOfUsers)
            : 0,
        numberOfApps,
      };
    } catch (error) {
      this.logger.error({
        error: { error },
        ...STATISTICS_ERRORS.HUB_STATISTICS,
      });
      throw new InternalServerErrorException({
        ...STATISTICS_ERRORS.HUB_STATISTICS,
        error,
      });
    }
  }

  public async getOrganizationStatistics(
    organizationId: number,
  ): Promise<IOrganizationStatistics> {
    try {
      const organization = await this.organizationsService.find(organizationId);
      const installedApps =
        await this.applicationService.findApplicationsForOng(organizationId);
      const numberOfUsers = await this.userService.countUsers({
        where: { organizationId },
      });

      return {
        isOrganizationUpdated:
          organization.completionStatus === CompletionStatus.COMPLETED,
        organizationCreatedOn: organization.createdOn,
        organizationSyncedOn: organization.syncedOn,
        numberOfInstalledApps: installedApps.length,
        numberOfUsers,
        hubStatistics: await this.getGeneralONGHubStatistics(),
      };
    } catch (error) {
      this.logger.error({
        error: { error },
        ...STATISTICS_ERRORS.ORGANIZATION_STATISTICS,
      });
      throw new InternalServerErrorException({
        ...STATISTICS_ERRORS.ORGANIZATION_STATISTICS,
        error,
      });
    }
  }

  private async getGeneralONGHubStatistics(): Promise<IGeneralONGHubStatistics> {
    const numberOfActiveOrganizations =
      await this.organizationsService.countOrganizations({
        where: { status: OrganizationStatus.ACTIVE },
      });
    const numberOfApplications =
      await this.applicationService.countApplications();

    return {
      numberOfActiveOrganizations,
      numberOfApplications,
    };
  }
}
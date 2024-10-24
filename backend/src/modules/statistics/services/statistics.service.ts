import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import {
  OrganizationFinancialService,
  OrganizationService,
} from 'src/modules/organization/services';
import { OrganizationRequestService } from 'src/modules/organization/services/organization-request.service';
import { UserService } from 'src/modules/user/services/user.service';
import { OrganizatioStatusnStatisticsViewRepository } from '../repositories/organization-status-statistics-view.repository';
import { StatisticsFilterDto } from '../dto/statistics-filter.dto';
import { STATISTICS_ERRORS } from '../constants/error.constants';
import { PracticeProgramService } from 'src/modules/practice-program/services/practice-program.service';
import { ApplicationPullingType } from 'src/modules/application/enums/application-pulling-type.enum';
import { CivicCenterServiceService } from 'src/modules/civic-center-service/services/civic-center.service';
import { ILandingCounter } from '../interfaces/landing-counters.interface';
import { APPLICATION_ERRORS } from 'src/modules/application/constants/application-error.constants';
import { Role } from 'src/modules/user/enums/role.enum';
import { ApplicationService } from 'src/modules/application/services/application.service';
import { UserStatus } from 'src/modules/user/enums/user-status.enum';
import { In } from 'typeorm';
import { ApplicationStatus } from 'src/modules/application/enums/application-status.enum';
import { OrganizationReportService } from 'src/modules/organization/services/organization-report.service';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);
  constructor(
    private readonly organizationStatisticsViewRepository: OrganizatioStatusnStatisticsViewRepository,
    private readonly organizationRequestService: OrganizationRequestService,
    private readonly organizationsService: OrganizationService,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
    private readonly practiceProgramService: PracticeProgramService,
    private readonly civicCenterService: CivicCenterServiceService,
    private readonly organizationFinancialService: OrganizationFinancialService,
    private readonly organizationReportService: OrganizationReportService,
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
          format: 'Mon YYYY',
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
        await this.organizationsService.countOrganizationsWithUpdatedReports();

      const numberOfUsers = await this.userService.countUsers({
        where: {
          status: In([UserStatus.ACTIVE, UserStatus.RESTRICTED]),
          organization: {
            status: OrganizationStatus.ACTIVE,
          },
        },
      });

      const numberOfPendingRequests =
        await this.organizationRequestService.countOrganizationRequest({
          where: { status: RequestStatus.PENDING },
        });

      const numberOfApps = await this.applicationService.countApplications({
        where: { status: ApplicationStatus.ACTIVE },
      });

      return {
        numberOfActiveOrganizations,
        numberOfUpdatedOrganizations,
        numberOfPendingRequests,
        numberOfUsers,
        meanNumberOfUsers:
          numberOfUsers && numberOfActiveOrganizations
            ? Math.ceil(numberOfUsers / numberOfActiveOrganizations)
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
    role?: Role,
    userId?: number,
  ): Promise<IOrganizationStatistics> {
    try {
      const organization = await this.organizationsService.find(organizationId);
      const activeApps =
        role === Role.EMPLOYEE
          ? await this.applicationService.countActiveForEmployee(
              organizationId,
              userId,
            )
          : await this.applicationService.countActiveForAdmin(organizationId);
      const numberOfUsers = await this.userService.countUsers({
        where: {
          organizationId,
          role: Role.EMPLOYEE,
          status: In([UserStatus.ACTIVE, UserStatus.RESTRICTED]),
        },
      });

      const numberOfErroredFinancialReports =
        await this.organizationFinancialService.countNotCompletedReports(
          organizationId,
        );

      const numberOfErroredReportsInvestorsPartners =
        await this.organizationReportService.countNotCompletedReports(
          organizationId,
        );

      const financialReportsAndReportsInvestorPartenerslastUpdatedOn =
        await this.organizationsService.getFinancialAndReportsLastUpdatedOn(
          organizationId,
        );

      return {
        organizationCreatedOn: organization.createdOn,
        organizationSyncedOn:
          financialReportsAndReportsInvestorPartenerslastUpdatedOn,
        numberOfInstalledApps: activeApps,
        numberOfUsers,
        hubStatistics: await this.getGeneralONGHubStatistics(),
        numberOfErroredFinancialReports,
        numberOfErroredReportsInvestorsPartners,
      };
    } catch (error) {
      console.log(error);
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

  public async getLandingCounters(
    pullingType: ApplicationPullingType,
  ): Promise<ILandingCounter> {
    try {
      let ongsWithApplication: number;
      let activeItems: number; // active programs or services

      switch (pullingType) {
        case ApplicationPullingType.PRACTICE_PROGRAM:
          ongsWithApplication =
            await this.organizationsService.countOrganizationsWithActivePracticePrograms();
          activeItems = await this.practiceProgramService.countActive();
          break;
        case ApplicationPullingType.CIVIC_SERVICE:
          ongsWithApplication =
            await this.organizationsService.countOrganizationsWithActiveCivicCenterServices();
          activeItems = await this.civicCenterService.countActive();
          break;
        default:
          throw new BadRequestException(APPLICATION_ERRORS.PULLING_TYPE);
      }

      return {
        activeItems,
        ongsWithApplication,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  private async getGeneralONGHubStatistics(): Promise<IGeneralONGHubStatistics> {
    const numberOfActiveOrganizations =
      await this.organizationsService.countOrganizations({
        where: { status: OrganizationStatus.ACTIVE },
      });
    const numberOfApplications =
      await this.applicationService.countApplications({
        where: { status: ApplicationStatus.ACTIVE },
      });

    return {
      numberOfActiveOrganizations,
      numberOfApplications,
    };
  }
}

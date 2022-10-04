import {
	Injectable,
} from '@nestjs/common';
import { ApplicationService } from 'src/modules/application/services/application.service';
import { UserService } from 'src/modules/user/services/user.service';
import { OrganizationService } from '.';
import { Organization } from '../entities';
import { OrganizationFinancialStatus } from '../enums/organization-financial-status.enum';
import { OrganizationStatus } from '../enums/organization-status.enum';
import { IGeneralONGHubStatistics, IOrganizationStatistics, ISuperAdminOrganizationStatistics } from '../interfaces/organization-statistics.interface';
import { OrganizationRequestService } from './organization-request.service';

@Injectable()
export class OrganizationStatisticsService {
	constructor(
		private readonly organizationsService: OrganizationService,
		private readonly applicationService: ApplicationService,
		private readonly userService: UserService,
		private readonly organizationRequestService: OrganizationRequestService
	) { }

	public async getAllOrganizationsStatistics(): Promise<ISuperAdminOrganizationStatistics> {
		const organizations = await this.organizationsService.getMany({ where: { status: OrganizationStatus.ACTIVE } });
		const users = await this.userService.findMany({});
		const organizationRequest = await this.organizationRequestService.findMany({});
		const applications = await this.applicationService.getMany({});
		return {
			numberOfActiveOrganizations: organizations.length,
			numberOfUpdatedOrganizations: organizations.filter((ong: Organization) => ong.financialStatus === OrganizationFinancialStatus.COMPLETED).length,
			numberOfPendingRequests: organizationRequest.length,
			numberOfUsers: users.length,
			meanNumberOfUsers: Math.floor(organizations.length / users.length),
			numberOfApps: applications.length,
		}
	}

	public async getOrganizationStatistics(organizationId: number): Promise<IOrganizationStatistics> {
		const organization = await this.organizationsService.find(organizationId);
		const installedApps = await this.applicationService.findApplicationsForOng(organizationId);
		const users = await this.userService.findMany({ where: { organizationId } });

		return {
			isOrganizationUpdated: organization.financialStatus === OrganizationFinancialStatus.COMPLETED ? true : false,
			organizationCreatedOn: organization.createdOn,
			organizationSyncedOn: organization.syncedOn,
			numberOfInstalledApps: installedApps.length,
			numberOfUsers: users.length,
		}
	}

	public async getGeneralONGHubStatistics(): Promise<IGeneralONGHubStatistics> {
		const organizations = await this.organizationsService.getMany({ where: { status: OrganizationStatus.ACTIVE } });
		const applications = await this.applicationService.getMany(null);

		return {
			numberOfActiveOrganizations: organizations.length,
			numberOfApplications: applications.length
		}
	}
}
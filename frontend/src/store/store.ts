import { organizationActivitySlice } from './organization/organization-activity.slice';
import create from 'zustand';
import { City } from '../common/interfaces/city.interface';
import { County } from '../common/interfaces/county.interface';
import { IOrganizationFinancial } from '../pages/organization/interfaces/OrganizationFinancial.interface';
import { IOrganizationGeneral } from '../pages/organization/interfaces/OrganizationGeneral.interface';
import { IOrganizationLegal } from '../pages/organization/interfaces/OrganizationLegal.interface';
import { IOrganizationReport } from '../pages/organization/interfaces/OrganizationReport.interface';
import { nomenclatureSlice } from './nomenclature/nomenclature.slice';
import { organizationFinancialSlice } from './organization/organization-financial.slice';
import { organizationGeneralSlice } from './organization/organization-general.slice';
import { Domain } from '../common/interfaces/domain.interface';
import { Region } from '../common/interfaces/region.interface';
import { Coalition } from '../common/interfaces/coalitions.interface';
import { Federation } from '../common/interfaces/federations.interface';
import { organizationLegalSlice } from './organization/organization-legal.slice';
import { organizationReportsSlice } from './organization/organization-reports.slice';
import { profileSlice } from './user/Profile.slice';
import { IUser } from '../pages/users/interfaces/User.interface';
import {
  IOrganization,
  IOrganizationFull,
} from '../pages/organization/interfaces/Organization.interface';
import { organizationSlice } from './organization/organization.slice';
import { usersSlice } from './user/Users.slice';
import { PaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import { IRequest } from '../pages/requests/interfaces/Request.interface';
import { requestsSlice } from './request/Requests.slice';
import { organizationsSlice } from './organization/organizations.slice';
import { Application } from '../services/application/interfaces/Application.interface';
import { applicationsSlice } from './application/Application.slice';

interface OrganizationState {
  organizations: PaginatedEntity<IOrganizationFull>;
  organization: IOrganization | null;
  organizationGeneral: IOrganizationGeneral | null;
  organizationFinancial: IOrganizationFinancial[];
  organizationActivity: any;
  organizationReport: IOrganizationReport | null;
  organizationLegal: IOrganizationLegal | null;
  setOrganization: (organization: IOrganization) => void;
  setOrganizationActivity: (organizationActivity: any) => void;
  setOrganizationGeneral: (organizationGeneral: IOrganizationGeneral) => void;
  setOrganizationFinancial: (organizationFinancial: IOrganizationFinancial[]) => void;
  setOrganizationReport: (organizationReport: IOrganizationReport) => void;
  setOrganizationLegal: (organizationLegal: IOrganizationLegal) => void;
  setOrganizations: (organizations: PaginatedEntity<IOrganizationFull>) => void;
}
interface NomenclatureState {
  counties: County[];
  cities: City[];
  domains: Domain[];
  regions: Region[];
  federations: Federation[];
  coalitions: Coalition[];
  setCounties: (counties: County[]) => void;
  setCities: (cities: City[]) => void;
  setDomains: (domains: Domain[]) => void;
  setRegions: (regions: Region[]) => void;
  setFederations: (federations: Federation[]) => void;
  setCoalitions: (coaltions: Coalition[]) => void;
}

interface ProfileState {
  profile: IUser | null;
  setProfile: (user: IUser | null) => void;
}

interface UserState {
  users: PaginatedEntity<IUser>;
  setUsers: (users: PaginatedEntity<IUser>) => void;
}

interface RequestState {
  requests: PaginatedEntity<IRequest>;
  setRequests: (requests: PaginatedEntity<IRequest>) => void;
}

interface ApplicationState {
  applications: PaginatedEntity<Application>;
  setApplications: (applications: PaginatedEntity<Application>) => void;

  selectedApplication: Application | null;
  setSelectedApplication: (application: Application) => void;
}

const useStore = create<
  OrganizationState & NomenclatureState & UserState & ProfileState & RequestState & ApplicationState
>()((set: any) => ({
  ...organizationSlice(set),
  ...organizationGeneralSlice(set),
  ...organizationFinancialSlice(set),
  ...organizationActivitySlice(set),
  ...organizationReportsSlice(set),
  ...organizationLegalSlice(set),
  ...nomenclatureSlice(set),
  ...profileSlice(set),
  ...usersSlice(set),
  ...requestsSlice(set),
  ...organizationsSlice(set),
  ...applicationsSlice(set),
}));

export default useStore;

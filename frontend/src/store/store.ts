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
import { IUser, IUserWithApplications } from '../pages/users/interfaces/User.interface';
import {
  IOrganization,
  IOrganizationFull,
  IOrganizationView,
} from '../pages/organization/interfaces/Organization.interface';
import { organizationSlice } from './organization/organization.slice';
import { usersSlice } from './user/Users.slice';
import { PaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import {
  IApplicationRequest,
  IOrganizationRequest,
} from '../pages/requests/interfaces/Request.interface';
import { organizationRequestsSlice } from './request/OrganizationRequests';
import { organizationsSlice } from './organization/organizations.slice';
import {
  Application,
  ApplicationOrganization,
  ApplicationWithOngStatus,
  ApplicationWithOngStatusDetails,
} from '../services/application/interfaces/Application.interface';
import { applicationsSlice } from './application/Application.slice';
import { applicationRequestsSlice } from './request/ApplicationRequests';
import { ongApplicationSlice } from './application/OngApplication.slice';
import { IInvite } from '../pages/users/interfaces/Invite.interface';
import { invitesSlice } from './user/Invites.slice';
import { Skill } from '../common/interfaces/skill.interface';
import { Faculty } from '../common/interfaces/faculty.interface';
import { IFeedback } from '../pages/civic-center-service/interfaces/Feedback.interface';
import { feedbacksSlice } from './civic-center-service/Feedback.slice';
import { Issuer } from '../common/interfaces/issuer.interface';
import { ApplicationLabel } from '../common/interfaces/application-label.interface';

interface OrganizationState {
  organizations: PaginatedEntity<IOrganizationView>;
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
  setOrganizations: (organizations: PaginatedEntity<IOrganizationView>) => void;
}
interface NomenclatureState {
  counties: County[];
  cities: City[];
  domains: Domain[];
  regions: Region[];
  federations: Federation[];
  coalitions: Coalition[];
  skills: Skill[];
  faculties: Faculty[];
  issuers: Issuer[];
  applicationLabels: ApplicationLabel[];
  setCounties: (counties: County[]) => void;
  setCities: (cities: City[]) => void;
  setDomains: (domains: Domain[]) => void;
  setRegions: (regions: Region[]) => void;
  setFederations: (federations: Federation[]) => void;
  setCoalitions: (coaltions: Coalition[]) => void;
  setSkills: (skills: Skill[]) => void;
  setFaculties: (faculties: Faculty[]) => void;
  setIssuers: (issuers: Issuer[]) => void;
  setApplicationLabels: (applicationLabels: ApplicationLabel[]) => void;
}

interface ProfileState {
  profile: IUser | null;
  setProfile: (user: IUser | null) => void;
}

interface UserState {
  users: PaginatedEntity<IUserWithApplications>;
  setUsers: (users: PaginatedEntity<IUserWithApplications>) => void;
}

interface InviteState {
  invites: IInvite[];
  setInvites: (invites: IInvite[]) => void;
}

interface OrganizationRequestState {
  organizationRequests: PaginatedEntity<IOrganizationRequest>;
  setOrganizationRequests: (organizationRequests: PaginatedEntity<IOrganizationRequest>) => void;
}

interface ApplicationRequestState {
  applicationRequests: PaginatedEntity<IApplicationRequest>;
  setApplicationRequests: (applicationRequests: PaginatedEntity<IApplicationRequest>) => void;
}

interface FeedbackState {
  feedbacks: PaginatedEntity<IFeedback>;
  setFeedbacks: (feedbacks: PaginatedEntity<IFeedback>) => void;
}

// Super Admin
interface ApplicationState {
  applications: PaginatedEntity<Application>;
  setApplications: (applications: PaginatedEntity<Application>) => void;
  selectedApplication: ApplicationWithOngStatusDetails | null;
  setSelectedApplication: (application: ApplicationWithOngStatusDetails) => void;
  applicationOrganizations: PaginatedEntity<ApplicationOrganization>;
  setApplicationOrganizations: (
    applicationOrganizations: PaginatedEntity<ApplicationOrganization>,
  ) => void;
}

// Admin
interface OngApplicationState {
  ongApplications: ApplicationWithOngStatus[];
  setOngApplications: (applications: ApplicationWithOngStatus[]) => void;
  selectedOngApplication: ApplicationWithOngStatusDetails | null;
  setSelectedOngApplication: (application: ApplicationWithOngStatusDetails) => void;
}

const useStore = create<
  OrganizationState &
    NomenclatureState &
    UserState &
    ProfileState &
    OrganizationRequestState &
    ApplicationRequestState &
    ApplicationState &
    OngApplicationState &
    InviteState &
    FeedbackState
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
  ...organizationsSlice(set),
  ...applicationsSlice(set),
  ...ongApplicationSlice(set),
  ...applicationRequestsSlice(set),
  ...organizationRequestsSlice(set),
  ...invitesSlice(set),
  ...feedbacksSlice(set),
}));

export default useStore;

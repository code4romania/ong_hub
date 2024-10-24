import { AxiosResponse } from 'axios';
import { OrderDirection } from '../../common/enums/sort-direction.enum';
import { cleanupPayload, mapSelectToApplicationLabel } from '../../common/helpers/format.helper';
import { PaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ApplicationTypeEnum } from '../../pages/apps-store/constants/ApplicationType.enum';
import { OngApplicationStatus } from '../../pages/requests/interfaces/OngApplication.interface';
import API from '../API';
import { CreateApplicationDto } from './interfaces/Application.dto';
import {
  Application,
  ApplicationAccess,
  ApplicationListItem,
  ApplicationOrganization,
  ApplicationStatus,
  ApplicationWithOngStatus,
} from './interfaces/Application.interface';
import { mapEntityToFormData } from '../organization/OrganizationFormDataMapper.service';

export const createApplication = (
  createApplicationDto: CreateApplicationDto,
  logo: File,
): Promise<Application> => {
  const payload = generateApplicationFormDataPayload(createApplicationDto, logo);
  // send request
  return API.post(`/application`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res: AxiosResponse<Application>) => res.data);
};

export const updateApplication = (
  applicationId: string,
  applicationUpdatePayload: Partial<CreateApplicationDto>,
  logo?: File,
): Promise<Application> => {
  const payload = generateApplicationFormDataPayload(applicationUpdatePayload, logo);
  return API.patch(`/application/${applicationId}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const activateApplication = (applicationId: string): Promise<Application> => {
  return API.patch(`/application/${applicationId}/activate`).then((res) => res.data);
};

export const deactivateApplication = (applicationId: string): Promise<Application> => {
  return API.patch(`/application/${applicationId}/deactivate`).then((res) => res.data);
};

export const getApplications = async (
  limit: number,
  page: number,
  orderBy: string,
  orderDirection: OrderDirection,
  search?: string,
  status?: ApplicationStatus,
  type?: ApplicationTypeEnum,
): Promise<PaginatedEntity<Application>> => {
  let requestUrl = `/application?limit=${limit}&page=${page}&orderBy=${orderBy}&orderDirection=${orderDirection}`;

  if (search) requestUrl = `${requestUrl}&search=${search}`;

  if (status) requestUrl = `${requestUrl}&status=${status}`;

  if (type) requestUrl = `${requestUrl}&type=${type}`;

  return API.get(requestUrl).then((res) => res.data);
};

// Returns all the applications with ONGApp table entry as status (your ONG relationship with that Application)
export const getOngApplications = async (
  showAllApps?: boolean,
): Promise<PaginatedEntity<ApplicationWithOngStatus>> => {
  return API.get(`/organizations/application`, { params: { showAllApps } }).then((res) => res.data);
};

export const getApplicationsForCreateUser = async (): Promise<ApplicationAccess[]> => {
  return API.get('/organizations/application/user').then((res) => res.data);
};

export const getApplicationsForEditUser = async (userId: string): Promise<ApplicationAccess[]> => {
  return API.get(`/organizations/application/user/${userId}`).then((res) => res.data);
};

export const getApplicationById = (applicationId: string): Promise<Application> => {
  return API.get(`/application/${applicationId}`).then((res) => res.data);
};

export const getApplicationsListNames = (): Promise<ApplicationListItem[]> => {
  return API.get(`/application/list`).then((res) => res.data);
};

export const getApplicationOrganizations = (
  applicationId: string,
  limit: number,
  page: number,
  orderBy: string,
  orderDirection: OrderDirection,
  search?: string,
  status?: OngApplicationStatus,
): Promise<PaginatedEntity<ApplicationOrganization>> => {
  let requestUrl = `/application/${applicationId}/organization?limit=${limit}&page=${page}&orderBy=${orderBy}&orderDirection=${orderDirection}`;

  if (search) requestUrl = `${requestUrl}&search=${search}`;

  if (status) requestUrl = `${requestUrl}&status=${status}`;

  return API.get(requestUrl).then((res) => res.data);
};

export const restrictApplication = (applicationId: number, organizationId: string) => {
  return API.patch(`/application/${applicationId}/restrict?organizationId=${organizationId}`).then(
    (res) => res.data,
  );
};

export const restoreApplication = (applicationId: number, organizationId: string) => {
  return API.patch(`/application/${applicationId}/restore?organizationId=${organizationId}`).then(
    (res) => res.data,
  );
};

export const removeApplication = (applicationId: number) => {
  return API.delete(`application/${applicationId}`).then((res) => res.data);
};

export const removeOngApplication = (applicationId: number, organizationId: string) => {
  return API.delete(`/application/${applicationId}/organization/${organizationId}`).then(
    (res) => res.data,
  );
};

export const removeOngApplicationRequest = (applicationId: number) => {
  return API.delete(`/organizations/application/${applicationId}`).then((res) => res.data);
};

const generateApplicationFormDataPayload = (
  applicationDto: Partial<CreateApplicationDto>,
  logo?: File,
): FormData => {
  // we remove the logo and steps
  const { steps, pullingType, applicationLabel, ...data } = applicationDto;
  // create form data payload
  let payload = new FormData();
  for (const prop in cleanupPayload(data)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.append(prop, (data as any)[prop] as string);
  }

  if (pullingType) {
    payload.append('pullingType', pullingType.value);
  }

  // map steps correcly as array
  steps?.forEach((step: { item: string }) => {
    if (step.item) {
      payload.append('steps[]', step.item);
    }
  });

  // check if logo was attached and add file
  if (logo) {
    payload.append('logo', logo);
  }

  if (applicationLabel) {
    payload = mapEntityToFormData(
      payload,
      'applicationLabel',
      mapSelectToApplicationLabel(applicationLabel),
    );
  }

  return payload;
};

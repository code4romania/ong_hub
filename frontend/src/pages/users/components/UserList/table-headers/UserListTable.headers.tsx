import React from 'react';
import { TableColumn } from 'react-data-table-component';
import { formatDate } from '../../../../../common/helpers/format.helper';
import StatusBadge, { BadgeStatus } from '../../../../../components/status-badge/StatusBadge';
import { IUser } from '../../../interfaces/User.interface';
import { UserStatus } from '../../../enums/UserStatus.enum';
import i18n from '../../../../../common/config/i18n';
import DataTableNameHeader from '../../../../../components/data-table-name-header/DataTableNameHeader';

const translations = {
  name: i18n.t('user:list_header.name'),
  email: i18n.t('user:list_header.email'),
  phone: i18n.t('user:list_header.phone'),
  status: i18n.t('user:list_header.status'),
  created: i18n.t('user:list_header.created'),
  active: i18n.t('user:status.active'),
  restricted: i18n.t('user:status.restricted'),
};

export const UserListTableHeaders: TableColumn<IUser>[] = [
  {
    id: 'name',
    name: <DataTableNameHeader text={translations.name} />,
    sortable: true,
    grow: 1,
    wrap: false,
    minWidth: '15rem',
    selector: (row: IUser) => row.name,
  },
  {
    id: 'email',
    name: <DataTableNameHeader text={translations.email} />,
    sortable: true,
    grow: 1,
    minWidth: '20rem',
    selector: (row: IUser) => row.email,
  },
  {
    id: 'phone',
    name: <DataTableNameHeader text={translations.phone} />,
    sortable: true,
    minWidth: '9rem',
    selector: (row: IUser) => row.phone,
  },
  {
    id: 'availableApps',
    name: <DataTableNameHeader text="Access Aplicatii" />,
    sortable: true,
    minWidth: '15rem',
    cell: (row: IUser) => (
      <div>
        {`(${row.availableApps.length})`}{' '}
        {row?.availableApps?.map((app, i) => (
          <a
            key={i}
            className="!text-blue-500 !hover:text-blue-800 font-titilliumSemiBold"
            href={`/application/${app.id}/details`}
          >
            {app?.name}
            {i < row.availableApps.length - 1 ? ', ' : ''}
          </a>
        ))}
      </div>
    ),
    selector: (row: IUser) => row.availableAppsList || '',
  },
  {
    id: 'status',
    sortable: true,
    sortField: 'status',
    name: <DataTableNameHeader text={translations.status} />,
    minWidth: '10rem',
    cell: (row: IUser) => (
      <StatusBadge
        status={row.status === UserStatus.ACTIVE ? BadgeStatus.SUCCESS : BadgeStatus.ERROR}
        value={row.status === UserStatus.ACTIVE ? translations.active : translations.restricted}
      />
    ),
  },
  {
    id: 'createdOn',
    minWidth: '10rem',
    name: <DataTableNameHeader text={translations.created} />,
    sortable: true,
    selector: (row: IUser) => formatDate(row?.createdOn as string),
  },
];

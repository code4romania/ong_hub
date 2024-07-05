import React, { useEffect, useState } from 'react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { PencilIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/solid';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { PaginationConfig } from '../../../../common/config/pagination.config';
import { OrderDirection } from '../../../../common/enums/sort-direction.enum';
import { useErrorToast, useSuccessToast } from '../../../../common/hooks/useToast';
import DataTableFilters from '../../../../components/data-table-filters/DataTableFilters';
import DataTableComponent from '../../../../components/data-table/DataTableComponent';
import PopoverMenu, { PopoverMenuRowType } from '../../../../components/popover-menu/PopoverMenu';
import DateRangePicker from '../../../../components/date-range-picker/DateRangePicker';
import Select from '../../../../components/Select/Select';
import {
  useRemoveUserMutation,
  useRestoreUserMutation,
  useRestrictUserMutation,
  useUsersQuery,
} from '../../../../services/user/User.queries';
import { useOngApplications, useUser } from '../../../../store/selectors';
import { UserStatusOptions } from '../../constants/filters.constants';
import { UserStatus } from '../../enums/UserStatus.enum';
import { IUser } from '../../interfaces/User.interface';
import { UserListTableHeaders } from './table-headers/UserListTable.headers';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../../../components/confim-removal-modal/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { UserRole } from '../../enums/UserRole.enum';
import { getUsersForDownload } from '../../../../services/user/User.service';
import {
  useApplicationListNamesQuery,
  useOngApplicationsQuery,
} from '../../../../services/application/Application.queries';
import { ApplicationListItem } from '../../../../services/application/interfaces/Application.interface';

const UserList = (props: { organizationId?: number }) => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();
  const [searchWord, setSearchWord] = useState<string | null>(null);
  const [status, setStatus] = useState<{ status: UserStatus; label: string } | null>();
  const [appsFilter, setAppsFilters] = useState<ApplicationListItem[]>([]);
  const [range, setRange] = useState<Date[]>([]);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] = useState<boolean>(false);
  const { role } = useAuthContext();

  const organizationId = props.organizationId;

  const { users } = useUser();

  const { t } = useTranslation(['user', 'common']);

  const { isLoading, error, refetch } = useUsersQuery(
    rowsPerPage as number,
    page as number,
    orderByColumn as string,
    orderDirection as OrderDirection,
    searchWord as string,
    status?.status,
    range,
    organizationId as number,
    appsFilter as ApplicationListItem[],
  );
  const restrictUserAccessMutation = useRestrictUserMutation();
  const restoreUserAccessMutation = useRestoreUserMutation();
  const removeUserMutation = useRemoveUserMutation();

  const { data: appsNameList } = useApplicationListNamesQuery();

  useEffect(() => {
    if (users?.meta) {
      setPage(users.meta.currentPage);
      setRowsPerPage(users.meta.itemsPerPage);
      setOrderByColumn(users.meta.orderByColumn);
      setOrderDirection(users.meta.orderDirection);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) setIsConfirmRemoveModalOpen(true);
  }, [selectedUser]);

  useEffect(() => {
    if (error) useErrorToast(t('list.load_error'));

    if (restrictUserAccessMutation.error) useErrorToast(t('list.restrict_error'));

    if (restoreUserAccessMutation.error) useErrorToast(t('list.restore_error'));

    if (removeUserMutation.error) useErrorToast(t('list.remove_error'));
  }, [
    error,
    restrictUserAccessMutation.error,
    restoreUserAccessMutation.error,
    removeUserMutation.error,
  ]);

  const buildUserActionColumn = (): TableColumn<IUser> => {
    const activeUserMenuItems = [
      {
        name: t('list.restrict'),
        icon: NoSymbolIcon,
        onClick: onRestrictAccess,
        type: PopoverMenuRowType.REMOVE,
      },
    ];

    // For now onlt admin can edit an user
    if (role === UserRole.ADMIN) {
      activeUserMenuItems.unshift({
        name: t('edit', { ns: 'common' }),
        icon: PencilIcon,
        onClick: onEdit,
        type: PopoverMenuRowType.INFO,
      });
    }

    const restrictedUserMenuItems = [
      {
        name: t('list.give_access'),
        icon: ArrowPathIcon,
        onClick: onRestoreAccess,
      },
      {
        name: t('list.permanent'),
        icon: TrashIcon,
        onClick: setSelectedUser,
        type: PopoverMenuRowType.REMOVE,
      },
    ];

    if (role === UserRole.ADMIN) {
      restrictedUserMenuItems.splice(1, 0, {
        name: t('edit', { ns: 'common' }),
        icon: PencilIcon,
        onClick: onEdit,
      });
    }

    return {
      name: '',
      cell: (row: IUser) => (
        <PopoverMenu
          row={row}
          menuItems={
            row.status === UserStatus.ACTIVE ? activeUserMenuItems : restrictedUserMenuItems
          }
        />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  /**
   * PAGINATION
   */
  const onRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const onSort = (column: TableColumn<string>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  /**
   * ROW ACTIONS
   */
  const onRestoreAccess = (row: IUser) => {
    restoreUserAccessMutation.mutate([row.id], {
      onSuccess: () => {
        useSuccessToast(`${t('list.restore_success')} ${row.name}`);
        refetch();
      },
    });
  };

  const onEdit = (row: IUser) => {
    navigate(`/user/${row.id}`);
  };

  const onDelete = () => {
    if (selectedUser) {
      removeUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          useSuccessToast(`${t('list.remove_success')} ${selectedUser.name}`);
          refetch();
        },
        onSettled: () => {
          setSelectedUser(null);
        },
      });
    }
    setIsConfirmRemoveModalOpen(false);
  };

  const onRestrictAccess = (row: IUser) => {
    restrictUserAccessMutation.mutate([row.id], {
      onSuccess: () => {
        useSuccessToast(`${t('list.restrict_success')} ${row.name}`);
        refetch();
      },
    });
  };

  /**
   * FILTERS
   */
  const onSearch = (searchWord: string) => {
    setSearchWord(searchWord);
  };

  const onDateChange = (interval: unknown[]) => {
    if (interval[0] && interval[1]) {
      setRange(interval as Date[]);
    }
  };

  const onStatusChange = (selected: { status: UserStatus; label: string }) => {
    setStatus(selected);
  };

  const onResetFilters = () => {
    setStatus(null);
    setRange([]);
    setSearchWord(null);
    setAppsFilters([]);
  };

  const onCancelUserRemoval = () => {
    setIsConfirmRemoveModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * ACTIONS
   */
  const onExport = async () => {
    const { data } = await getUsersForDownload(
      orderByColumn || '',
      orderDirection || OrderDirection.ASC,
      searchWord,
      status?.status,
      range,
      organizationId,
    );

    const url = URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Utilizatori.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={searchWord}
        onResetFilters={onResetFilters}
      >
        <div className="flex gap-x-6">
          <div className="sm:basis-1/4 w-full">
            <DateRangePicker
              label={t('list.date')}
              value={range.length > 0 ? range : undefined}
              onChange={onDateChange}
              id="user-lists-date__input"
            />
          </div>
          <div className="sm:basis-1/4 w-full">
            <Select
              config={{
                label: t('status', { ns: 'common' }),
                collection: UserStatusOptions,
                displayedAttribute: 'label',
              }}
              selected={status}
              onChange={onStatusChange}
            />
          </div>
          <div className="sm:basis-1/4 w-full">
            <Select
              config={{
                label: t('list.access_to_app'),
                collection: [{ id: null, name: t('filters.all') }, ...appsNameList?.sort((a, b) => (a.name < b.name ? -1 : 1)) || []],
                displayedAttribute: 'name',
              }}
              selected={appsFilter[0]}
              onChange={(selection: ApplicationListItem) => selection.id ? setAppsFilters([selection]) : setAppsFilters([])}
            />
          </div>
        </div>
      </DataTableFilters>
      <div className="w-full bg-white shadow rounded-lg my-6">
        <div className="py-5 lg:px-10 px-5 flex items-center justify-between border-b border-gray-200">
          <p className="text-gray-800 font-titilliumBold sm:text-lg lg:text-xl text-md">
            {t('title')}
          </p>
          <button
            aria-label={t('list.download')}
            type="button"
            className="edit-button sm:text-sm lg:text-base text-xs"
            onClick={onExport}
          >
            {t('list.download')}
          </button>
        </div>
        <DataTableComponent
          columns={[...UserListTableHeaders, buildUserActionColumn()]}
          data={users.items}
          loading={isLoading}
          pagination
          sortServer
          paginationPerPage={users.meta.itemsPerPage}
          paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
          paginationTotalRows={users.meta.totalItems}
          paginationDefaultPage={page}
          onChangeRowsPerPage={onRowsPerPageChange}
          onChangePage={onChangePage}
          onSort={onSort}
          onRowClicked={onEdit}
        />
        {isConfirmRemoveModalOpen && (
          <ConfirmationModal
            title={t('list.confirmation')}
            description={t('list.description')}
            closeBtnLabel={t('back', { ns: 'common' })}
            confirmBtnLabel={t('delete', { ns: 'common' })}
            onClose={onCancelUserRemoval}
            onConfirm={onDelete}
          />
        )}
      </div>
    </div>
  );
};

export default UserList;

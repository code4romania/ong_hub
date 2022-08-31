import React, { useContext, useEffect, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import DataTableComponent from '../../../../components/data-table/DataTableComponent';
import PopoverMenu from '../../../../components/popover-menu/PopoverMenu';
import { IOrganizationFinancial } from '../../interfaces/OrganizationFinancial.interface';
import { OrganizationFinancialTableHeaders } from './OrganizationFinancialTableHeaders';
import { EyeIcon, PencilIcon } from '@heroicons/react/outline';
import ExpenseReportModal from './components/ExpenseReportModal';
import IncomeReportModal from './components/IncomeReportModal';
import { Expense } from '../../interfaces/Expense.interface';
import { Income } from '../../interfaces/Income.interface';
import { useSelectedOrganization } from '../../../../store/selectors';
import { FinancialType } from '../../enums/FinancialType.enum';
import { useOrganizationByProfileMutation } from '../../../../services/organization/Organization.queries';
import CardPanel from '../../../../components/card-panel/CardPanel';
import { useErrorToast } from '../../../../common/hooks/useToast';
import { AuthContext } from '../../../../contexts/AuthContext';
import { UserRole } from '../../../users/enums/UserRole.enum';

const OrganizationFinancial = () => {
  const [isExpenseReportModalOpen, setIsExpenseReportModalOpen] = useState<boolean>(false);
  const [isIncomeReportModalOpen, setIsIncomeReportModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<IOrganizationFinancial | null>(null);
  const [isReadonly, setIsReadonly] = useState<boolean>(false);
  const { organizationFinancial } = useSelectedOrganization();
  const { mutate, isLoading, error } = useOrganizationByProfileMutation();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    if (error) useErrorToast('Error while saving financial data');
  }, [error]);

  const buildActionColumn = (): TableColumn<IOrganizationFinancial> => {
    const employeeMenuItems = [
      {
        name: 'view',
        icon: EyeIcon,
        onClick: onView,
      },
    ];

    const adminMenuItems = [
      {
        name: 'view',
        icon: EyeIcon,
        onClick: onView,
      },
      {
        name: 'edit',
        icon: PencilIcon,
        onClick: onEdit,
      },
    ];

    return {
      name: '',
      cell: (row: IOrganizationFinancial) => (
        <PopoverMenu
          row={row}
          menuItems={role === UserRole.EMPLOYEE ? employeeMenuItems : adminMenuItems}
        />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onEdit = (row: IOrganizationFinancial) => {
    setSelectedReport(row);
    setIsReadonly(false);
    if (row.type === FinancialType.EXPENSE) {
      setIsExpenseReportModalOpen(true);
    } else {
      setIsIncomeReportModalOpen(true);
    }
  };

  const onView = (row: IOrganizationFinancial) => {
    setSelectedReport(row);
    setIsReadonly(true);
    if (row.type === FinancialType.EXPENSE) {
      setIsExpenseReportModalOpen(true);
    } else {
      setIsIncomeReportModalOpen(true);
    }
  };

  const onSave = (data: Partial<Expense | Income>) => {
    mutate({
      organization: {
        financial: {
          id: selectedReport?.id as number,
          data,
        },
      },
    });
    setIsIncomeReportModalOpen(false);
    setIsExpenseReportModalOpen(false);
  };

  return (
    <CardPanel title="Date Financiare">
      <>
        <div className="pt-1 pb-6">
          <p className="text-base font-normal text-gray-900">
            Te rugam sa actualizezi datele din aceasta sectiune la un interval stabilit de timp.
          </p>
        </div>
        <DataTableComponent
          columns={[...OrganizationFinancialTableHeaders, buildActionColumn()]}
          data={organizationFinancial}
          loading={isLoading}
        />
        {isExpenseReportModalOpen && (
          <ExpenseReportModal
            onClose={() => setIsExpenseReportModalOpen(false)}
            readonly={isReadonly}
            year={selectedReport?.year}
            total={selectedReport?.total}
            defaultValue={selectedReport?.data}
            onSave={onSave}
          />
        )}
        {isIncomeReportModalOpen && (
          <IncomeReportModal
            onClose={() => setIsIncomeReportModalOpen(false)}
            readonly={isReadonly}
            year={selectedReport?.year}
            total={selectedReport?.total}
            defaultValue={selectedReport?.data}
            onSave={onSave}
          />
        )}
      </>
    </CardPanel>
  );
};

export default OrganizationFinancial;

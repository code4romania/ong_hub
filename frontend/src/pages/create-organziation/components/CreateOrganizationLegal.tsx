import {
  PaperClipIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  XIcon,
} from '@heroicons/react/solid';
import React, { useState, useEffect } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { fileToURL, flatten } from '../../../common/helpers/format.helper';
import { Person } from '../../../common/interfaces/person.interface';
import ContactForm from '../../../components/Contact/Contact';
import DataTableComponent from '../../../components/data-table/DataTableComponent';
import PopoverMenu, { PopoverMenuRowType } from '../../../components/popover-menu/PopoverMenu';
import SectionHeader from '../../../components/section-header/SectionHeader';
import DeleteRowConfirmationModal from '../../organization/components/OrganizationLegal/components/DeleteRowConfirmationModal';
import DirectorModal from '../../organization/components/OrganizationLegal/components/DirectorModal';
import OtherModal from '../../organization/components/OrganizationLegal/components/OtherModal';
import { OrganizationLegalConfig } from '../../organization/components/OrganizationLegal/OrganizationLegalConfig';
import { DirectorsTableHeaders } from '../../organization/components/OrganizationLegal/table-headers/DirectorsTable.headers';
import { OthersTableHeaders } from '../../organization/components/OrganizationLegal/table-headers/OthersTable.headers';
import { Contact } from '../../organization/interfaces/Contact.interface';

const CreateOrganizationLegal = () => {
  const [isEditMode] = useState(true);
  const [organizationStatute, setOrganizationStatute] = useState<File | null>(null);
  // directors
  const [directors, setDirectors] = useState<Partial<Contact>[]>([]);
  const [directorsDeleted, setDirectorsDeleted] = useState<number[]>([]);
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState<boolean>(false);
  const [isDeleteDirectorModalOpen, setIsDeleteDirectorModalOpen] = useState<boolean>(false);
  const [selectedDirector, setSelectedDirector] = useState<Partial<Contact> | null>(null);
  // others
  const [others, setOthers] = useState<Partial<Person>[]>([]);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState<boolean>(false);
  const [isDeleteOtheModalOpen, setIsDeleteOtherModalOpen] = useState<boolean>(false);
  const [selectedOther, setSelectedOther] = useState<Partial<Person> | null>(null);
  // queries

  const [organization, setOrganization] = useOutletContext<any>();

  const navigate = useNavigate();

  // React Hook Form
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (organization && organization.legal) {
      const legalReprezentative = flatten(
        organization.legal.legalReprezentative,
        {},
        'legalReprezentative',
      );
      reset({ ...legalReprezentative });
      setOthers(organization.legal.others);
      setDirectors(organization.legal.directors);
    }
  }, [organization]);

  const buildDirectorActionColumn = (): TableColumn<Contact> => {
    const menuItems = [
      {
        name: 'edit',
        icon: PencilIcon,
        onClick: onEditDirector,
      },
      {
        name: 'Elimina date',
        icon: TrashIcon,
        onClick: onOpenDeleteDirectorModal,
        type: PopoverMenuRowType.REMOVE,
      },
    ];

    return {
      name: '',
      cell: (row: Contact) =>
        isEditMode ? <PopoverMenu row={row} menuItems={menuItems} /> : <></>,
      width: '50px',
      allowOverflow: true,
    };
  };

  const buildOtherActionColumn = (): TableColumn<Person> => {
    const menuItems = [
      {
        name: 'edit',
        icon: PencilIcon,
        onClick: onEditOther,
      },
      {
        name: 'Elimina date',
        icon: TrashIcon,
        onClick: onOpenDeleteOtherModal,
        type: PopoverMenuRowType.REMOVE,
      },
    ];

    return {
      name: '',
      cell: (row: Person) => (isEditMode ? <PopoverMenu row={row} menuItems={menuItems} /> : <></>),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onAddDirector = (contact: Partial<Contact>) => {
    setDirectors([...directors, contact]);
    setIsDirectorModalOpen(false);
  };

  const onEditDirector = (row: Contact) => {
    setSelectedDirector(row);
    setIsDirectorModalOpen(true);
  };

  const onUpdateDirector = (contact: Partial<Contact>) => {
    const filteredDirectors = directors.filter(
      (director: Partial<Contact>) =>
        !(
          director.fullName === selectedDirector?.fullName &&
          director.email === selectedDirector?.email &&
          director.phone === selectedDirector?.phone
        ),
    );
    setDirectors([...filteredDirectors, { ...selectedDirector, ...contact }]);
    setSelectedDirector(null);
    setIsDirectorModalOpen(false);
  };

  const onOpenDeleteDirectorModal = (row: Contact) => {
    setSelectedDirector(row);
    setIsDeleteDirectorModalOpen(true);
  };

  const onDeleteDirector = () => {
    if (selectedDirector?.id) {
      setDirectorsDeleted([...directorsDeleted, selectedDirector.id]);
    }
    const filteredDirectors = directors.filter(
      (director: Partial<Contact>) =>
        !(
          director.fullName === selectedDirector?.fullName &&
          director.email === selectedDirector?.email &&
          director.phone === selectedDirector?.phone
        ),
    );
    setDirectors(filteredDirectors);
    setSelectedDirector(null);
    setIsDeleteDirectorModalOpen(false);
  };

  const onEditOther = (row: Person) => {
    setSelectedOther(row);
    setIsOtherModalOpen(true);
  };

  const onOpenDeleteOtherModal = (row: Person) => {
    setSelectedOther(row);
    setIsDeleteOtherModalOpen(true);
  };

  const onAddOther = (other: Partial<Person>) => {
    setOthers([...others, other]);
    setIsOtherModalOpen(false);
  };

  const onUpdateOther = (person: Partial<Person>) => {
    const filteredOthers = others.filter(
      (other: Partial<Person>) =>
        !(other.fullName === selectedOther?.fullName && other.role === selectedOther?.role),
    );
    setOthers([...filteredOthers, person]);
    setSelectedOther(null);
    setIsOtherModalOpen(false);
  };

  const onDeleteOther = () => {
    const filteredOthers = others.filter(
      (other: Partial<Person>) =>
        !(other.fullName === selectedOther?.fullName && other.role === selectedOther?.role),
    );
    setOthers(filteredOthers);
    setSelectedOther(null);
    setIsDeleteOtherModalOpen(false);
  };

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setOrganizationStatute(file);
    } else {
      event.target.value = '';
    }
  };

  const onRemoveOrganizationStatute = (e: any) => {
    e.preventDefault();
    setOrganizationStatute(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = (data: any) => {
    if (directors.length < 3) {
      return;
    }

    const legalReprezentative = {
      id: data.legalReprezentative_id,
      fullName: data.legalReprezentative_fullName,
      phone: data.legalReprezentative_phone,
      email: data.legalReprezentative_email,
    };

    setOrganization((org: any) => ({
      ...org,
      legal: { legalReprezentative, directors, directorsDeleted, others, organizationStatute },
    }));
  };

  const onUploadFile = () => {
    console.log('on upload file');
  };

  return (
    <div className="w-full bg-white shadow rounded-lg">
      <div className="p-5 sm:p-10">
        <div className="flex flex-col gap-16 w-full divide-y divide-gray-200 divide xl:w-1/2">
          <section className="flex flex-col gap-6 w-full">
            <SectionHeader
              title="Reprezentant Legal al organizatiei"
              subTitle="This information will be displayed publicly so be careful what you share"
            />
            <form className="space-y-8">
              <ContactForm
                className="flex-row gap-x-6"
                control={control}
                errors={errors}
                readonly={!isEditMode}
                configs={[
                  OrganizationLegalConfig.legal_reprezentative_name,
                  OrganizationLegalConfig.legal_reprezentative_email,
                  OrganizationLegalConfig.legal_reprezentative_phone,
                ]}
              />
            </form>
          </section>
          <section className="flex flex-col gap-6 w-full pt-8">
            <SectionHeader
              title="Consiliul director al organizatiei"
              subTitle="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, autem. Eum voluptatem accusantium officia porro asperiores."
            />
            {isEditMode && directors.length < 3 && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Este obligatoriu sa adaugi cel putin 3 membri ai consiliului director pentru a
                      continua
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <DataTableComponent
              columns={[...DirectorsTableHeaders, buildDirectorActionColumn()]}
              data={directors}
            />
            {isEditMode && (
              <button
                type="button"
                className="add-button max-w-[12rem]"
                onClick={setIsDirectorModalOpen.bind(null, true)}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Adauga un membru
              </button>
            )}
          </section>
          <section className="flex flex-col gap-6 w-full pt-8">
            <SectionHeader
              title="Alte persoane relevante in organizatie"
              subTitle="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, autem. Eum voluptatem accusantium officia porro asperiores."
            />
            <DataTableComponent
              columns={[...OthersTableHeaders, buildOtherActionColumn()]}
              data={others}
            />
            {isEditMode && (
              <button
                type="button"
                className="add-button max-w-[12rem]"
                onClick={setIsOtherModalOpen.bind(null, true)}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Adauga un membru
              </button>
            )}
          </section>
          <section className="flex flex-col gap-6 w-full pt-8">
            <SectionHeader
              title="Statutul organizatiei"
              subTitle="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, autem. Eum voluptatem accusantium officia porro asperiores."
            />
            <div className="flex flex-col gap-y-4">
              <h3>Document</h3>
              {isEditMode && organizationStatute === null && (
                <>
                  <label
                    htmlFor="uploadPhoto"
                    className="w-32 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Incarca fisier
                  </label>
                  <input
                    className="h-0 w-0"
                    name="uploadPhoto"
                    id="uploadPhoto"
                    type="file"
                    onChange={onChangeFile}
                  />
                </>
              )}
              {organizationStatute && (
                <a
                  href={fileToURL(organizationStatute) || ''}
                  download
                  className="text-indigo-600 font-medium text-sm flex items-center"
                >
                  <PaperClipIcon className=" w-4 h-4 text-gray-600" />
                  Statut_Organizatie
                  {isEditMode && (
                    <XIcon
                      className="ml-2 w-4 h-4 text-gray-600"
                      onClick={onRemoveOrganizationStatute}
                    />
                  )}
                </a>
              )}
            </div>
          </section>
          {isDirectorModalOpen && (
            <DirectorModal
              isEdit={selectedDirector !== null}
              defaultValue={selectedDirector || {}}
              onSave={selectedDirector !== null ? onUpdateDirector : onAddDirector}
              onClose={() => {
                setIsDirectorModalOpen(false);
                setSelectedDirector(null);
              }}
            />
          )}
          {isOtherModalOpen && (
            <OtherModal
              isEdit={selectedOther !== null}
              defaultValue={selectedOther || {}}
              onSave={selectedOther !== null ? onUpdateOther : onAddOther}
              onClose={() => {
                setIsOtherModalOpen(false);
                setSelectedOther(null);
              }}
            />
          )}
          {isDeleteDirectorModalOpen && (
            <DeleteRowConfirmationModal
              onClose={() => {
                setIsDeleteDirectorModalOpen(false);
                setSelectedDirector(null);
              }}
              onConfirm={onDeleteDirector}
            />
          )}
          {isDeleteOtheModalOpen && (
            <DeleteRowConfirmationModal
              onClose={() => {
                setIsDeleteOtherModalOpen(false);
                setSelectedOther(null);
              }}
              onConfirm={onDeleteOther}
            />
          )}
        </div>
        <div className="pt-5 sm:pt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-black hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleSubmit(handleSave)}
          >
            Trimite
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => navigate('/new/activity')}
          >
            Inapoi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationLegal;

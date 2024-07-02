/* eslint-disable @typescript-eslint/no-explicit-any */
import { PencilIcon } from '@heroicons/react/24/solid';
import React, { useContext, useEffect, useState } from 'react';
import { classNames } from '../../../../common/helpers/tailwind.helper';
import ChipSelection from '../../../../components/chip-selection/ChipSelection';
import { OrganizationActivityConfig, OrganizationAreaEnum } from './OrganizationActivityConfig';
import { Controller, useForm } from 'react-hook-form';
import RadioGroup from '../../../../components/RadioGroup/RadioGroup';
import ServerSelect from '../../../../components/server-select/ServerSelect';
import { getCities } from '../../../../services/nomenclature/Nomenclatures.service';
import { useNomenclature, useSelectedOrganization } from '../../../../store/selectors';
import {
  useCoalitionsQuery,
  useDomainsQuery,
  useFederationsQuery,
  useRegionsQuery,
} from '../../../../services/nomenclature/Nomenclature.queries';
import InputField from '../../../../components/InputField/InputField';
import MultiSelect from '../../../../components/multi-select/MultiSelect';
import {
  ISelectData,
  mapCitiesToSelect,
  mapGroupsToSelect,
  mapNameToSelect,
  mapSelectToValue,
  mapToId,
  str2bool,
} from '../../../../common/helpers/format.helper';
import { useErrorToast } from '../../../../common/hooks/useToast';
import { AuthContext } from '../../../../contexts/AuthContext';
import { UserRole } from '../../../users/enums/UserRole.enum';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseOrganizationActivityDataToPayload } from '../../../../services/organization/Organization.helper';
import { OrganizationContext } from '../../interfaces/OrganizationContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import AddCoFedModal from '../../../../components/add-fed-co-modal/AddFedCoModal';

const OrganizationActivity = () => {
  const { organization, organizationActivity } = useSelectedOrganization();
  const { domains, regions, federations, coalitions } = useNomenclature();

  const { updateOrganization } = useOutletContext<OrganizationContext>();

  const [isAddFederationModalOpen, setIsAddFederationModalOpen] = useState<boolean>(false);
  const [isAddCoalitionModalOpen, setIsAddCoalitionModalOpen] = useState<boolean>(false);

  const [newCoalitions, setNewCoalitions] = useState<ISelectData[]>([]);
  const [newFederations, setNewFederations] = useState<ISelectData[]>([]);

  const { role } = useContext(AuthContext);

  // React i18n
  const { t } = useTranslation(['activity', 'organization', 'common']);

  const [readonly, setReadonly] = useState(true);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    resetField,
    watch,
    getValues,
    setValue,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  //queries
  useDomainsQuery();
  useRegionsQuery();
  useFederationsQuery();
  useCoalitionsQuery();

  // watchers
  const area = watch('area');
  const isPartOfFederation = watch('isPartOfFederation');
  const isPartOfCoalition = watch('isPartOfCoalition');
  const isPartOfInternationalOrganization = watch('isPartOfInternationalOrganization');
  const hasBranches = watch('hasBranches');

  // submit
  const handleSave = (data: any) => {
    setReadonly(true);

    // map existing coalitions
    const coalitions = data.coalitions
      ? [...data.coalitions.filter((val: any) => !val.isNew).map(mapSelectToValue)]
      : [];
    const federations = data.federations
      ? [...data.federations.filter((val: any) => !val.isNew).map(mapSelectToValue)]
      : [];

    // map new federations and coalitions
    const newFederations = data.federations
      ? [...data.federations.filter((val: any) => val.isNew).map((val: any) => val.value)]
      : [];

    const newCoalitions = data.coalitions
      ? [...data.coalitions.filter((val: any) => val.isNew).map((val: any) => val.value)]
      : [];

    // data mappings for backend payload
    const activity = {
      ...data,
      branches: data.branches ? [...data.branches.map(mapSelectToValue)] : [],
      cities: data.cities ? [...data.cities.map(mapSelectToValue)] : [],
      regions: data.regions ? [...data.regions.map(mapSelectToValue)] : [],
      coalitions,
      federations,
      newFederations,
      newCoalitions,
    };

    updateOrganization(
      {
        id: organization?.id,
        organization: { activity: parseOrganizationActivityDataToPayload(activity) },
      },
      {
        onError: () => {
          useErrorToast(t('save_error', { ns: 'organization' }));
        },
      },
    );
  };

  // load initial values
  useEffect(() => {
    if (organizationActivity) {
      const domains = organizationActivity.domains?.map(mapToId);
      const cities = organizationActivity.cities?.length
        ? [...organizationActivity.cities.map(mapCitiesToSelect)]
        : [];
      const branches = organizationActivity.branches?.length
        ? [...organizationActivity.branches.map(mapCitiesToSelect)]
        : [];
      const regions = organizationActivity.regions?.length
        ? [...organizationActivity.regions.map(mapNameToSelect)]
        : [];
      const federations = organizationActivity.federations?.length
        ? [...organizationActivity.federations.map(mapGroupsToSelect)]
        : [];
      const coalitions = organizationActivity.coalitions?.length
        ? [...organizationActivity.coalitions.map(mapGroupsToSelect)]
        : [];

      reset({
        ...organizationActivity,
        isPartOfFederation: organizationActivity.isPartOfFederation.toString(),
        isPartOfCoalition: organizationActivity.isPartOfCoalition.toString(),
        isPartOfInternationalOrganization:
          organizationActivity.isPartOfInternationalOrganization.toString(),
        isSocialServiceViable: organizationActivity.isSocialServiceViable.toString(),
        offersGrants: organizationActivity.offersGrants.toString(),
        hasBranches: organizationActivity.hasBranches.toString(),
        isPublicIntrestOrganization: organizationActivity.isPublicIntrestOrganization.toString(),
        domains,
        cities,
        branches,
        regions,
        federations,
        coalitions,
      });
    }
  }, [organizationActivity]);

  useEffect(() => {
    // This is the only conditional form field who has input validation that's why we handle it differently
    // TODO: Improve this
    if (isPartOfInternationalOrganization && !str2bool(isPartOfInternationalOrganization)) {
      // Remove international organization data from form
      resetField(OrganizationActivityConfig.internationalOrganizationName.key, {
        defaultValue: '',
      });
    }
  }, [isPartOfInternationalOrganization]);

  // edit mode
  const startEdit = () => {
    setReadonly(false);
  };

  const loadOptionsCitiesSerch = async (searchWord: string) => {
    return getCities(searchWord).then((res: any[]) => res.map(mapCitiesToSelect));
  };

  const onAddNewFederation = ({ name }: { name: string }): void => {
    // generate new value
    const newValue = { value: name, label: name, isNew: true };
    // add the values to the additional federation array
    setNewFederations([...newFederations, newValue]);
    // close modal
    setIsAddFederationModalOpen(false);
    // handle form
    const form = getValues();
    const formValues = form.federations || [];
    resetField('federations');
    setValue('federations', [...formValues, newValue]);
  };

  const onAddNewCoalition = ({ name }: { name: string }): void => {
    // generate new value
    const newValue = { value: name, label: name, isNew: true };
    // add the values to the additional coalitions array
    setNewCoalitions([...newCoalitions, newValue]);
    // close modal
    setIsAddCoalitionModalOpen(false);
    // handle form
    const form = getValues();
    const formValues = form.coalitions || [];
    resetField('coalitions');
    setValue('coalitions', [...formValues, newValue]);
  };

  return (
    <div className="w-full bg-white shadow rounded-lg">
      <div className="py-5 lg:px-10 px-5 flex justify-between items-center">
        <span className="font-titilliumBold sm:text-lg lg:text-xl text-md text-gray-800">
          {t('title')}
        </span>

        {role !== UserRole.EMPLOYEE && (
          <button
            aria-label={readonly ? t('edit', { ns: 'common' }) : t('save', { ns: 'common' })}
            type="button"
            className={classNames(
              readonly ? 'edit-button' : 'save-button',
              'sm:text-sm lg:text-base text-xs',
            )}
            onClick={readonly ? startEdit : handleSubmit(handleSave)}
          >
            <PencilIcon className="-ml-1 mr-2 sm:h-5 sm:w-5 h-4 w-4" aria-hidden="true" />
            {readonly ? t('edit', { ns: 'common' }) : t('save', { ns: 'common' })}
          </button>
        )}
      </div>

      <div className="w-full border-t border-gray-300" />
      <div className="p-5 sm:p-10 flex flex-col gap-4 divide-y divide-gray-200">
        <div className="flex flex-col gap-4">
          <div className="pb-5">
            <span className="sm:text-lg lg:text-xl text-md font-bold text-gray-900">
              {t('domains')}
            </span>
            {!readonly && (
              <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
                {t('domains_information')}
              </p>
            )}
          </div>
          <Controller
            key={OrganizationActivityConfig.domains.key}
            name={OrganizationActivityConfig.domains.key}
            rules={OrganizationActivityConfig.domains.rules}
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <ChipSelection
                  {...OrganizationActivityConfig.domains.config}
                  values={[...domains]}
                  defaultItems={value}
                  error={errors[OrganizationActivityConfig.domains.key]?.message?.toString()}
                  onItemsChange={onChange}
                  readonly={readonly}
                ></ChipSelection>
              );
            }}
          />
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.area.key]}
            config={OrganizationActivityConfig.area}
          />
          {area == OrganizationAreaEnum.LOCAL && (
            <Controller
              key={OrganizationActivityConfig.cities.key}
              name={OrganizationActivityConfig.cities.key}
              rules={OrganizationActivityConfig.cities.rules}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <ServerSelect
                    value={value}
                    label={OrganizationActivityConfig.cities.label}
                    isMulti={true}
                    isClearable={false}
                    placeholder={''}
                    helperText={OrganizationActivityConfig.cities.helperText}
                    error={errors[OrganizationActivityConfig.cities.key]?.message?.toString()}
                    onChange={onChange}
                    loadOptions={loadOptionsCitiesSerch}
                    readonly={readonly}
                  />
                );
              }}
            />
          )}
          {area == OrganizationAreaEnum.REGIONAL && (
            <Controller
              key={OrganizationActivityConfig.regions.key}
              name={OrganizationActivityConfig.regions.key}
              rules={OrganizationActivityConfig.regions.rules}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <MultiSelect
                    value={value}
                    label={OrganizationActivityConfig.regions.config.label}
                    isClearable={false}
                    helperText={OrganizationActivityConfig.regions.config.helperText}
                    error={errors[OrganizationActivityConfig.regions.key]?.message?.toString()}
                    onChange={onChange}
                    options={[...regions.map(mapNameToSelect)]}
                    readonly={readonly}
                  />
                );
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 pt-4">
          <div className="pb-5">
            <span className="sm:text-lg lg:text-xl text-md font-bold text-gray-900">
              {t('fed_coal')}
            </span>
            {!readonly && (
              <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
                {t('fed_coal_information')}
              </p>
            )}
          </div>
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.isPartOfFederation.key]}
            config={OrganizationActivityConfig.isPartOfFederation}
          />
          {(isPartOfFederation === 'true' || isPartOfFederation === true) && (
            <Controller
              key={OrganizationActivityConfig.federations.key}
              name={OrganizationActivityConfig.federations.key}
              rules={OrganizationActivityConfig.federations.rules}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <div
                    className={classNames(
                      'flex w-full gap-2',
                      errors[OrganizationActivityConfig.federations.key]?.message
                        ? 'items-center'
                        : 'items-end',
                    )}
                  >
                    <MultiSelect
                      value={value}
                      label={OrganizationActivityConfig.federations.config.label}
                      isClearable={false}
                      helperText={OrganizationActivityConfig.federations.config.helperText}
                      error={errors[
                        OrganizationActivityConfig.federations.key
                      ]?.message?.toString()}
                      onChange={onChange}
                      options={[...federations.map(mapGroupsToSelect), ...newFederations]}
                      readonly={readonly}
                    />
                    {!readonly && (
                      <button
                        className="add-button"
                        onClick={setIsAddFederationModalOpen.bind(null, true)}
                      >
                        <PlusIcon className="w-5 h-5 fill-gray-500 " />
                      </button>
                    )}
                  </div>
                );
              }}
            />
          )}
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.isPartOfCoalition.key]}
            config={OrganizationActivityConfig.isPartOfCoalition}
          />
          {(isPartOfCoalition == 'true' || isPartOfCoalition === true) && (
            <Controller
              key={OrganizationActivityConfig.coalitions.key}
              name={OrganizationActivityConfig.coalitions.key}
              rules={OrganizationActivityConfig.coalitions.rules}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <div
                    className={classNames(
                      'flex w-full gap-2',
                      errors[OrganizationActivityConfig.coalitions.key]?.message
                        ? 'items-center'
                        : 'items-end',
                    )}
                  >
                    <MultiSelect
                      value={value}
                      label={OrganizationActivityConfig.coalitions.config.label}
                      isClearable={false}
                      helperText={OrganizationActivityConfig.coalitions.config.helperText}
                      error={errors[OrganizationActivityConfig.coalitions.key]?.message?.toString()}
                      onChange={onChange}
                      options={[...coalitions.map(mapGroupsToSelect), ...newCoalitions]}
                      readonly={readonly}
                    />
                    {!readonly && (
                      <button
                        className="add-button h-10"
                        onClick={setIsAddCoalitionModalOpen.bind(null, true)}
                      >
                        <PlusIcon className="w-5 h-5 fill-gray-500 " />
                      </button>
                    )}
                  </div>
                );
              }}
            />
          )}

          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.isPartOfInternationalOrganization.key]}
            config={OrganizationActivityConfig.isPartOfInternationalOrganization}
          />

          {(isPartOfInternationalOrganization == 'true' ||
            isPartOfInternationalOrganization === true) && (
              <Controller
                key={OrganizationActivityConfig.internationalOrganizationName.key}
                name={OrganizationActivityConfig.internationalOrganizationName.key}
                rules={OrganizationActivityConfig.internationalOrganizationName.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationActivityConfig.internationalOrganizationName.config,
                        name: OrganizationActivityConfig.internationalOrganizationName.key,
                        error:
                          errors[OrganizationActivityConfig.internationalOrganizationName.key]
                            ?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'organization-activity__name',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
            )}
        </div>
        <div className="flex flex-col gap-4 pt-4">
          <div className="pb-5">
            <span className="sm:text-lg lg:text-xl text-md font-bold text-gray-900">
              {t('branches')}
            </span>
            {!readonly && (
              <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
                {t('branches_information')}
              </p>
            )}
          </div>
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.hasBranches.key]}
            config={OrganizationActivityConfig.hasBranches}
          />
          {(hasBranches === 'true' || hasBranches === true) && (
            <Controller
              key={OrganizationActivityConfig.branches.key}
              name={OrganizationActivityConfig.branches.key}
              rules={OrganizationActivityConfig.branches.rules}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <ServerSelect
                    value={value}
                    label={OrganizationActivityConfig.branches.label}
                    isMulti={true}
                    isClearable={false}
                    placeholder={''}
                    helperText={OrganizationActivityConfig.branches.helperText}
                    error={errors[OrganizationActivityConfig.branches.key]?.message?.toString()}
                    onChange={onChange}
                    loadOptions={loadOptionsCitiesSerch}
                    readonly={readonly}
                  />
                );
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 pt-4">
          <div className="pb-5">
            <span className="sm:text-lg lg:text-xl text-md font-bold text-gray-900">
              {t('other')}
            </span>
            {!readonly && (
              <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
                {t('other_information')}
              </p>
            )}
          </div>
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.isSocialServiceViable.key]}
            config={OrganizationActivityConfig.isSocialServiceViable}
          />
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.offersGrants.key]}
            config={OrganizationActivityConfig.offersGrants}
          />
          <RadioGroup
            control={control}
            readonly={readonly}
            errors={errors[OrganizationActivityConfig.isPublicIntrestOrganization.key]}
            config={OrganizationActivityConfig.isPublicIntrestOrganization}
          />
        </div>
        {isAddFederationModalOpen && (
          <AddCoFedModal
            title={t('config.add_federation_modal.title')}
            description={t('config.add_federation_modal.description')}
            onClose={setIsAddFederationModalOpen.bind(null, false)}
            onSubmit={onAddNewFederation}
          />
        )}
        {isAddCoalitionModalOpen && (
          <AddCoFedModal
            title={t('config.add_coalition_modal.title')}
            description={t('config.add_coalition_modal.description')}
            onClose={setIsAddCoalitionModalOpen.bind(null, false)}
            onSubmit={onAddNewCoalition}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationActivity;

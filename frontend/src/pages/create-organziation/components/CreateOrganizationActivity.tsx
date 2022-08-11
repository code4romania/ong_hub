import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  str2bool,
  mapCitiesToSelect,
  mapNameToSelect,
  mapGroupsToSelect,
} from '../../../common/helpers/format.helper';
import ChipSelection from '../../../components/chip-selection/ChipSelection';
import InputField from '../../../components/InputField/InputField';
import MultiSelect from '../../../components/multi-select/MultiSelect';
import RadioGroup from '../../../components/RadioGroup/RadioGroup';
import ServerSelect from '../../../components/server-select/ServerSelect';
import {
  useDomainsQuery,
  useRegionsQuery,
  useFederationsQuery,
  useCoalitionsQuery,
} from '../../../services/nomenclature/Nomenclature.queries';
import { getCities } from '../../../services/nomenclature/Nomenclatures.service';
import { useNomenclature } from '../../../store/selectors';
import {
  OrganizationActivityConfig,
  OrganizationAreaEnum,
} from '../../organization/components/OrganizationActivity/OrganizationActivityConfig';
import { CREATE_FLOW_URL } from '../constants/CreateOrganization.constant';

const CreateOrganizationActivity = () => {
  const { domains, regions, federations, coalitions } = useNomenclature();

  const [organization, setOrganization] = useOutletContext<any>();

  const navigate = useNavigate();

  const [readonly] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
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
    // data mappings for backend payload
    const activity = {
      ...data,
      isPartOfFederation: str2bool(data.isPartOfFederation),
      isPartOfCoalition: str2bool(data.isPartOfCoalition),
      isPartOfInternationalOrganization: str2bool(data.isPartOfInternationalOrganization),
      isSocialServiceViable: str2bool(data.isSocialServiceViable),
      offersGrants: str2bool(data.offersGrants),
      hasBranches: str2bool(data.hasBranches),
      isPublicIntrestOrganization: str2bool(data.isPublicIntrestOrganization),
    };

    setOrganization((org: any) => ({ ...org, activity }));

    navigate(`/${CREATE_FLOW_URL.BASE}/${CREATE_FLOW_URL.LEGAL}`);
  };

  // load initial values
  useEffect(() => {
    if (organization && organization.activity) {
      reset({
        ...organization.activity,
      });
    }
  }, [organization]);

  const loadOptionsCitiesSerch = async (searchWord: string) => {
    return getCities(searchWord).then((res: any[]) => res.map(mapCitiesToSelect));
  };

  return (
    <div className="w-full bg-white shadow rounded-lg">
      <div className="w-full" />
      <div className="p-5 sm:p-10 flex flex-col gap-4 divide-y divide-gray-200">
        <div className="flex flex-col gap-4 ">
          <div>
            <span className="text-xl font-bold text-gray-900">Domenii si acoperire geografica</span>
            <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
              This information will be displayed publicly so be careful what you share.
            </p>
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
          <div>
            <span className="text-xl font-bold text-gray-900">Federatii si coalitii</span>
            <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
              This information will be displayed publicly so be careful what you share.
            </p>
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
                  <MultiSelect
                    value={value}
                    label={OrganizationActivityConfig.federations.config.label}
                    isClearable={false}
                    helperText={OrganizationActivityConfig.federations.config.helperText}
                    error={errors[OrganizationActivityConfig.federations.key]?.message?.toString()}
                    onChange={onChange}
                    options={[...federations.map(mapGroupsToSelect)]}
                    readonly={readonly}
                  />
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
                  <MultiSelect
                    value={value}
                    label={OrganizationActivityConfig.coalitions.config.label}
                    isClearable={false}
                    helperText={OrganizationActivityConfig.coalitions.config.helperText}
                    error={errors[OrganizationActivityConfig.coalitions.key]?.message?.toString()}
                    onChange={onChange}
                    options={[...coalitions.map(mapGroupsToSelect)]}
                    readonly={readonly}
                  />
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
                    }}
                    readonly={readonly}
                  />
                );
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 pt-4">
          <div>
            <span className="text-xl font-bold text-gray-900">Filiale si sucursale</span>
            <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
              This information will be displayed publicly so be careful what you share.
            </p>
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
          <div>
            <span className="text-xl font-bold text-gray-900">Alte informatii</span>
            <p className="mt-1 mb-4 text-sm text-gray-500 font-normal" id="email-description">
              This information will be displayed publicly so be careful what you share.
            </p>
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
        <div className="pt-5 sm:pt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-black hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleSubmit(handleSave)}
          >
            Mai departe
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => navigate(`/${CREATE_FLOW_URL.BASE}/${CREATE_FLOW_URL.GENERAL}`)}
          >
            Inapoi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationActivity;

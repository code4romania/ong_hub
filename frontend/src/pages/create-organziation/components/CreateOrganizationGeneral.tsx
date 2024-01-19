import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FILE_TYPES_ACCEPT } from '../../../common/constants/file.constants';
import { InternalErrors } from '../../../common/errors/internal-errors';
import { fileToURL } from '../../../common/helpers/format.helper';
import { updateActiveStepIndexInLocalStorage } from '../../../common/helpers/utils.helper';
import { useInitStep } from '../../../common/hooks/useInitStep';
import InputField from '../../../components/InputField/InputField';
import RadioGroup from '../../../components/RadioGroup/RadioGroup';
import Select from '../../../components/Select/Select';
import Textarea from '../../../components/Textarea/Textarea';
import ErrorsBanner from '../../../components/errors-banner/ErrorsBanner';
import SectionHeader from '../../../components/section-header/SectionHeader';
import { useCitiesQuery } from '../../../services/nomenclature/Nomenclature.queries';
import { useCreateOrganizationRequestValidationMutation } from '../../../services/request/Request.queries';
import { useNomenclature } from '../../../store/selectors';
import { OrganizationGeneralConfig } from '../../organization/components/OrganizationGeneral/OrganizationGeneralConfig';
import {
  CREATE_FLOW_URL,
  CREATE_LOCAL_STORAGE_KEY,
} from '../constants/CreateOrganization.constant';
import GenericFormErrorMessage from '../../../components/generic-form-error-message/GenericFormErrorMessage';

const CreateOrganizationGeneral = () => {
  const [readonly] = useState(false);
  const [county, setCounty] = useState<any>();
  const [city, setCity] = useState<any>();
  const [organizationCounty, setOrganizationCounty] = useState<any>();
  const [organizationCity, setOrganizationCity] = useState<any>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { cities, counties } = useNomenclature();

  const [organization, setOrganization, logo, setLogo, , , activeStepIndex, setActiveStepIndex] =
    useOutletContext<any>();

  useInitStep(setOrganization);

  const { t } = useTranslation(['general', 'common']);

  // queries
  useCitiesQuery(county?.id);
  const { mutateAsync: validationMutate } = useCreateOrganizationRequestValidationMutation();

  const navigate = useNavigate();

  // React Hook Form
  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitted, errors, isValidating },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  //Store form data in local storage
  const watchAllFields = watch();
  const watchHasSameAddress = watch('hasSameAddress');
  const watchOrganizationAddress = watch('organizationAddress');
  const watchOrganizationCity = watch('organizationCity');
  const watchOrganizationCounty = watch('organizationCounty');
  const watchAddress = watch('address');
  const watchCity = watch('city');
  const watchCounty = watch('county');

  useEffect(() => {
    if (activeStepIndex > 1) {
      return;
    }
    const general = getValues();
    //Prevent filling localStorage with undefined data and prevent filling it with erros
    const hasAdminValues = !!Object.values(general).filter((item) => item !== undefined).length;
    const hasFieldErrors = !!Object.keys(errors).length;

    //Using isValidating because RHF triggers 2 renders and update local storage with invalid data
    if (hasAdminValues && !isValidating && !hasFieldErrors) {
      localStorage.setItem(CREATE_LOCAL_STORAGE_KEY, JSON.stringify({ ...organization, general }));
    }
  }, [watchAllFields]);

  // In case we check hasSameAddress we update the form with the data from the social address
  useEffect(() => {
    if (watchHasSameAddress) {
      const { city, county, address } = getValues();
      setValue('organizationAddress', address);
      setValue('organizationCity', city);
      setValue('organizationCounty', county);
    }
  }, [watchHasSameAddress]);

  // in case one of these is updated we reset the check
  useEffect(() => {
    const { city, county, address } = getValues();
    if (
      city?.id !== watchOrganizationCity?.id ||
      county?.id !== watchOrganizationCounty?.id ||
      address !== watchOrganizationAddress
    ) {
      setValue('hasSameAddress', false);
    }
  }, [
    watchOrganizationAddress,
    watchOrganizationCity,
    watchOrganizationCounty,
    watchAddress,
    watchCounty,
    watchCity,
  ]);

  //Init for fields
  useEffect(() => {
    if (organization && organization.general) {
      reset(organization.general);
      setCounty(organization.general.county);
      setCity(organization.general.city);
      setOrganizationCounty(organization.general.organizationCounty);
      setOrganizationCity(organization.general.organizationCity);
    }
  }, [organization]);

  useEffect(() => {
    if (county && !readonly && !city) {
      setValue('city', null);
    }

    if (organizationCity && !readonly && !organizationCity) {
      setValue('organizationCity', null);
    }
  }, [cities]);

  useEffect(() => {
    if (county && city && city.county.id !== county.id) {
      setCity(null);
    }
  }, [county]);

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setLogo(event.target.files[0]);
      event.target.value = '';
    } else {
      event.target.value = '';
    }
  };

  const handleSave = async (data: any) => {
    try {
      const organizationGeneral = {
        ...data,
      };

      await validationMutate({ organization: { general: organizationGeneral } }); // Throws errors

      setOrganization((org: any) => ({ ...org, general: organizationGeneral }));
      localStorage.setItem(
        CREATE_LOCAL_STORAGE_KEY,
        JSON.stringify({ ...organization, general: organizationGeneral }),
      );
      navigate(`/${CREATE_FLOW_URL.BASE}/${CREATE_FLOW_URL.ACTIVITY}`);

      updateActiveStepIndexInLocalStorage(activeStepIndex, 3, setActiveStepIndex);
    } catch (err: any) {
      const response = err.response?.data?.message;
      if (Array.isArray(response)) {
        const mappedErrors = response.map((error) =>
          InternalErrors.createOrganizationErrors.getError(error?.response?.errorCode),
        );
        setValidationErrors(mappedErrors);
      }
    }
  };

  return (
    <div className="w-full bg-white shadow rounded-lg">
      <div className="w-full " />
      <div className="p-5 sm:p-10 flex flex-col">
        <div className="flex flex-col gap-4 w-full">
          <form className="space-y-12 xl:w-1/3 divide-y divide-gray-200 divide-">
            <div className="flex flex-col gap-4">
              <SectionHeader
                title={t('sections.official_data.title')}
                subTitle={t('sections.official_data.subtitle')}
              />
              <Controller
                key={OrganizationGeneralConfig.name.key}
                name={OrganizationGeneralConfig.name.key}
                rules={OrganizationGeneralConfig.name.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.name.config,
                        name: OrganizationGeneralConfig.name.key,
                        error: errors[OrganizationGeneralConfig.name.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-name',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <RadioGroup
                control={control}
                readonly={readonly}
                errors={errors[OrganizationGeneralConfig.type.key]}
                config={OrganizationGeneralConfig.type}
                id="create-organization-general__type"
              />
              <Controller
                key={OrganizationGeneralConfig.yearCreated.key}
                name={OrganizationGeneralConfig.yearCreated.key}
                rules={OrganizationGeneralConfig.yearCreated.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select
                      config={{
                        id: 'create-organization-general__year-created',
                        ...OrganizationGeneralConfig.yearCreated.config,
                      }}
                      error={errors[OrganizationGeneralConfig.yearCreated.key]?.message}
                      selected={value}
                      onChange={onChange}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.cui.key}
                name={OrganizationGeneralConfig.cui.key}
                rules={OrganizationGeneralConfig.cui.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.cui.config,
                        name: OrganizationGeneralConfig.cui.key,
                        error: errors[OrganizationGeneralConfig.cui.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-cui',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.rafNumber.key}
                name={OrganizationGeneralConfig.rafNumber.key}
                rules={OrganizationGeneralConfig.rafNumber.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.rafNumber.config,
                        name: OrganizationGeneralConfig.rafNumber.key,
                        error: errors[OrganizationGeneralConfig.rafNumber.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-raf',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.address.key}
                name={OrganizationGeneralConfig.address.key}
                rules={OrganizationGeneralConfig.address.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.address.config,
                        name: OrganizationGeneralConfig.address.key,
                        error: errors[OrganizationGeneralConfig.address.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-address',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <div className="flex gap-4">
                <Controller
                  key={OrganizationGeneralConfig.county.key}
                  name={OrganizationGeneralConfig.county.key}
                  rules={OrganizationGeneralConfig.county.rules}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Select
                        config={{
                          id: 'create-organization-general__county',
                          ...OrganizationGeneralConfig.county.config,
                          collection: counties,
                          displayedAttribute: 'name',
                        }}
                        error={errors[OrganizationGeneralConfig.county.key]?.message}
                        selected={value}
                        onChange={(e: any) => {
                          onChange(e);
                          setCounty(e);
                        }}
                        readonly={readonly}
                      />
                    );
                  }}
                />
                <Controller
                  key={OrganizationGeneralConfig.city.key}
                  name={OrganizationGeneralConfig.city.key}
                  rules={OrganizationGeneralConfig.city.rules}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Select
                        config={{
                          id: 'create-organization-general__city',
                          ...OrganizationGeneralConfig.city.config,
                          collection: cities || [],
                          displayedAttribute: 'name',
                        }}
                        error={errors[OrganizationGeneralConfig.city.key]?.message}
                        selected={value}
                        onChange={onChange}
                        readonly={readonly}
                      />
                    );
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-8">
              <SectionHeader
                title={t('sections.presentational_data.title')}
                subTitle={t('sections.presentational_data.subtitle')}
              />
              <Controller
                key={OrganizationGeneralConfig.alias.key}
                name={OrganizationGeneralConfig.alias.key}
                rules={OrganizationGeneralConfig.alias.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.alias.config,
                        name: OrganizationGeneralConfig.alias.key,
                        error: errors[OrganizationGeneralConfig.alias.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-alias',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />

              {/*  Logo */}
              <div className="sm:col-span-6 gap-4 flex flex-col">
                <label
                  htmlFor="photo"
                  className="block sm:text-sm lg:text-base text-xs font-normal text-gray-700"
                >
                  {t('logo.name')}
                </label>
                <div className="mt-1 flex items-center">
                  <span className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                    {!logo ? (
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <img
                        alt="Logo"
                        src={fileToURL(logo) || ''}
                        className="h-20 w-80 object-cover"
                      />
                    )}
                  </span>
                  {!readonly && (
                    <>
                      <label
                        htmlFor="create-organization-general__logo-upload"
                        className="cursor-pointer ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {t('logo.upload')}
                      </label>
                      <input
                        className="h-0 w-0"
                        name="uploadPhoto"
                        id="create-organization-general__logo-upload"
                        type="file"
                        accept={FILE_TYPES_ACCEPT.LOGO}
                        onChange={onChangeFile}
                      />
                    </>
                  )}
                </div>
                {!readonly && (
                  <p className="mt-1 text-sm text-gray-500 font-normal" id="email-description">
                    {t('logo.description')}
                  </p>
                )}
              </div>
              {/* End Logo */}
              <Controller
                key={OrganizationGeneralConfig.shortDescription.key}
                name={OrganizationGeneralConfig.shortDescription.key}
                rules={OrganizationGeneralConfig.shortDescription.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Textarea
                      config={{
                        ...OrganizationGeneralConfig.shortDescription.config,
                        name: OrganizationGeneralConfig.shortDescription.key,
                        error: errors[OrganizationGeneralConfig.shortDescription.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__short-description',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.description.key}
                name={OrganizationGeneralConfig.description.key}
                rules={OrganizationGeneralConfig.description.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Textarea
                      config={{
                        ...OrganizationGeneralConfig.description.config,
                        name: OrganizationGeneralConfig.description.key,
                        error: errors[OrganizationGeneralConfig.description.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__description',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
            </div>

            <div className="flex flex-col gap-4 pt-8">
              <SectionHeader
                title={t('sections.contact_information.title')}
                subTitle={t('sections.contact_information.subtitle')}
              />
              <Controller
                key={OrganizationGeneralConfig.email.key}
                name={OrganizationGeneralConfig.email.key}
                rules={OrganizationGeneralConfig.email.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.email.config,
                        name: OrganizationGeneralConfig.email.key,
                        error: errors[OrganizationGeneralConfig.email.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-email',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.phone.key}
                name={OrganizationGeneralConfig.phone.key}
                rules={OrganizationGeneralConfig.phone.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.phone.config,
                        name: OrganizationGeneralConfig.phone.key,
                        error: errors[OrganizationGeneralConfig.phone.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-phone',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.hasSameAddress.key}
                name={OrganizationGeneralConfig.hasSameAddress.key}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.hasSameAddress.config,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__same-address-checkbox',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />

              <Controller
                key={OrganizationGeneralConfig.organizationAddress.key}
                name={OrganizationGeneralConfig.organizationAddress.key}
                rules={OrganizationGeneralConfig.organizationAddress.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.organizationAddress.config,
                        name: OrganizationGeneralConfig.organizationAddress.key,
                        error: errors[OrganizationGeneralConfig.organizationAddress.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__org-organization-address',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <div className="flex gap-4">
                <Controller
                  key={OrganizationGeneralConfig.organizationCounty.key}
                  name={OrganizationGeneralConfig.organizationCounty.key}
                  rules={OrganizationGeneralConfig.organizationCounty.rules}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Select
                        config={{
                          id: 'create-organization-general__organization-county',
                          ...OrganizationGeneralConfig.organizationCounty.config,
                          collection: counties,
                          displayedAttribute: 'name',
                        }}
                        error={errors[OrganizationGeneralConfig.organizationCounty.key]?.message}
                        selected={value}
                        onChange={(e: any) => {
                          onChange(e);
                          setOrganizationCounty(e);
                          setValue('organizationCity', null);
                          setOrganizationCity(null);
                        }}
                        readonly={readonly}
                      />
                    );
                  }}
                />
                <Controller
                  key={OrganizationGeneralConfig.organizationCity.key}
                  name={OrganizationGeneralConfig.organizationCity.key}
                  rules={OrganizationGeneralConfig.organizationCity.rules}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Select
                        config={{
                          id: 'create-organization-general__organization-city',
                          ...OrganizationGeneralConfig.organizationCity.config,
                          collection: cities || [],
                          displayedAttribute: 'name',
                        }}
                        error={errors[OrganizationGeneralConfig.organizationCity.key]?.message}
                        selected={value}
                        onChange={onChange}
                        readonly={readonly}
                      />
                    );
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-8">
              <SectionHeader
                title={t('sections.communication_and_social_media.title')}
                subTitle={t('sections.communication_and_social_media.subtitle')}
              />
              <Controller
                key={OrganizationGeneralConfig.website.key}
                name={OrganizationGeneralConfig.website.key}
                rules={OrganizationGeneralConfig.website.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.website.config,
                        name: OrganizationGeneralConfig.website.key,
                        error: errors[OrganizationGeneralConfig.website.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__website',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.facebook.key}
                name={OrganizationGeneralConfig.facebook.key}
                rules={OrganizationGeneralConfig.facebook.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.facebook.config,
                        name: OrganizationGeneralConfig.facebook.key,
                        error: errors[OrganizationGeneralConfig.facebook.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__facebook',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.instagram.key}
                name={OrganizationGeneralConfig.instagram.key}
                rules={OrganizationGeneralConfig.instagram.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.instagram.config,
                        name: OrganizationGeneralConfig.instagram.key,
                        error: errors[OrganizationGeneralConfig.instagram.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__instagram',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.twitter.key}
                name={OrganizationGeneralConfig.twitter.key}
                rules={OrganizationGeneralConfig.twitter.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.twitter.config,
                        name: OrganizationGeneralConfig.twitter.key,
                        error: errors[OrganizationGeneralConfig.twitter.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__twitter',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.linkedin.key}
                name={OrganizationGeneralConfig.linkedin.key}
                rules={OrganizationGeneralConfig.linkedin.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.linkedin.config,
                        name: OrganizationGeneralConfig.linkedin.key,
                        error: errors[OrganizationGeneralConfig.linkedin.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__linkedin',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.tiktok.key}
                name={OrganizationGeneralConfig.tiktok.key}
                rules={OrganizationGeneralConfig.tiktok.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.tiktok.config,
                        name: OrganizationGeneralConfig.tiktok.key,
                        error: errors[OrganizationGeneralConfig.tiktok.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__tiktok',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
            </div>
            <div className="flex flex-col gap-4 pt-8">
              <SectionHeader
                title={t('sections.fundraising.title')}
                subTitle={t('sections.fundraising.subtitle')}
              />
              <Controller
                key={OrganizationGeneralConfig.donationWebsite.key}
                name={OrganizationGeneralConfig.donationWebsite.key}
                rules={OrganizationGeneralConfig.donationWebsite.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.donationWebsite.config,
                        name: OrganizationGeneralConfig.donationWebsite.key,
                        error: errors[OrganizationGeneralConfig.donationWebsite.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__donation-website',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <Controller
                key={OrganizationGeneralConfig.redirectLink.key}
                name={OrganizationGeneralConfig.redirectLink.key}
                rules={OrganizationGeneralConfig.redirectLink.rules}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <InputField
                      config={{
                        ...OrganizationGeneralConfig.redirectLink.config,
                        name: OrganizationGeneralConfig.redirectLink.key,
                        error: errors[OrganizationGeneralConfig.redirectLink.key]?.message,
                        defaultValue: value,
                        onChange: onChange,
                        id: 'create-organization-general__redirect-link',
                      }}
                      readonly={readonly}
                    />
                  );
                }}
              />
              <div className="flex gap-4">
                <Controller
                  key={OrganizationGeneralConfig.donationSMS.key}
                  name={OrganizationGeneralConfig.donationSMS.key}
                  rules={OrganizationGeneralConfig.donationSMS.rules}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <InputField
                        config={{
                          ...OrganizationGeneralConfig.donationSMS.config,
                          name: OrganizationGeneralConfig.donationSMS.key,
                          error: errors[OrganizationGeneralConfig.donationSMS.key]?.message,
                          defaultValue: value,
                          onChange: onChange,
                          id: 'create-organization-general__donation-sms',
                        }}
                        readonly={readonly}
                      />
                    );
                  }}
                />
                <Controller
                  key={OrganizationGeneralConfig.donationKeyword.key}
                  name={OrganizationGeneralConfig.donationKeyword.key}
                  rules={OrganizationGeneralConfig.donationKeyword.rules}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <InputField
                        config={{
                          ...OrganizationGeneralConfig.donationKeyword.config,
                          name: OrganizationGeneralConfig.donationKeyword.key,
                          error: errors[OrganizationGeneralConfig.donationKeyword.key]?.message,
                          defaultValue: value,
                          onChange: onChange,
                          id: 'create-organization-general__donation-keyword',
                        }}
                        readonly={readonly}
                      />
                    );
                  }}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
          <button
            aria-label={t('next', { ns: 'common' })}
            id="create-organization-general__button-next"
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 sm:text-sm lg:text-base text-xs font-medium text-black hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto"
            onClick={handleSubmit(handleSave)}
          >
            {t('next', { ns: 'common' })}
          </button>
          <button
            aria-label={t('back', { ns: 'common' })}
            id="create-organization-general__button-back"
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:text-sm lg:text-base text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto"
            onClick={() => navigate(`/${CREATE_FLOW_URL.BASE}/${CREATE_FLOW_URL.ACCOUNT}`)}
          >
            {t('back', { ns: 'common' })}
          </button>
        </div>
        {!isValid && isSubmitted && <GenericFormErrorMessage />}
        {validationErrors.length > 0 && (
          <ErrorsBanner errors={validationErrors} onClose={() => setValidationErrors([])} />
        )}
      </div>
    </div>
  );
};

export default CreateOrganizationGeneral;

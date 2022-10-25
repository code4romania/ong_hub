import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { mapNameToSelect, mapToId } from '../../common/helpers/format.helper';
import { useErrorToast, useSuccessToast } from '../../common/hooks/useToast';
import ContentWrapper from '../../components/content-wrapper/ContentWrapper';
import { PracticeProgramPayload } from '../../services/practice-program/interfaces/practice-program-payload.interface';
import {
  useEditPracticeProgramMutation,
  useGetPracticeProgramQuery,
} from '../../services/practice-program/PracticeProgram.queries';
import PracticeProgramForm from './components/PracticeProgramForm';

const EditPracticeProgram = () => {
  const navigate = useNavigate();
  // get practice program id
  const { id } = useParams();

  // translations
  const { t } = useTranslation(['practice_program', 'common']);
  // check additional validity
  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  // get practice program
  const { isLoading: isLoadingPracticeProgram, data: practiceProgram } = useGetPracticeProgramQuery(
    id as string,
  );

  const { isLoading: isUpdatingPracticeProgram, mutateAsync: updatePracticeProgram } =
    useEditPracticeProgramMutation();

  // React Hook Form
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<PracticeProgramPayload>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (practiceProgram) {
      const { domains, startDate, endDate, deadline, ...formData } = practiceProgram;

      const faculties = practiceProgram.faculties?.length
        ? [...practiceProgram.faculties.map(mapNameToSelect)]
        : [];

      const skills = practiceProgram.skills?.length
        ? [...practiceProgram.skills.map(mapNameToSelect)]
        : [];

      reset({
        ...formData,
        domains: domains.map(mapToId),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : endDate,
        deadline: deadline ? new Date(deadline) : deadline,
        faculties,
        skills,
      });
    }
  }, [practiceProgram]);

  const onSubmit = async (data: PracticeProgramPayload) => {
    // submit only if additional perdiod and working hours conditions are met
    if (isFormValid) {
      // update practice program request
      await updatePracticeProgram(
        {
          id: id as string,
          data,
        },
        {
          onSuccess: () => {
            useSuccessToast(t('feedback.success_update'));
            navigate('/practice-program', { replace: true });
          },
          onError: () => {
            useErrorToast(t('feedback.error_update'));
          },
        },
      );
    }
  };

  return (
    <ContentWrapper
      title={t('edit.title', { ns: 'practice_program' })}
      backButton={{
        btnLabel: t('back', { ns: 'common' }),
        onBtnClick: () => navigate('/practice-program'),
      }}
    >
      <div className="w-full bg-white shadow rounded-lg mt-4">
        <div className="py-5 sm:px-10 px-5 flex justify-between">
          <span className="font-titilliumBold sm:text-lg lg:text-xl text-md text-gray-800 self-center">
            {t('edit.card_title', { ns: 'practice_program' })}
          </span>
          <button
            type="button"
            className="save-button sm:text-sm lg:text-base text-xs"
            disabled={isLoadingPracticeProgram || isUpdatingPracticeProgram}
            onClick={handleSubmit(onSubmit)}
          >
            {isLoadingPracticeProgram || isUpdatingPracticeProgram
              ? t('processing', { ns: 'common' })
              : t('save', { ns: 'common' })}
          </button>
        </div>
        <div className="w-full border-t border-gray-300" />
        <PracticeProgramForm
          control={control}
          errors={errors}
          watch={watch}
          onChangeFormValidity={setIsFormValid}
        />
      </div>
    </ContentWrapper>
  );
};

export default EditPracticeProgram;
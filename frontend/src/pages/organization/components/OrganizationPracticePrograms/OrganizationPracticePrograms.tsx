import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePracticePrograms } from '../../../../services/practice-program/PracticeProgram.queries';
import PracticeProgramsList from '../../../pactice-program/components/PracticeProgramsList';

const OrganizationPracticePrograms = () => {
  // routing
  const navigate = useNavigate();

  // practice programs query
  const { data: practicePrograms, isLoading, error, refetch } = usePracticePrograms();

  const onAddPracticeProgram = () => {
    navigate('/practice-program/add');
  };

  return (
    <PracticeProgramsList
      practicePrograms={practicePrograms}
      isLoading={isLoading}
      refetch={refetch}
      error={error}
      onAddPracticeProgram={onAddPracticeProgram}
    />
  );
};

export default OrganizationPracticePrograms;

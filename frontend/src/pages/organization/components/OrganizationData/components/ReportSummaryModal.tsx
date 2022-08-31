import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { Controller, useForm } from 'react-hook-form';
import InputField from '../../../../../components/InputField/InputField';
import { ReportSummaryConfig } from './ReportSummayConfig';
import { Report } from '../../../interfaces/Report.interface';

interface ReportSummaryModalProps {
  year: number;
  defaultValue: Partial<Report>;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ReportSummaryModal = ({ onClose, year, defaultValue, onSave }: ReportSummaryModalProps) => {
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (defaultValue) {
      reset({ ...defaultValue });
    }
  }, [defaultValue]);

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-lg p-6 sm:p-10 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => onClose()}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-xl leading-6 font-bold text-gray-900">
                      {`Sumar Activitate ${year}`}
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className="text-base text-gray-500">
                        Lorem ipsum. This information will be displayed publicly so be careful what
                        you share. Lorem ipsum. This information will be displayed publicly so be
                        careful what you share.
                      </p>
                    </div>
                  </div>
                </div>
                <form className="my-6 space-y-6">
                  <Controller
                    key={ReportSummaryConfig.numberOfVolunteers.key}
                    name={ReportSummaryConfig.numberOfVolunteers.key}
                    rules={ReportSummaryConfig.numberOfVolunteers.rules}
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <InputField
                          config={{
                            ...ReportSummaryConfig.numberOfVolunteers.config,
                            name: ReportSummaryConfig.numberOfVolunteers.key,
                            error: errors[ReportSummaryConfig.numberOfVolunteers.key]?.message,
                            defaultValue: value,
                            onChange: onChange,
                          }}
                        />
                      );
                    }}
                  />
                  <Controller
                    key={ReportSummaryConfig.numberOfContractors.key}
                    name={ReportSummaryConfig.numberOfContractors.key}
                    rules={ReportSummaryConfig.numberOfContractors.rules}
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <InputField
                          config={{
                            ...ReportSummaryConfig.numberOfContractors.config,
                            name: ReportSummaryConfig.numberOfContractors.key,
                            error: errors[ReportSummaryConfig.numberOfContractors.key]?.message,
                            defaultValue: value,
                            onChange: onChange,
                          }}
                        />
                      );
                    }}
                  />
                  <Controller
                    key={ReportSummaryConfig.report.key}
                    name={ReportSummaryConfig.report.key}
                    rules={ReportSummaryConfig.report.rules}
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <InputField
                          config={{
                            ...ReportSummaryConfig.report.config,
                            name: ReportSummaryConfig.report.key,
                            error: errors[ReportSummaryConfig.report.key]?.message,
                            defaultValue: value,
                            onChange: onChange,
                          }}
                        />
                      );
                    }}
                  />
                </form>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleSubmit(onSave)}
                  >
                    Salveaza
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => onClose()}
                  >
                    Anuleaza Modificari
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ReportSummaryModal;

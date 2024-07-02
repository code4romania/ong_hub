import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import ContactForm from '../../../../../components/Contact/Contact';
import { Person } from '../../../../../common/interfaces/person.interface';
import { OtherConfig } from './OtherConfig';
import { useTranslation } from 'react-i18next';

interface OtherModalProps {
  defaultValue: Partial<Person>;
  isEdit?: boolean;
  onClose: () => void;
  onSave: (data: Partial<Person>) => void;
  id?: string;
}

const OtherModal = ({ onClose, defaultValue, isEdit, onSave, id }: OtherModalProps) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { t } = useTranslation(['legal', 'orgnization', 'common']);

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
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
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
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    aria-label={t('modal.close', { ns: 'organization' })}
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">{t('modal.close', { ns: 'organization' })}</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="sm:text-lg lg:text-xl text-md leading-6 font-bold text-gray-900 break-word"
                    >
                      {isEdit ? t('modal.edit_relevant') : t('modal.add_relevant')}
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className="sm:text-sm lg:text-base text-xs text-gray-500 break-word">
                        {t('modal.edit_relevant_information')}
                      </p>
                    </div>
                  </div>
                </div>
                <form className="my-6 space-y-6">
                  <ContactForm
                    control={control}
                    errors={errors}
                    readonly={false}
                    configs={[OtherConfig.fullName, OtherConfig.role]}
                    id={id}
                  />
                </form>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  {isEdit && (
                    <>
                      <button
                        aria-label={t('save', { ns: 'common' })}
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 sm:text-sm lg:text-base text-xs font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleSubmit(onSave)}
                      >
                        {t('save', { ns: 'common' })}
                      </button>
                      <button
                        aria-label={t('modal.cancel', { ns: 'organization' })}
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:text-sm lg:text-base text-xs font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                      >
                        {t('modal.cancel', { ns: 'organization' })}
                      </button>
                    </>
                  )}
                  {!isEdit && (
                    <button
                      aria-label={t('modal.add')}
                      id={`${id}__button-add`}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 sm:text-sm lg:text-base text-xs font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleSubmit(onSave)}
                    >
                      {t('modal.add')}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default OtherModal;

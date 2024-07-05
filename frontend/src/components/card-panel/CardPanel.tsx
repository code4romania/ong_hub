import { PencilIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CardPanelProps {
  title: string;
  children?: JSX.Element;
  btnLabel?: string;
  loading?: boolean;
  onSave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const CardPanel = ({ title, children, btnLabel, loading, onSave }: CardPanelProps) => {
  const { t } = useTranslation('common');

  return (
    <div className="w-full bg-white shadow rounded-lg">
      <div className="py-5 lg:px-10 px-5 flex justify-between items-center">
        <span className="font-titilliumBold sm:text-lg lg:text-xl text-md text-gray-800">
          {title}
        </span>
        {onSave && (
          <button
            aria-label={loading ? t('processing') : `${btnLabel || t('save')}`}
            type="button"
            className="save-button sm:text-sm lg:text-base text-xs"
            onClick={onSave}
            disabled={loading}
          >
            <PencilIcon className="-ml-1 mr-2 sm:h-5 sm:w-5 h-4 w-4" aria-hidden="true" />
            {loading ? t('processing') : `${btnLabel || t('save')}`}
          </button>
        )}
      </div>

      <div className="w-full border-t border-gray-300" />
      <div className="py-5 lg:px-10 px-5">{children}</div>
    </div>
  );
};

export default CardPanel;

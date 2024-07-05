import React, { useState } from 'react';
import { classNames } from '../../common/helpers/tailwind.helper';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { InputFieldConfig } from './InputFieldConfig.interface';

const InputField = (props: {
  config: Partial<InputFieldConfig>;
  readonly?: boolean;
  link?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  alwaysShowHelper?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={classNames('relative w-full', props.hidden ? 'hidden' : '')}>
      {props.config.label && props.config.type !== 'checkbox' && (
        <label
          htmlFor={`${props.config.id}__input`}
          className="block sm:text-sm lg:text-base text-xs font-medium text-gray-700"
        >
          {props.config.label}
        </label>
      )}

      <div className="mt-1 relative rounded-md">
        {!props.readonly && props.config.addOn && props.config.addOn()}
        {props.readonly && props.link && (
          <a
            className="text-blue-500"
            href={`https://${props.config.defaultValue?.replace('https://', '')}`}
            target="_blank"
            rel="noreferrer"
            style={{ pointerEvents: props.config.defaultValue ? 'auto' : 'none' }}
          >
            {props.config.defaultValue || '-'}
          </a>
        )}
        {props.readonly && !props.link && (
          <span className="break-word">{props.config.defaultValue || '-'}</span>
        )}
        {!props.readonly && (
          <>
            <input
              type={props.config.type === 'password' && showPassword ? 'text' : props.config.type}
              name={props.config.name}
              onChange={props.config.onChange}
              onBlur={props.config.onBlur}
              className={classNames(
                props.config.error
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 pr-10'
                  : 'focus:ring-indigo-500 focus:border-indigo-500',
                props.config.addOn ? 'pl-14' : 'pl-4',
                props.config.type === 'checkbox'
                  ? ''
                  : 'block w-full border-gray-300 shadow-sm sm:text-base text-sm rounded-md disabled:bg-gray-100 min-w-[6.5rem]',
                props.config.type === 'password' ? 'pr-10' : '',
              )}
              placeholder={props.config.placeholder}
              defaultValue={props.config.defaultValue}
              aria-invalid={props.config.error ? 'true' : 'false'}
              disabled={props.disabled}
              checked={
                props.config.type === 'checkbox' ? Boolean(props.config.defaultValue) : undefined
              }
              id={`${props.config.id}__input`}
            />
            {props.config.type === 'password' && (
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon className="h-5 w-5 text-gray-700" aria-hidden="true" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-700" aria-hidden="true" />
                )}
              </div>
            )}
            {props.config.type === 'checkbox' && (
              <label
                htmlFor={`${props.config.id}__input`}
                className="sm:text-sm lg:text-base text-xs font-medium ml-2 text-gray-700"
              >
                {props.config.label}
              </label>
            )}
          </>
        )}
        {props.config.error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {!props.config.error && (!props.readonly || props.alwaysShowHelper) && (
        <p className="mt-1 sm:text-sm text-xs text-gray-500 font-normal" id="email-description">
          {props.config.helperText}
        </p>
      )}
      {props.config.error && (
        <p
          className="mt-1 sm:text-sm text-xs text-red-600 whitespace-pre-wrap"
          id={`${props.config.id}__input-error`}
        >
          {props.config.error}
        </p>
      )}
    </div>
  );
};

export default InputField;

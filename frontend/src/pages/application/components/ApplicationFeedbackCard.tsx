import React from 'react';

interface ApplicationFeedbackCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  descriptionIsHtml?: boolean;
}

const ApplicationFeedbackCard = ({
  icon,
  title,
  description,
  actions,
  descriptionIsHtml,
}: ApplicationFeedbackCardProps) => {
  return (
    <div className="w-full h-full bg-white shadow rounded-lg">
      <div className="py-5 lg:px-10 px-5 flex gap-2 items-center">
        {icon}
        <span className="font-titilliumBold sm:text-lg lg:text-xl text-md text-gray-800">
          {title}
        </span>
      </div>
      <div className="w-full border-t border-gray-300" />
      <div className="lg:p-8 p-5 flex flex-col gap-4">
        {descriptionIsHtml ? (
          <p
            className="richtext_html break-word sm:text-sm lg:text-base text-xs"
            dangerouslySetInnerHTML={{ __html: description || '' }}
          />
        ) : (
          <p className="break-word sm:text-sm lg:text-base text-xs">{description}</p>
        )}

        <div>{actions}</div>
      </div>
    </div>
  );
};

export default ApplicationFeedbackCard;

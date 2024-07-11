import React, { useEffect, useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './RichText.css';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { RichTextConfig } from './RichTextConfig.interface';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { classNames } from '../../common/helpers/tailwind.helper';

const RichText = (props: { config: RichTextConfig; readonly?: boolean; disabled?: boolean }) => {
  const [editorState, setEditorState] = useState<any>(EditorState.createEmpty());

  useEffect(() => {
    // Run only if the value from props (HTML) is different than current value (converted to HTML)
    // Used for late init for default values
    if (
      JSON.stringify(draftToHtml(convertToRaw(editorState.getCurrentContent()))) !==
      JSON.stringify(props.config.value)
    ) {
      const blocksFromHtml = htmlToDraft(props.config.value || '');
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [props.config.value]);

  const onEditorStateChange = (editorState: any) => {
    setEditorState(editorState);
    return props.config.onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  return (
    <div className="relative w-full">
      {props.config.label && (
        <label
          htmlFor="email"
          className="block sm:text-sm lg:text-base text-xs font-medium text-gray-700 pb-1"
        >
          {props.config.label}
        </label>
      )}
      {props.readonly && (
        <span
          className="richtext_html"
          dangerouslySetInnerHTML={{ __html: props.config.value as string }}
        ></span>
      )}
      {!props.readonly && (
        <div className={classNames(props.disabled ? 'bg-gray-100' : '')}>
          <Editor
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={onEditorStateChange}
            editorStyle={{
              flex: 1,
            }}
            readOnly={props.disabled}
            toolbarHidden={props.disabled}
            wrapperStyle={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 350,
              borderColor: props.config.error && '#fca5a5',
            }}
          />
        </div>
      )}
      {props.config.error && (
        <p className="mt-1 sm:text-sm text-xs text-red-600" id={`${props.config.id}__input-error`}>
          {props.config.error}
        </p>
      )}
    </div>
  );
};

export default RichText;

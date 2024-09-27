import React, { FC, useEffect, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import styled, { css } from 'styled-components';

import { EditorFromTextArea } from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';

import { CustomScrollbarProps } from 'src/common/components/CustomScrollbar';
import { animation, colors, px, typography } from 'src/styles';
import { hintHighlightClassName, initEditor } from './sqlHelpers';

type TablesColumnsMap = Map<string, string[]>;
export interface SQLInputFieldProps extends CustomScrollbarProps {
  value: string;
  error?: boolean;
  label?: string;
  tablesColumnsMap?: TablesColumnsMap;
  onChange: (value: string) => void;
}

const SQLInputField: FC<SQLInputFieldProps> = ({
  value,
  error,
  label,
  tablesColumnsMap,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EditorFromTextArea>();
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef<(value: string) => void>(onChange);
  onChangeRef.current = onChange;
  const onSearchRef = useRef<() => void>(() => { });
  const tablesColumnsMapRef = useRef<TablesColumnsMap>(
    tablesColumnsMap || new Map<string, string[]>()
  );

  useEffectOnce(() => {
    initEditor({
      editorRef,
      textareaRef,
      containerRef,
      value,
      onChangeRef,
      onSearchRef,
      tablesColumnsMapRef,
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = undefined;
      }
    };
  });

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const val = editorRef.current.getValue();
    if (value !== undefined && value !== val) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <TextAreaContainer ref={containerRef} $error={error}>
      {label && <Label data-testid="area-label">{label}</Label>}
      <TextArea data-testid="query-input-field" ref={textareaRef} />
    </TextAreaContainer>
  );
};

export default SQLInputField;

const codemirrorHintsStyles = css`
  .CodeMirror-hints {
    width: ${px(134)};
    margin-top: ${px(5)};
    padding: 0;
    background-color: ${colors.surface};
    border-radius: ${px(2)};
    box-shadow: 0 ${px(5)} ${px(12)} rgba(0, 0, 0, 0.12);

    .CodeMirror-hint {
      height: ${px(34)};
      ${typography.query12};
      color: ${colors.textSecondaryGray};
      padding: ${px(8)};
      white-space: nowrap;
      cursor: pointer;

      .${hintHighlightClassName} {
        font-family: inherit;
        color: ${colors.primary};
      }
    }

    .CodeMirror-hint:hover {
      background-color: ${colors.primaryLight};
    }

    .CodeMirror-hint-active {
      background-color: ${colors.primaryLightFocused};
    }
  }
`;

const TextAreaContainer = styled.div<{ $error?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
  margin-top: 5px;

  ${codemirrorHintsStyles};

  .CodeMirror {
    height: ${px(96)};
    padding: ${px(8)};
    background-color: ${colors.surface};
    border-radius: ${px(4)};
    border-width: ${px(1)};
    border-style: solid;
    box-shadow: 0 0 ${px(2)} ${colors.black15};
    transition: border 300ms ${animation.defaultTiming};
    caret-color: ${({ $error }) => ($error ? colors.statusErrorText : colors.textPrimaryBlue)};
    border-color: ${({ $error, theme }) => $error ? `${theme.colors.statusError} !important` : theme.colors.black08};
    ${typography.query14};

    &:hover {
      border-color: ${({ $error }) => ($error ? 'transparent' : colors.primaryHovered)};
    }

    .CodeMirror-hscrollbar,
    .CodeMirror-vscrollbar {
      scrollbar-width: thin;
      scrollbar-color: ${colors.textPrimaryBlue} transparent;
    }

    .CodeMirror-lines {
      padding: 0;
    }

    pre.CodeMirror-line,
    pre.CodeMirror-line-like {
      padding: 0;

      span {
        color: ${colors.textSecondaryGray};
      }
    }

    .cm-keyword,
    .cm-property {
      color: ${colors.secondarySkyblue} !important;
    }

    &.CodeMirror-focused {
      border-color: ${colors.primary};
    }

    .cm-string,
    .cm-number {
      color: ${colors.secondaryViolet} !important;
    }
  }
`;

const Label = styled.div`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimary};
  height: ${px(16)};
`;
const TextArea = styled.textarea``;

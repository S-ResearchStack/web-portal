import React, { useEffect, useRef } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import styled, { css } from 'styled-components';

import { EditorFromTextArea } from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';

import { px, colors, typography } from 'src/styles';
import Button from 'src/common/components/Button';

import { initEditor, hintHighlightClassName } from './helpers';
import { TablesColumnsMap } from '../helpers';

const codemirrorHintsStyles = css`
  .CodeMirror-hints {
    width: ${px(134)};
    margin-top: ${px(5)};
    padding: 0;
    list-style-type: none;
    background-color: ${colors.background};
    border: none;
    border-radius: ${px(2)};
    box-shadow: 0 ${px(5)} ${px(12)} rgba(0, 0, 0, 0.12);

    .CodeMirror-hint {
      height: ${px(34)};
      ${typography.query12};
      color: ${colors.updTextSecondaryGray};
      padding: ${px(8)};
      white-space: nowrap;
      cursor: pointer;

      .${hintHighlightClassName} {
        font-family: inherit;
        color: ${colors.updPrimary};
      }
    }

    .CodeMirror-hint:hover {
      background-color: ${colors.updPrimaryLight};
    }

    .CodeMirror-hint-active {
      background-color: ${colors.background};
    }
  }
`;

const Container = styled.div<{ $isError?: boolean }>`
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  column-gap: ${px(8)};

  ${codemirrorHintsStyles};

  .CodeMirror {
    height: ${px(48)};
    background-color: ${colors.background};
    border-radius: ${px(4)};
    border-width: ${px(0.5)};
    border-style: solid;
    border-color: ${({ $isError, theme }) =>
      $isError ? `${theme.colors.updStatusError} !important` : theme.colors.background};
    box-shadow: 0 0 ${px(2)} rgba(0, 0, 0, 0.15);
    flex: 1;
    padding: ${px(15)};
    line-height: 1;

    .CodeMirror-hscrollbar,
    .CodeMirror-vscrollbar {
      display: none !important;
    }

    .CodeMirror-scroll {
      overflow-y: hidden !important;
    }

    .CodeMirror-lines {
      padding: 0;
    }

    pre.CodeMirror-line,
    pre.CodeMirror-line-like {
      padding: 0;

      span {
        ${typography.query14};
        color: ${colors.updTextSecondaryGray};
      }
    }

    .cm-keyword,
    .cm-property {
      color: ${colors.secondarySkyblue} !important;
    }

    &.CodeMirror-focused {
      border-color: ${colors.updPrimary};
    }

    .cm-string,
    .cm-number {
      color: ${colors.secondaryViolet} !important;
    }
  }
`;

type SqlQueryEditorProps = {
  tablesColumnsMap: TablesColumnsMap;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isError?: boolean;
  searchDisabled?: boolean;
};

const SqlQueryEditor: React.FC<SqlQueryEditorProps> = (props) => {
  const { value, onSearch, onChange, tablesColumnsMap, isError, searchDisabled } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EditorFromTextArea>();
  const containerRef = useRef<HTMLDivElement>(null);

  const onSearchRef = useRef<() => void>(onSearch);
  onSearchRef.current = searchDisabled ? () => {} : onSearch;
  const onChangeRef = useRef<(value: string) => void>(onChange);
  onChangeRef.current = onChange;
  const tablesColumnsMapRef = useRef<TablesColumnsMap>(tablesColumnsMap);
  tablesColumnsMapRef.current = tablesColumnsMap;

  useEffectOnce(() => {
    initEditor({
      editorRef,
      textareaRef,
      containerRef,
      value,
      onSearchRef,
      onChangeRef,
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
    <Container $isError={isError} ref={containerRef}>
      <textarea ref={textareaRef} />
      <Button width={108} disabled={searchDisabled} onClick={onSearch} fill="solid">
        Run
      </Button>
    </Container>
  );
};

export default SqlQueryEditor;

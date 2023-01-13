import React, { useEffect, useRef } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import styled, { css } from 'styled-components';

import { EditorFromTextArea } from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';

import { px, colors, typography, animation } from 'src/styles';
import Button from 'src/common/components/Button';

import { initEditor, hintHighlightClassName } from './helpers';
import { TablesColumnsMap } from '../helpers';

const codemirrorHintsStyles = css`
  .CodeMirror-hints {
    width: ${px(134)};
    margin-top: ${px(5)};
    padding: 0;
    list-style-type: none;
    background-color: ${colors.surface};
    border: none;
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

const SCROLLBAR_WIDTH = 30;

const Container = styled.div<{ $isError?: boolean }>`
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  column-gap: ${px(8)};

  ${codemirrorHintsStyles};

  .CodeMirror {
    height: ${px(48)};
    background-color: ${colors.surface};
    border-radius: ${px(4)};
    border-width: ${px(1)};
    border-style: solid;
    border-color: ${({ $isError, theme }) =>
      $isError ? `${theme.colors.statusError} !important` : theme.colors.surface};
    box-shadow: 0 0 ${px(2)} rgba(0, 0, 0, 0.15);
    flex: 1;
    line-height: 1;
    transition: border 300ms ${animation.defaultTiming};
    caret-color: ${({ $isError }) => ($isError ? colors.statusErrorText : colors.textPrimaryBlue)};
    overflow: hidden;
    ${typography.query14};

    &:hover {
      border-color: ${({ $isError }) => ($isError ? 'transparent' : colors.primaryHovered)};
    }

    .CodeMirror-hscrollbar,
    .CodeMirror-vscrollbar {
      display: none !important;
    }

    .CodeMirror-scroll {
      // Related to overflow: hidden in .CodeMirror
      padding: ${px(15)} ${px(SCROLLBAR_WIDTH)} ${px(SCROLLBAR_WIDTH)} ${px(16)};
      margin-bottom: ${px(-SCROLLBAR_WIDTH)};
      margin-right: ${px(-SCROLLBAR_WIDTH)};
      overflow: hidden !important;
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
    <Container data-testid="sql-query-editor" $isError={isError} ref={containerRef}>
      <textarea data-testid="sql-query-editor-textarea" ref={textareaRef} />
      <Button
        data-testid="sql-query-editor-send"
        width={108}
        disabled={searchDisabled}
        onClick={onSearch}
        fill="solid"
      >
        Run
      </Button>
    </Container>
  );
};

export default SqlQueryEditor;

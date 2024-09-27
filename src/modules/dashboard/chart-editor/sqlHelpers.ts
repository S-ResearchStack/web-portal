import React from 'react';
import CodeMirror, { Pos } from 'codemirror';

export const hintHighlightClassName = 'cm-custom-hint-highlight';

export const initEditor = (props: {
  editorRef: React.MutableRefObject<CodeMirror.EditorFromTextArea | undefined>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  containerRef: React.RefObject<HTMLElement>;
  value: string;
  onSearchRef: React.MutableRefObject<() => void>;
  onChangeRef: React.MutableRefObject<(value: string) => void>;
  tablesColumnsMapRef: React.MutableRefObject<Map<string, string[]>>;
}): void => {
  const {
    editorRef,
    textareaRef,
    containerRef,
    value,
    onChangeRef,
    onSearchRef,
    tablesColumnsMapRef,
  } = props;
  if (editorRef.current) {
    return;
  }

  if (!textareaRef.current) {
    requestAnimationFrame(() => initEditor(props));
    return;
  }

  const cm = CodeMirror.fromTextArea(textareaRef.current, {
    lineNumbers: false,
    extraKeys: { 'Ctrl-Space': 'autocomplete', Tab: 'autocomplete' },
    mode: 'text/x-trino',
    hintOptions: { container: containerRef.current },
    screenReaderLabel: 'Query',
  });
  cm.setValue(value);

  cm.on('change', (instance) => {
    onChangeRef.current(instance.getValue());
  });

  editorRef.current = cm;
};

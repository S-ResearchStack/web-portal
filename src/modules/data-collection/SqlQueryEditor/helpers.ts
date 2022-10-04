import CodeMirror, { Pos } from 'codemirror';

import { getTableNameFromQuery } from '../helpers';

export const hintHighlightClassName = 'cm-custom-hint-highlight';

const noHint: CodeMirror.Hints = {
  list: [],
  from: Pos(0),
  to: Pos(0),
};

const handleError = (e: unknown) => {
  if (e instanceof Error) {
    console.error(e);
  }
};

const getTokenEscapeSpace = (
  cmInstance: CodeMirror.Editor,
  position: number
): CodeMirror.Token | null => {
  if (position === 0) {
    return null;
  }

  const token = cmInstance.getTokenAt({ line: 0, ch: position });

  if (token.string.match(/\s+/)) {
    return getTokenEscapeSpace(cmInstance, token.start);
  }

  return token;
};

const hintsFromStrings = (hints: string[], entry: string) =>
  hints.map((text) => ({
    text,
    render: (element: HTMLLIElement) => {
      element.innerHTML = `
        <span class="${hintHighlightClassName}">${entry}</span>${text.replace(entry, '')}
      `;
    },
  }));

const handleStartTypingColumnHint = (props: {
  token: CodeMirror.Token;
  columns: string[];
  lineNum?: number;
}) => {
  const { token, columns, lineNum = 0 } = props;
  const filteredColumns = columns.filter((c) => c.startsWith(token.string));
  if (filteredColumns.length === 1 && filteredColumns[0] === token.string) {
    return noHint;
  }

  return {
    list: hintsFromStrings(filteredColumns, token.string),
    from: Pos(lineNum, token.start),
    to: Pos(lineNum, token.end),
  };
};

const handleColumnHint = (props: { columns: string[]; cursorCh: number; lineNum?: number }) => {
  const { columns, cursorCh, lineNum = 0 } = props;

  return {
    list: columns,
    from: Pos(lineNum, cursorCh),
    to: Pos(lineNum, cursorCh),
  };
};

const handleHint = (
  instance: CodeMirror.Editor,
  tableColumnsMapRef: React.MutableRefObject<Map<string, string[]>>
): CodeMirror.Hints => {
  const tablesNames = Array.from(tableColumnsMapRef.current.keys());
  const cursor = instance.getCursor();
  const token = instance.getTokenAt(cursor);
  const queryString = instance.getValue();

  // handle tables' hint after 'from' keyword and space symbols
  const tokenBeforeSpace = getTokenEscapeSpace(instance, cursor.ch);
  const isCursorAtTheEndOfLine = instance.getLine(cursor.line).length === cursor.ch;
  if (
    token.string.match(/\s+/) &&
    tokenBeforeSpace?.string.toLocaleLowerCase() === 'from' &&
    (token.end !== cursor.ch || isCursorAtTheEndOfLine)
  ) {
    return {
      list: tablesNames,
      from: Pos(cursor.line, cursor.ch),
      to: Pos(cursor.line, cursor.ch),
    };
  }

  // handle tables' hint on starts typing after 'from' keyword
  const previousToken = getTokenEscapeSpace(instance, token.start);
  if (previousToken?.string.toLocaleLowerCase() === 'from' && token.string.match(/\S+/)) {
    const filteredTables = tablesNames.filter((t) => t.startsWith(token.string));

    if (filteredTables.length === 1 && filteredTables[0] === token.string) {
      return noHint;
    }

    return {
      list: hintsFromStrings(filteredTables, token.string),
      from: Pos(cursor.line, token.start),
      to: Pos(cursor.line, token.end),
    };
  }

  const matchedTableName = getTableNameFromQuery(queryString);
  const table = matchedTableName && tablesNames.find((st) => st === matchedTableName);

  if (!table) {
    return noHint;
  }

  const highlightedKeywords = instance.getLineTokens(0).filter((t) => t.type);

  // handle columns' hint after order by
  const orderTokenIdx = highlightedKeywords.findIndex((t) => t.string.toLowerCase() === 'order');
  const orderToken = highlightedKeywords[orderTokenIdx];
  const byTokenIdx = highlightedKeywords.findIndex((t) => t.string.toLowerCase() === 'by');
  const byToken = highlightedKeywords[byTokenIdx];
  const isAfterBy =
    !!orderToken && !!byToken && orderTokenIdx === byTokenIdx - 1 && cursor.ch > byToken.end;

  if (isAfterBy) {
    // don't show columns hint without previous comma or by keywords
    if (
      !previousToken ||
      !(previousToken.string.endsWith(',') || previousToken.string.toLowerCase() === 'by')
    ) {
      return noHint;
    }

    try {
      const columns = tableColumnsMapRef.current.get(table) || [];

      // handle columns' hint after space bracket
      if (
        token.string.match(/\s+/) &&
        (token.end !== cursor.ch || cursor.ch === queryString.length)
      ) {
        return handleColumnHint({ columns, cursorCh: cursor.ch });
      }

      return handleStartTypingColumnHint({ token, columns });
    } catch (e) {
      handleError(e);
    }
  }

  // handle columns' hint after where
  const whereToken = highlightedKeywords.find((t) => t.string.toLowerCase() === 'where');
  const isAfterWhere = !!whereToken && cursor.ch > whereToken.end;

  if (isAfterWhere) {
    // don't show columns hint without previous specified keywords
    const tokensToCheck = ['or', 'and', 'not', 'where'];

    if (
      !previousToken ||
      !(
        tokensToCheck.includes(previousToken.string.toLowerCase()) ||
        previousToken.string.endsWith('(')
      )
    ) {
      return noHint;
    }

    try {
      const columns = tableColumnsMapRef.current.get(table) || [];

      // handle columns' hint after space or round bracket
      if (
        token.string.match(/\s+|\(/) &&
        (token.end !== cursor.ch || cursor.ch === queryString.length)
      ) {
        return handleColumnHint({ columns, cursorCh: cursor.ch });
      }

      return handleStartTypingColumnHint({ token, columns });
    } catch (e) {
      handleError(e);
    }
  }

  // handle columns' hint after between select and from
  const selectToken = highlightedKeywords.find((t) => t.string.toLowerCase() === 'select');
  const fromToken = highlightedKeywords.find((t) => t.string.toLowerCase() === 'from');
  const isBetweenSelectAndFrom =
    !!selectToken && !!fromToken && cursor.ch > selectToken.end && cursor.ch < fromToken.start;

  if (isBetweenSelectAndFrom) {
    // don't show columns hint without previous comma or select keywords
    if (
      !previousToken ||
      !(previousToken.string.endsWith(',') || previousToken.string.toLowerCase() === 'select')
    ) {
      return noHint;
    }

    try {
      const columns = tableColumnsMapRef.current.get(table) || [];

      // handle columns' hint after space
      if (
        token.string.match(/\s+/) &&
        (token.end !== cursor.ch || cursor.ch === queryString.length)
      ) {
        return handleColumnHint({ columns, cursorCh: cursor.ch });
      }

      return handleStartTypingColumnHint({ token, columns });
    } catch (e) {
      handleError(e);
    }
  }

  return noHint;
};

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
  });
  cm.setValue(value);

  // disable adding new lines
  cm.on('beforeChange', (instance, change) => {
    if (change.text.length > 1) {
      change.text = [change.text.join('')];
    }
  });

  cm.on('change', (instance) => {
    onChangeRef.current(instance.getValue());
  });

  CodeMirror.registerHelper('hint', 'sql', (instance: CodeMirror.Editor) =>
    handleHint(instance, tablesColumnsMapRef)
  );

  cm.on('keyup', (instance, event) => {
    if (!cm.state.completionActive && event.key !== 'Enter') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (CodeMirror.commands as any).autocomplete(cm, null, { completeSingle: false });
    }
  });

  cm.on('keydown', (instance, event) => {
    // fire onSearch event only when enter pressed and prevent firing on hint selection
    if ((!cm.state.completionActive || !cm.state.completionActive.data) && event.key === 'Enter') {
      onSearchRef.current();
    }
  });

  editorRef.current = cm;
};

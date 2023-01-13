import { Pos } from 'codemirror';

import { handleColumnHint, handleError } from 'src/modules/data-collection/SqlQueryEditor/helpers';

describe('handleColumnHint', () => {
  it('should handle column hint', () => {
    expect(handleColumnHint({ columns: ['1', '2', '3'], cursorCh: 1, lineNum: 1 })).toEqual({
      list: ['1', '2', '3'],
      from: Pos(1, 1),
      to: Pos(1, 1),
    });
  });

  it('[NEGATIVE] should handle column hint without lineNum parameter', () => {
    expect(handleColumnHint({ columns: ['1', '2', '3'], cursorCh: 1 })).toEqual({
      list: ['1', '2', '3'],
      from: Pos(0, 1),
      to: Pos(0, 1),
    });
  });
});

describe('handleError', () => {
  it('should handle error if instance of Error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    expect(handleError(new Error('error'))).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(new Error('error'));

    spy.mockRestore();
  });

  it('[NEGATIVE] should not handle error if not instance of Error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    expect(handleError(new Date())).toBeUndefined();
    expect(console.error).not.toHaveBeenCalledWith(new Error('error'));

    spy.mockRestore();
  });
});

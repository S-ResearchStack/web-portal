import styled from "styled-components";

export const RowContainer = styled.div<{ flex?: number, width?: string, height?: string }>`
  display: flex;
  flex-direction: row;
  flex: ${p => p.flex ?? 1};
  width: ${p => p.width};
  height: ${p => p.height};
  flex-shrink: 0;
`

export const ColumnContainer = styled.div<{ width?: string, height?: string }>`
  display: flex;
  flex-direction: column;
  width: ${p => p.width};
  height: ${p => p.height};
`

export const PaddedColumnContainer = styled(ColumnContainer)`
  padding-left: 8px;
  padding-right: 8px;
`

export const SizedColumnContainer = styled(PaddedColumnContainer)`
  width: 100%;
`

export const SizedColumnScrollContainer = styled(SizedColumnContainer)`
  width: 100%;
  overflow: hidden;
  overflow-y: auto;
`

export const SizedBox = styled.div<{width?: number, height?: number}>`
  width: ${p => p.width ?? 0};
  height: ${p => p.height ?? 0};
  min-width: ${p => p.width ?? 0};
  min-height: ${p => p.height ?? 0};
  max-width: ${p => p.width ?? 0};
  max-height: ${p => p.height ?? 0};
`

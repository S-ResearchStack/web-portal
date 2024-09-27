import React, { useMemo } from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import Tooltip from 'src/common/components/Tooltip';

import InfoIconSvg from 'src/assets/icons/info.svg';

export type ListItem = {
  key: string;
  value?: string;
  tooltip?: string;
  linesCount?: number;
}
type Props = {
  data: ListItem[];
}
const ListOverview = ({ data }: Props) => {
  const list = useMemo(() => data.filter((item) => item.value !== undefined), [data]);

  return (
    <List>
      {list.map(({ key, value, tooltip, linesCount }, index) => (
        <Item key={index} linesCount={linesCount}>
          <Key>{key}</Key>
          <Value>
            {value}
            <ValueTooltip content={tooltip} />
          </Value>
        </Item>
      ))}
    </List>
  )
};

const ValueTooltip = ({ content }: { content?: string }) => {
  if (!content) return null;
  return (
    <Tooltip
      arrow
      position="r"
      trigger="hover"
      horizontalPaddings="l"
      content={content}
      styles={{
        maxWidth: px(333),
      }}
    >
      <InfoIconSvg />
    </Tooltip>
  )
};

export default ListOverview;

const List = styled.div`
`
const Item = styled.div<{ linesCount?: number }>`
  display: grid;
  grid-template-columns: ${px(200)} 1fr;
  column-gap: ${px(24)};
  box-shadow: inset 0 ${px(-1)} 0 ${colors.primaryLight};
  min-height: ${({ linesCount }) => px(16 + 18 * (linesCount || 1))};
`
const Key = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  width: max-content;
  height: 30px;
  font-weight: 600;
`
const Value = styled.div`
  display: flex;
  align-items: center;
  padding: ${px(7)} ${px(8)};
  color: ${colors.onSurface};
  ${typography.bodyXSmallRegular};

  svg {
    margin-left: ${px(4)};
    margin-bottom: ${px(-4)};
  }
`

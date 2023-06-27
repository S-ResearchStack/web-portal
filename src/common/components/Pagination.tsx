import React, { FC, useCallback, useMemo } from 'react';

import styled from 'styled-components';

import Button from 'src/common/components/Button';
import Dropdown, { MenuItem, ValueItem } from 'src/common/components/Dropdown';
import PageFirstIcon from 'src/assets/icons/page_first.svg';
import PageLastIcon from 'src/assets/icons/page_last.svg';
import ChevronLeftIcon from 'src/assets/icons/chevron_left_pagination.svg';
import ChevronRightIcon from 'src/assets/icons/chevron_right_pagination.svg';
import { colors, px, typography } from 'src/styles';

export const PAGINATION_LIMITS = [10, 25, 50, 75];

export interface PaginationProps {
  totalCount: number;
  pageSize: number;
  onPageChange: (offset: number, size: number) => void;
  disabled?: boolean;
  offset: number;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${typography.bodySmallRegular};
  line-height: ${px(28)};
`;

const Info = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.primary};
  line-height: ${px(28)};
`;

const Controls = styled.div`
  align-items: center;
  justify-content: flex-end;
  display: flex;
  margin-right: ${px(-2)};
`;

const ArrowButton = styled(Button).attrs({
  fill: 'text',
  rate: 'icon',
})`
  margin-left: ${px(16)};
  &:disabled {
    > div {
      background-color: transparent;
      svg {
        fill: ${colors.disabled};
      }
    }
  }
`;

const DropDownContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${px(41)};
`;

const DropDownLabel = styled.span`
  ${typography.bodySmallRegular};
  color: ${colors.primary};
  margin-right: ${px(8)};
`;

const DropDownControl = styled(Dropdown)`
  width: ${px(40)};
  height: ${px(25)};
  border: none;
  border-radius: ${px(4)};
  z-index: 10;
  color: ${colors.textSecondaryGray};

  & > ${ValueItem} {
    position: relative;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: ${px(6)};
    padding-right: ${px(6)};
    border-color: ${colors.disabled};
    &:hover {
      cursor: pointer;
    }
    > svg {
      display: none;
    }
  }
` as typeof Dropdown;

const SmallMenuItem = styled(MenuItem)`
  background-color: ${({ selected }) => (selected ? colors.primary10 : colors.backgroundSurface)};
  width: ${px(38)};
  padding: 0;
  overflow-x: hidden;

  div {
    width: ${px(38)};
    text-align: center;
    > svg {
      display: none;
    }
  }
`;

const Pagination: FC<PaginationProps> = ({
  totalCount,
  pageSize,
  onPageChange,
  disabled,
  offset,
  ...props
}) => {
  const isPrevDisabled = offset === 0;
  const isNextDisabled = offset + pageSize >= totalCount;

  const handlePageClick = useCallback(
    (newOffset: number) => !disabled && onPageChange(newOffset, pageSize),
    [pageSize, onPageChange, disabled]
  );

  const handleSizeChanged = useCallback(
    (size: number) => {
      if (!disabled) {
        onPageChange(offset, size);
      }
    },
    [onPageChange, disabled, offset]
  );

  const sizes = useMemo(() => PAGINATION_LIMITS.map((i) => ({ label: i.toString(), key: i })), []);

  const goToFirst = useCallback(() => handlePageClick(0), [handlePageClick]);
  const goToLast = useCallback(
    () => handlePageClick(totalCount - pageSize),
    [handlePageClick, totalCount, pageSize]
  );

  const goToPrev = useCallback(
    () => handlePageClick(Math.max(offset - pageSize, 0)),
    [handlePageClick, offset, pageSize]
  );
  const goToNext = useCallback(
    () => handlePageClick(Math.min(offset + pageSize, totalCount)),
    [handlePageClick, offset, pageSize, totalCount]
  );

  return (
    <Container {...props} data-testid="pagination">
      <Info data-testid="info" {...props}>{`${offset + 1}-${Math.min(
        offset + pageSize + 1,
        totalCount
      )} of ${totalCount}`}</Info>
      <Controls {...props}>
        <DropDownContainer>
          <DropDownLabel>Rows per page</DropDownLabel>
          <DropDownControl
            items={sizes}
            activeKey={pageSize}
            onChange={handleSizeChanged}
            menuItemComponent={SmallMenuItem}
            backgroundType="light"
            menuItemHeight={25}
            maxVisibleMenuItems={5}
          />
        </DropDownContainer>
        <ArrowButton
          disabled={isPrevDisabled}
          onClick={goToFirst}
          data-testid="go-to-first"
          aria-label="Go to First"
        >
          <PageFirstIcon />
        </ArrowButton>
        <ArrowButton
          disabled={isPrevDisabled}
          onClick={goToPrev}
          data-testid="go-to-previous"
          aria-label="Go to Previous"
        >
          <ChevronLeftIcon />
        </ArrowButton>
        <ArrowButton
          disabled={isNextDisabled}
          onClick={goToNext}
          data-testid="go-to-next"
          aria-label="Go to Next"
        >
          <ChevronRightIcon />
        </ArrowButton>
        <ArrowButton
          disabled={isNextDisabled}
          onClick={goToLast}
          data-testid="go-to-last"
          aria-label="Go to Last"
        >
          <PageLastIcon />
        </ArrowButton>
      </Controls>
    </Container>
  );
};

export default Pagination;

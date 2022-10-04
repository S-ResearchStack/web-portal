import React, { FC, useCallback, useMemo } from 'react';

import styled from 'styled-components';

import Button from 'src/common/components/Button';
import Dropdown, { DropdownProps, MenuItem, ValueItem } from 'src/common/components/Dropdown';
import PageFirstIcon from 'src/assets/icons/page_first.svg';
import PageLastIcon from 'src/assets/icons/page_last.svg';
import ChevronLeftIcon from 'src/assets/icons/chevron_left_pagination.svg';
import ChevronRightIcon from 'src/assets/icons/chevron_right_pagination.svg';
import { colors, px, typography } from 'src/styles';

export const PAGINATION_LIMITS = [10, 25, 50, 75];

export interface PaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number, size: number) => void;
  disabled?: boolean;
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
  color: ${colors.updPrimary};
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
  rippleOff: true,
})`
  margin-left: ${px(16)};
  &:disabled {
    > div {
      svg {
        fill: ${colors.updDisabled};
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
  color: ${colors.updPrimary};
  margin-right: ${px(8)};
`;

const DropDownControl = styled(Dropdown)`
  width: ${px(40)};
  height: ${px(25)};
  border: ${px(1)} solid ${colors.updDisabled};
  border-radius: ${px(4)};

  & > ${ValueItem} {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: ${px(6)};
    padding-right: ${px(6)};

    > svg {
      display: none;
    }
  }
` as FC<DropdownProps<number>>;

const SmallMenuItem = styled(MenuItem)`
  background-color: ${({ selected }) =>
    selected ? colors.updPrimary10 : colors.updBackgroundSurface};
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
  currentPage = 1,
  onPageChange,
  disabled,
  ...props
}) => {
  const firstPage = 1;
  const totalPages = Math.ceil(totalCount / pageSize);
  const endRecord = currentPage * pageSize;
  const startRecord = endRecord - pageSize + 1;

  const isPrevDisabled = currentPage <= firstPage;
  const isNextDisabled = currentPage >= totalPages;

  const handlePageClick = useCallback(
    (newPage: number) => !disabled && onPageChange(newPage, pageSize),
    [pageSize, onPageChange, disabled]
  );

  const handleSizeChanged = useCallback(
    (size: number) => {
      if (!disabled) {
        const newTotalPages = Math.ceil(totalCount / size);
        if (currentPage > newTotalPages) {
          onPageChange(newTotalPages, size);
        } else {
          onPageChange(currentPage, size);
        }
      }
    },
    [currentPage, onPageChange, disabled, totalCount]
  );

  const sizes = useMemo(() => PAGINATION_LIMITS.map((i) => ({ label: i.toString(), key: i })), []);

  const goToFirst = useCallback(() => handlePageClick(firstPage), [handlePageClick, firstPage]);
  const goToLast = useCallback(() => handlePageClick(totalPages), [handlePageClick, totalPages]);

  const goToPrev = useCallback(
    () => handlePageClick(currentPage - 1),
    [handlePageClick, currentPage]
  );
  const goToNext = useCallback(
    () => handlePageClick(currentPage + 1),
    [handlePageClick, currentPage]
  );

  return (
    <Container {...props}>
      <Info {...props}>
        {`${startRecord}-${totalCount < endRecord ? totalCount : endRecord} of ${totalCount}`}
      </Info>
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
        <ArrowButton disabled={isPrevDisabled} onClick={goToFirst}>
          <PageFirstIcon />
        </ArrowButton>
        <ArrowButton disabled={isPrevDisabled} onClick={goToPrev}>
          <ChevronLeftIcon />
        </ArrowButton>
        <ArrowButton disabled={isNextDisabled} onClick={goToNext}>
          <ChevronRightIcon />
        </ArrowButton>
        <ArrowButton disabled={isNextDisabled} onClick={goToLast}>
          <PageLastIcon />
        </ArrowButton>
      </Controls>
    </Container>
  );
};

export default Pagination;

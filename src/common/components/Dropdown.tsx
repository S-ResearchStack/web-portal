import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEvent from 'react-use/lib/useEvent';
import _noop from 'lodash/noop';

import styled, { css, useTheme } from 'styled-components';

import Portal from 'src/common/components/Portal';
import useClickAwayGroup from 'src/common/utils/useClickAwayGroup';
import CustomScrollbar from 'src/common/components/CustomScrollbar';
import Spinner from 'src/common/components/Spinner';
import DropdownArrowIcon from 'src/assets/icons/dropdown_arrow.svg';
import CheckmarkIcon from 'src/assets/icons/checkmark.svg';
import { px, typography, colors, animation } from 'src/styles';

const ITEM_BORDER_RADIUS = px(4);

type BackgroundType = 'regular' | 'light';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Icon = styled.div`
  width: ${px(40)};
  height: ${px(40)};
  grid-area: left-icon;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.updTextPrimary};
  grid-area: label;
`;

const CheckmarkContainer = styled(Icon)`
  width: ${px(24)};
  height: ${px(24)};
  grid-area: right-icon;
`;

const Checkmark = () => (
  <CheckmarkContainer>
    <CheckmarkIcon />
  </CheckmarkContainer>
);

interface DropdownArrowIconProps {
  $isOpen?: boolean;
}

const DropdownArrowIconStyled = styled(DropdownArrowIcon)<DropdownArrowIconProps>`
  transform: ${({ $isOpen }) => $isOpen && 'rotate(180deg)'};
  grid-area: right-icon;
`;

const Item = styled.div<{
  withIcon: boolean;
  $backgroundType: BackgroundType;
  selected?: boolean;
  itemHeight: number;
}>`
  width: 100%;
  height: ${({ itemHeight }) => px(itemHeight)};
  padding: 0 ${px(16)};
  padding-right: ${px(8)};
  box-sizing: border-box;
  display: grid;
  grid-template-areas: ${({ withIcon }) => `'${withIcon ? `left-icon` : ''} label right-icon'`};
  grid-template-columns: ${({ withIcon }) => `${withIcon ? px(40) : ''} 1fr 24px`};
  align-items: center;
  gap: ${px(4)};

  background-color: ${({ $backgroundType }) =>
    $backgroundType === 'light' ? colors.updBackgroundOnPrimary : colors.updBackground};
  border: ${px(1)} solid transparent;
  border-top-width: 0;

  transition: all 300ms ${animation.defaultTiming};

  ${({ withIcon }) =>
    withIcon &&
    css`
      padding-left: ${px(8)};
    `};
`;

export const MenuItem = styled(Item)`
  &:hover {
    background-color: ${colors.updPrimaryLight};
  }
`;

export const ValueItem = styled(Item)<{
  $isOpen?: boolean;
  $position: MenuContainerPosition;
  $active?: boolean;
}>`
  border-top-width: ${px(1)};
  border-color: ${({ $isOpen, $active }) => ($isOpen || $active) && colors.updPrimary};

  ${({ $isOpen, $position }) => {
    if ($isOpen) {
      return css`
        border-radius: ${$position === 'bottom'
          ? `${ITEM_BORDER_RADIUS} ${ITEM_BORDER_RADIUS} 0 0`
          : `0 0 ${ITEM_BORDER_RADIUS} ${ITEM_BORDER_RADIUS}`};
      `;
    }

    return css`
      border-radius: ${ITEM_BORDER_RADIUS};
      &:hover {
        border-color: ${colors.updPrimaryHovered};
      }
    `;
  }};
`;

type Point = [number, number];

type MenuContainerPosition = 'auto' | 'top' | 'bottom';

interface MenuContainerProps {
  point: Point;
  position: MenuContainerPosition;
  width: number;
  itemHeight: number;
  maxVisibleMenuItems: number;
}

const getMenuContainerStyles = ({
  position,
  point,
  width,
  itemHeight,
}: MenuContainerProps): React.CSSProperties => {
  const style: React.CSSProperties = {};

  style.left = px(point[0]);
  style.minWidth = px(width);

  if (position === 'top') {
    style.bottom = px(window.innerHeight - point[1]);
  } else {
    style.top = px(point[1] + itemHeight);
  }

  return style;
};

const MENU_CONTAINER_BORDER_WIDTH = 1;
const getMenuMaxHeight = (itemHeight: number, maxVisibleMenuItems: number) =>
  itemHeight * maxVisibleMenuItems + MENU_CONTAINER_BORDER_WIDTH;

const MenuContainer = styled(CustomScrollbar).attrs<MenuContainerProps>((props) => ({
  style: getMenuContainerStyles(props),
}))<MenuContainerProps>`
  overflow: auto;
  position: absolute;
  max-height: ${({ itemHeight, maxVisibleMenuItems }) =>
    px(getMenuMaxHeight(itemHeight, maxVisibleMenuItems))};
  border: ${px(MENU_CONTAINER_BORDER_WIDTH)} solid ${colors.updPrimary};
  z-index: 1001;

  ${({ position }) => {
    switch (position) {
      case 'top':
        return css`
          border-bottom-width: 0;
          border-top-width: ${px(MENU_CONTAINER_BORDER_WIDTH)};
          border-radius: ${`${ITEM_BORDER_RADIUS} ${ITEM_BORDER_RADIUS} 0 0`};
        `;

      case 'bottom':
      default:
        return css`
          border-bottom-width: ${px(MENU_CONTAINER_BORDER_WIDTH)};
          border-radius: ${`0 0 ${ITEM_BORDER_RADIUS} ${ITEM_BORDER_RADIUS}`};
          border-top-width: 0;
        `;
    }
  }}
`;

type ClickableProps = Pick<React.HTMLAttributes<HTMLElement>, 'onClick'>;

export interface DropdownItem<T> {
  icon?: JSX.Element;
  label: string;
  key: T;
}

export type DropdownProps<T> = {
  items: DropdownItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
  direction?: MenuContainerPosition;
  menuItemComponent?: React.ComponentType<ClickableProps>;
  arrowIcon?: JSX.Element;
  placeholder?: string;
  backgroundType?: BackgroundType;
  menuItemHeight?: number;
  maxVisibleMenuItems?: number;
  loading?: boolean;
};

const Dropdown = <T extends string | number>({
  items,
  activeKey,
  onChange,
  className,
  direction = 'auto',
  menuItemComponent,
  arrowIcon,
  placeholder = '',
  backgroundType = 'regular',
  menuItemHeight = 56,
  maxVisibleMenuItems = 3,
  loading,
}: DropdownProps<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [point, setPoint] = useState<Point>([0, 0]);
  const [position, setPosition] = useState<MenuContainerPosition>(direction);
  const [width, setWidth] = useState<number>(0);

  const searchItemPredicate = useCallback(({ key }: { key: T }) => key === activeKey, [activeKey]);

  const isOpen = isDropdownOpen && !loading;

  const calcMenuProps = useCallback(() => {
    if (containerRef.current) {
      const containerRect: DOMRect = containerRef.current.getBoundingClientRect();
      const menuHeight = Math.min(
        items.length * menuItemHeight,
        getMenuMaxHeight(menuItemHeight, maxVisibleMenuItems)
      );

      setWidth(containerRect.width);
      setPoint([containerRect.x, containerRect.y]);

      if (direction === 'auto') {
        setPosition(containerRect.bottom + menuHeight >= window.innerHeight ? 'top' : 'bottom');
      } else {
        setPosition(direction);
      }
    }
  }, [direction, items.length, menuItemHeight, maxVisibleMenuItems]);

  const updateMenuScrollTopByActiveItem = useCallback(() => {
    if (menuRef.current) {
      const selectedItemIdx = items.findIndex(searchItemPredicate) || 0;
      menuRef.current.scrollTop = selectedItemIdx * menuItemHeight - menuItemHeight;
    }
  }, [items, searchItemPredicate, menuItemHeight]);

  useEffect(() => {
    if (isOpen) {
      calcMenuProps();
      updateMenuScrollTopByActiveItem();
    }
  }, [calcMenuProps, isOpen, updateMenuScrollTopByActiveItem]);

  const open = useCallback(() => {
    if (!isOpen) {
      setIsDropdownOpen(true);
      calcMenuProps();
    }
  }, [setIsDropdownOpen, isOpen, calcMenuProps]);

  const close = useCallback(() => {
    if (isOpen) {
      setIsDropdownOpen(false);
    }
  }, [setIsDropdownOpen, isOpen]);

  useClickAwayGroup([containerRef, menuRef], close);

  useEvent(
    'scroll',
    (evt) => {
      if (isOpen && !menuRef.current?.contains(evt.target as Node)) {
        close();
      }
    },
    window,
    true
  );

  // TODO useEvent('resize', ...) works with delay - remove after review passed
  useEffect(() => {
    const onResize = () => {
      if (isOpen) {
        close();
      }
    };

    window.addEventListener('resize', onResize, true);

    return () => window.removeEventListener('resize', onResize, true);
  }, [isOpen, close]);

  const ItemComponent = menuItemComponent || MenuItem;

  const selectedItem = items.find(searchItemPredicate);

  return (
    <Container
      ref={containerRef}
      className={className || ''}
      onClick={loading ? _noop : () => (isOpen ? close() : open())}
    >
      <ValueItem
        $isOpen={isOpen}
        withIcon={!!selectedItem?.icon}
        $position={position}
        $backgroundType={backgroundType}
        itemHeight={menuItemHeight}
        $active={loading}
      >
        {selectedItem ? (
          <>
            {selectedItem.icon && <Icon>{selectedItem.icon}</Icon>}
            <Label>{selectedItem.label}</Label>
          </>
        ) : (
          <Label>{placeholder}</Label>
        )}
        {loading ? (
          <Spinner size="xs" spin />
        ) : (
          arrowIcon || <DropdownArrowIconStyled $isOpen={isOpen} />
        )}
      </ValueItem>
      <Portal id="dropdown" enabled={isOpen}>
        <MenuContainer
          itemHeight={menuItemHeight}
          ref={menuRef}
          scrollbarTrackColor={theme.colors.updBackground}
          point={point}
          position={position}
          width={width}
          maxVisibleMenuItems={maxVisibleMenuItems}
        >
          {items.map(({ icon, label, key }) => (
            <ItemComponent
              key={key}
              withIcon={!!icon}
              onClick={() => onChange(key)}
              $backgroundType={backgroundType}
              selected={key === activeKey}
              itemHeight={menuItemHeight}
            >
              {icon && <Icon>{icon}</Icon>}
              <Label>{label}</Label>
              {key === activeKey && <Checkmark />}
            </ItemComponent>
          ))}
        </MenuContainer>
      </Portal>
    </Container>
  );
};

export default Dropdown;

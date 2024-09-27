import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import useEvent from 'react-use/lib/useEvent';
import useKey from 'react-use/lib/useKey';
import _noop from 'lodash/noop';
import styled, { css, useTheme } from 'styled-components';

import Portal from 'src/common/components/Portal';
import useClickAwayGroup from 'src/common/utils/useClickAwayGroup';
import CustomScrollbar from 'src/common/components/CustomScrollbar';
import Spinner from 'src/common/components/Spinner';
import DropdownArrowIcon from 'src/assets/icons/dropdown_arrow.svg';
import CheckmarkIcon from 'src/assets/icons/checkmark.svg';
import { SpecColorType } from 'src/styles/theme';
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';
import { px, typography, colors, animation } from 'src/styles';
import { ExtendProps } from '../utils/types';
import Tooltip from './Tooltip';

const ITEM_BORDER_RADIUS = px(4);

type BackgroundType = 'regular' | 'light';

const Container = styled.div<{ $disabled?: boolean }>`
  position: relative;
  width: 100%;
  pointer-events: ${({ $disabled }) => $disabled && 'none'};
`;

export const Icon = styled.div`
  width: ${px(40)};
  height: ${px(40)};
  grid-area: left-icon;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Label = styled.div<{ textColor: SpecColorType; disabled?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${({ textColor, theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors[textColor]};
  grid-area: label;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const CheckmarkContainer = styled(Icon)`
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
    $backgroundType === 'light' ? colors.backgroundOnPrimary : colors.background};
  border: ${px(1)} solid ${colors.black08};
  border-top-width: 0;

  transition: all 300ms ${animation.defaultTiming};

  &:hover {
    cursor: pointer;
  }

  ${({ withIcon }) =>
    withIcon &&
    css`
      padding-left: ${px(8)};
    `};
`;

export const MenuItem = styled(Item)`
  &:hover {
    background-color: ${colors.primaryLight};
    cursor: pointer;
  }
`;

export const ValueItem = styled(Item)<{
  $isOpen?: boolean;
  $position: MenuContainerPosition;
  $active?: boolean;
  $disabled?: boolean;
  error?: boolean;
}>`
  border-top-width: ${px(1)};
  border-color: ${({ $isOpen, $active }) => ($isOpen || $active) && colors.primary} !important;

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
        border-color: ${colors.primaryHovered};
      }
    `;
  }};

  ${(p) =>
    p.$disabled &&
    css`
      svg {
        fill: ${colors.primaryDisabled};
      }
    `}

  ${(p) =>
    p.error &&
    css`
      background-color: ${colors.statusError10};
      border-color: ${colors.statusError10} !important;
      svg {
        fill: ${colors.statusErrorText};
      }
    `}
`;

type Point = [number, number];

type MenuContainerPosition = 'auto' | 'top' | 'bottom';

interface MenuContainerProps {
  point: Point;
  position: MenuContainerPosition;
  width: number;
  itemHeight: number;
  maxVisibleMenuItems: number;
  $backgroundType: BackgroundType;
}

const getMenuContainerStyles = ({
  position,
  point,
  width,
  itemHeight,
}: MenuContainerProps): React.CSSProperties => {
  const style: React.CSSProperties = {};

  style.left = px(point[0]);
  style.width = px(width);

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
  border: ${px(MENU_CONTAINER_BORDER_WIDTH)} solid ${colors.primary};
  z-index: 1001;
  box-sizing: border-box;
  background-color: ${({ $backgroundType }) =>
    $backgroundType === 'light' ? colors.backgroundOnPrimary : colors.background};

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
  icon?: ReactElement;
  tooltip?: string;
  label: string;
  key: T;
  disabled?: boolean;
}

export type DropdownProps<T> = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    items?: DropdownItem<T>[];
    activeKey?: T;
    onChange?: (key: T) => void;
    className?: string;
    menuClassName?: string;
    direction?: MenuContainerPosition;
    menuItemComponent?: React.ComponentType<ClickableProps>;
    arrowIcon?: ReactElement;
    placeholder?: string;
    placeholderTextColor?: SpecColorType;
    backgroundType?: BackgroundType;
    menuItemHeight?: number;
    maxVisibleMenuItems?: number;
    loading?: boolean;
    textColor?: SpecColorType;
    disabled?: boolean;
    checkIcon?: ReactElement;
    hideDisabledItems?: boolean;
    error?: boolean;
    labelComponent?: typeof Label;
  }
>;

const Dropdown = <T extends string | number>({
  items,
  activeKey,
  onChange,
  className,
  menuClassName,
  direction = 'auto',
  menuItemComponent,
  arrowIcon,
  placeholder = '',
  placeholderTextColor = 'textSecondaryGray',
  backgroundType = 'regular',
  menuItemHeight = 56,
  maxVisibleMenuItems = 3,
  loading,
  textColor = 'textPrimary',
  disabled,
  hideDisabledItems,
  error,
  checkIcon,
  labelComponent = Label,
  ...restProps
}: DropdownProps<T>): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const canSetScrollRef = useRef(true);

  const theme = useTheme();

  useDisableElasticScroll(menuRef);

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
        (items?.length ?? 0) * menuItemHeight,
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
  }, [direction, items, menuItemHeight, maxVisibleMenuItems]);

  const maybeUpdateMenuScrollTopByActiveItem = useCallback(() => {
    if (menuRef.current && canSetScrollRef.current) {
      canSetScrollRef.current = false;
      const selectedItemIdx = items?.findIndex(searchItemPredicate) || 0;
      menuRef.current.scrollTop = selectedItemIdx * menuItemHeight - menuItemHeight;
    }
  }, [items, searchItemPredicate, menuItemHeight]);

  useEffect(() => {
    if (isOpen) {
      calcMenuProps();
      maybeUpdateMenuScrollTopByActiveItem();
    } else {
      canSetScrollRef.current = true;
    }
  }, [calcMenuProps, isOpen, maybeUpdateMenuScrollTopByActiveItem]);

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

  useKey('Escape', close, undefined, [close]);

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
  const LabelComponent = labelComponent;

  const selectedItem = items?.find(searchItemPredicate);

  return (
    <Container
      $disabled={disabled}
      ref={containerRef}
      className={className || ''}
      onClick={loading ? _noop : () => (isOpen ? close() : open())}
      {...restProps}
    >
      <ValueItem
        $isOpen={isOpen}
        withIcon={!!selectedItem?.icon}
        $position={position}
        $backgroundType={backgroundType}
        itemHeight={menuItemHeight}
        $active={loading}
        data-testid="value-item"
        $disabled={disabled}
        error={error}
      >
        {selectedItem ? (
          <>
            {selectedItem.icon && <Icon>{selectedItem.icon}</Icon>}
            <LabelComponent textColor={error ? 'statusErrorText' : textColor}>
              {selectedItem.label}
            </LabelComponent>
          </>
        ) : (
          <LabelComponent textColor={disabled ? 'disabled' : placeholderTextColor}>
            {placeholder}
          </LabelComponent>
        )}
        {loading ? (
          <Spinner size="xs" />
        ) : (
          arrowIcon || <DropdownArrowIconStyled $isOpen={isOpen} />
        )}
      </ValueItem>
      <Portal id="dropdown" enabled={isOpen}>
        <MenuContainer
          itemHeight={menuItemHeight}
          ref={menuRef}
          scrollbarTrackColor={theme.colors.background}
          point={point}
          position={position}
          width={width}
          maxVisibleMenuItems={maxVisibleMenuItems}
          $backgroundType={backgroundType}
          data-testid="menu-container"
          className={menuClassName}
        >
          {items
            ?.filter((i) => (hideDisabledItems ? !i.disabled : true))
            .map(({ icon, label, key, tooltip, disabled: dis }) => {
              let item = (
                <ItemComponent
                  key={key}
                  withIcon={!!icon}
                  onClick={() => !dis && onChange?.(key)}
                  $backgroundType={backgroundType}
                  selected={key === activeKey}
                  itemHeight={menuItemHeight}
                  data-testid="menu-item"
                  data-value={key}
                  data-disabled={dis}
                >
                  {icon && <Icon>{icon}</Icon>}
                  <LabelComponent textColor={textColor} disabled={dis}>
                    {label}
                  </LabelComponent>
                  {key === activeKey && (checkIcon || <Checkmark />)}
                </ItemComponent>
              );
              if (tooltip) {
                item = (
                  <Tooltip
                    key={key}
                    content={tooltip}
                    position="r"
                    trigger="hover"
                    arrow
                    horizontalPaddings="l"
                    triggerStyle={{ width: '100%' }}
                  >
                    {item}
                  </Tooltip>
                );
              }
              return item;
            })}
        </MenuContainer>
      </Portal>
    </Container>
  );
};

export default Dropdown;

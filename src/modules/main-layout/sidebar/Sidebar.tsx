import React, { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import useWindowSize from 'react-use/lib/useWindowSize';

import styled, { css, DefaultTheme } from 'styled-components';

import { Path, sectionPathSelector } from 'src/modules/navigation/store';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import {signOut, userNameSelector} from 'src/modules/auth/auth.slice';
import { selectedStudySelector, isLoadingSelector } from 'src/modules/studies/studies.slice';
import {
  DESKTOP_WIDTH_BREAKPOINT,
  LAPTOP_WIDTH_BREAKPOINT,
} from 'src/common/components/SimpleGrid';
import Link from 'src/common/components/Link';
import StudyAvatar from 'src/common/components/StudyAvatar';
import Tooltip from 'src/common/components/Tooltip/Tooltip';
import Button from 'src/common/components/Button';
import Ripple, { useRipple } from 'src/common/components/Ripple';
import { px, typography, colors, animation, boxShadow } from 'src/styles';
import { getRoleLabels } from 'src/modules/auth/userRole';
import { userRoleForStudySelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import SkeletonLoading, { SkeletonPath } from 'src/common/components/SkeletonLoading';

import {
  getSidebarWidth,
  isSidebarMinimized,
  SIDEBAR_MINIMIZED_WIDTH,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_SMALL_SCREEN,
} from './helper';
import {
  isSidebarCollapsedSelector,
  isSidebarForceCollapsedSelector,
  toggleSidebarCollapsed,
} from './sidebar.slice';

import ResizeIcon from 'src/assets/icons/resize.svg';
import SignOutIcon from 'src/assets/icons/sign_out.svg';
import UserAvatarIcon from 'src/assets/icons/user_avatar.svg';
import OverviewIcon from 'src/assets/icons/sidebar/overview.svg';
import DashboardIcon from 'src/assets/icons/sidebar/dashboard.svg';
import TaskIcon from 'src/assets/icons/sidebar/task.svg';
import SubjectIcon from 'src/assets/icons/sidebar/subject.svg';
import StudyDataIcon from 'src/assets/icons/sidebar/study-data.svg';
import EducationIcon from 'src/assets/icons/sidebar/education.svg';
import InLabVisitIcon from 'src/assets/icons/sidebar/in-lab-visit.svg';
import StudySettingsIcon from 'src/assets/icons/sidebar/study-settings.svg';
import DataStatisticsIcon from 'src/assets/icons/sidebar/data-statistics.svg';

type Props = {
  onStudyClick: () => void;
};

type Position = {
  posX: number;
  posY: number;
};

type DesktopType = 'desktop' | 'smallDesktop' | 'laptop';

type Minimizable = { minimized?: boolean };

interface ContainerProps {
  $barWidth: number;
  desktopType: DesktopType;
  isResizeVisible: boolean;
  minimized: boolean;
}

interface MenuItemProps extends Minimizable, React.HTMLAttributes<HTMLDivElement> {
  $barWidth: number;
  desktopType: DesktopType;
  selected?: boolean;
  disabled?: boolean;
}

const INITIAL_POS: Position = { posX: -1000, posY: -1000 };
const BUTTON_WIDTH = 24;
const INITIAL_RESIZE_BTN_POS = `${px(-1000)}`;

const menuItemsRegistry = {
  overview: {
    title: 'Overview',
    icon: <OverviewIcon />,
    section: Path.Overview,
  },
  dashboard: {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    section: Path.Dashboard,
  },
  taskManagement: {
    title: 'Task',
    icon: <TaskIcon />,
    section: Path.TaskManagement,
  },
  subjectManagement: {
    title: 'Subject',
    icon: <SubjectIcon />,
    section: Path.SubjectManagement,
  },
  studyData: {
    title: 'Study Data',
    icon: <StudyDataIcon />,
    section: Path.StudyData
  },
  educationalManagement: {
    title: 'Education',
    icon: <EducationIcon />,
    section: Path.EducationalManagement,
  },
  labVisitManagement: {
    title: 'In Lab Visit',
    icon: <InLabVisitIcon />,
    section: Path.LabVisitManagement,
  },
  studySettings: {
    title: 'Study Settings',
    icon: <StudySettingsIcon />,
    section: Path.StudySettings,
  }
};

const hideDisplayIfMinimized = (minimized = false) =>
  css`
    display: ${minimized ? 'none' : 'block'};
  `;

const getBasePadding = (desktopType: DesktopType) =>
  css`
    padding: ${desktopType === 'desktop' ? px(24) : px(16)};
  `;

const getMenuItemColorsStyles = (theme: DefaultTheme, selected = false, disabled = false) => {
  const color =
    (disabled && theme.colors.disabled) ||
    (selected ? theme.colors.primary : theme.colors.textSecondaryGray);
  return css`
    color: ${color} !important;
    svg {
      fill: ${color};
    }
  `;
};

const getMenuItemTypography = ({ selected, $barWidth, disabled = false }: MenuItemProps) => {
  if ($barWidth === SIDEBAR_WIDTH) {
    return (
      (disabled && typography.bodySmallRegular) ||
      (selected ? typography.bodySmallSemibold : typography.bodySmallRegular)
    );
  }
  return (
    (disabled && typography.bodyXSmallRegular) ||
    (selected ? typography.bodyXSmallSemibold : typography.bodyXSmallRegular)
  );
};

const Container = styled.div.attrs<ContainerProps>(({ $barWidth, desktopType }) => ({
  style: {
    width: px($barWidth),
    paddingTop: desktopType !== 'laptop' ? px(26) : px(8),
  },
}))<ContainerProps>`
  position: relative;
  height: 100%;
  background-color: ${colors.surface};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  border-right: ${px(1)} solid ${colors.background};
  transition: border 150ms ${animation.defaultTiming};
  padding-bottom: ${({ desktopType, minimized }) =>
    (desktopType === 'desktop' && (minimized ? px(30) : px(16))) ||
    (desktopType === 'smallDesktop' && px(14)) ||
    (desktopType === 'laptop' && px(14))};
  ${({ isResizeVisible, theme, desktopType }) =>
    isResizeVisible &&
    desktopType !== 'laptop' &&
    css`
      border-color: ${theme.colors.primary};
    `};
`;

const FadeOutContainer = styled.div<{
  $visible?: boolean;
  $barWidth: number;
  desktopType: DesktopType;
}>`
  transition: opacity 0.3s ${animation.defaultTiming};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;

const StyledAvatar = styled(StudyAvatar)<Minimizable>`
  margin-right: ${({ minimized }) => !minimized && px(16)};
`;

const ResizeButton = styled(Button)`
  position: absolute !important;
  z-index: 1100;
  background-color: ${colors.primary05};
  top: ${px(-1000)};
  left: ${px(-1000)};
`;

const StudyPanel = styled(FadeOutContainer)<Minimizable>`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: ${({ minimized }) => minimized && 'column'};
  text-align: ${({ minimized }) => minimized && 'center'};
  ${({ desktopType }) => getBasePadding(desktopType)};
  margin-bottom: ${({ desktopType }) =>
    (desktopType === 'desktop' && px(32)) ||
    (desktopType === 'smallDesktop' && px(38)) ||
    (desktopType === 'laptop' && px(20))};
  &:hover {
    cursor: pointer;
    ${StyledAvatar} {
      box-shadow: ${boxShadow.avatar};
    }
  }
`;

const StudyName = styled.div<Minimizable & { $barWidth: number }>`
  ${({ $barWidth }) =>
    $barWidth === SIDEBAR_WIDTH ? typography.headingXMedium : typography.bodySmallSemibold};
  margin-top: ${({ minimized }) => !minimized && px(2)};
  word-break: break-word;
  ${({ minimized }) => hideDisplayIfMinimized(minimized)};
  color: ${colors.textPrimaryDark};
`;

const UserPanel = styled(FadeOutContainer)<Minimizable & { disabled?: boolean }>`
  display: flex;
  align-items: ${({ minimized }) => (minimized ? 'center' : 'flex-start')};
  padding-left: ${({ $barWidth }) =>
    ($barWidth === SIDEBAR_WIDTH && px(24)) ||
    ($barWidth === SIDEBAR_WIDTH_SMALL_SCREEN && px(16)) ||
    ($barWidth === SIDEBAR_MINIMIZED_WIDTH && px(0))};
  justify-content: ${({ minimized }) => minimized && 'center'};
  position: relative;
  overflow: hidden;
  height: fit-content;
  flex-direction: column;
  margin-top: ${({ desktopType }) => (desktopType === 'desktop' ? px(8) : px(4))};
  ${({ $barWidth }) =>
    $barWidth === SIDEBAR_WIDTH ? typography.bodyMediumRegular : typography.bodyXSmallRegular};
  color: ${({ disabled }) => (disabled ? colors.textDisabled : colors.onSurface)} !important;
  svg {
    fill: ${({ disabled }) => (disabled ? colors.disabled : colors.textSecondaryGray)};
  }
  margin-bottom: ${px(15)};
`;

const Username = styled.div<Minimizable & { $barWidth: number }>`
  ${({ $barWidth }) =>
    $barWidth === SIDEBAR_WIDTH ? typography.headingXMedium : typography.bodySmallSemibold};
  margin-bottom: ${px(8)};
  ${({ minimized }) => hideDisplayIfMinimized(minimized)};
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const UserRole = styled.div`
  white-space: pre;
`;

const Menu = styled.div`
  height: fit-content;
  overflow: auto;
  position: relative;
`;

const MenuIcon = styled.div<{ $barWidth: number }>`
  position: relative;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  ${({ $barWidth }) => css`
    margin-right: ${($barWidth === SIDEBAR_WIDTH && px(16)) ||
    ($barWidth === SIDEBAR_WIDTH_SMALL_SCREEN && px(8)) ||
    ($barWidth === SIDEBAR_MINIMIZED_WIDTH && px(0))};
  `};
  }
`;

const Title = styled.p<Minimizable & { selected?: boolean }>`
  position: relative;
  z-index: 1000;
  margin: 0;
  ${({ minimized }) => hideDisplayIfMinimized(minimized)}
`;

const BaseItemContainer = styled.div<Omit<MenuItemProps, 'desktopType' | '$barWidth'>>`
  display: flex;
  align-items: center;
  justify-content: ${({ minimized }) => minimized && 'center'};
  flex-direction: ${({ minimized }) => minimized && 'column'};
  position: relative;
  overflow: hidden;
  text-align: ${({ minimized }) => minimized && 'center'};
  z-index: 0;
`;

interface BaseItemProps extends Minimizable, React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  selected?: boolean;
}

const BaseItem: FC<BaseItemProps> = ({
  children,
  selected,
  minimized,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...props
}) => {
  const { rippleProps, rippleTriggerProps, handleRippleOut, handleRippleIn } =
    useRipple<HTMLDivElement>({
      opacity: 1,
      color: 'primaryLightPressed',
    });

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent<HTMLDivElement>) => {
      handleRippleIn(evt);
    },
    [handleRippleIn]
  );

  const handleMouseUp = useCallback(
    (evt: React.MouseEvent<HTMLDivElement>) => {
      if (typeof selected === 'undefined') {
        handleRippleOut(undefined, { force: true });
      }
      onMouseUp?.(evt);
    },
    [selected, handleRippleOut, onMouseUp]
  );

  const handleMouseLeave = useCallback(() => {
    handleRippleOut(undefined, { force: true });
  }, [handleRippleOut]);

  return (
    <BaseItemContainer
      {...props}
      ref={rippleTriggerProps.ref}
      minimized={minimized}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <Ripple {...rippleProps} />
    </BaseItemContainer>
  );
};

const MenuItem = styled(BaseItem)<MenuItemProps>`
  ${({ desktopType }) => getBasePadding(desktopType)};
  ${({ desktopType }) => css`
    height: ${desktopType === 'desktop' ? px(56) : px(40)};
    margin-bottom: ${desktopType !== 'desktop' && px(8)};
  `};
  ${({ selected, disabled, theme }) => getMenuItemColorsStyles(theme, selected, disabled)};
  &:hover {
    cursor: pointer;
    background-color: ${colors.primaryLight};
    ${({ theme }) => getMenuItemColorsStyles(theme, true)};
  }
  pointer-events: ${({ disabled }) => disabled && 'none'};
  ${({ selected, desktopType, $barWidth, disabled }) => {
    const pipeWidth = desktopType === 'desktop' ? 8 : 4;
    const leftByBarWidth = $barWidth - pipeWidth;
    return css`
      ::before {
        content: '';
        height: ${desktopType === 'desktop' ? px(48) : px(32)};
        width: ${px(pipeWidth)};
        border-radius: ${desktopType === 'desktop'
        ? `${px(4)} ${px(0)} ${px(0)} ${px(4)}`
        : `${px(2)} ${px(0)} ${px(0)} ${px(2)}`};
        position: absolute;
        left: ${px(leftByBarWidth)};
        background-color: ${colors.primary};
        color: ${colors.primary};
        z-index: 100;
        display: ${(disabled && 'none') || (selected ? 'block' : 'none')};
      }
    `;
  }}

  > ${Title} {
    ${getMenuItemTypography};
  }
`;

const PanelWrapper = styled.div`
  margin-top: auto;
`;

export interface UserMenuProps {
  desktopType: DesktopType;
  barWidth: number;
  minimized: boolean;
  onSignOut: React.DOMAttributes<HTMLElement>['onClick'];
  onSetTooltipParams?: React.DOMAttributes<HTMLElement>['onMouseEnter'];
  onClearTooltipParams?: React.DOMAttributes<HTMLElement>['onMouseLeave'];
}

export const UserMenu = ({
  desktopType,
  onSignOut,
  barWidth,
  onSetTooltipParams,
  minimized,
  onClearTooltipParams,
}: UserMenuProps) => (
  <Menu onMouseLeave={onClearTooltipParams || (() => {})}>
    <MenuItem
      data-testid="user-profile-signout-action"
      onMouseEnter={onSetTooltipParams || (() => {})}
      $barWidth={barWidth}
      minimized={minimized}
      onClick={onSignOut}
      desktopType={desktopType}
    >
      <MenuIcon $barWidth={barWidth}>
        <SignOutIcon />
      </MenuIcon>
      <Title minimized={minimized}>Sign out</Title>
    </MenuItem>
  </Menu>
);

const Sidebar: React.FC<Props> = ({ onStudyClick }) => {
  const sectionPath = useSelector(sectionPathSelector);
  const username = useAppSelector(userNameSelector);
  const userRoles = useAppSelector(userRoleForStudySelector)?.roles;
  const selectedStudy = useAppSelector(selectedStudySelector);
  const isStudyLoading = useAppSelector(isLoadingSelector);
  const { width: screenWidth } = useWindowSize();
  const [tooltipPos, setTooltipPos] = useState<Position>(INITIAL_POS);
  const [resizeBtnVisible, setResizeBtnVisible] = useState<boolean>(false);
  const [tooltipTitle, setTooltipTitle] = useState<string>('');
  const isUserResize = useAppSelector(isSidebarCollapsedSelector);
  const isUserResizeAllowed = !useAppSelector(isSidebarForceCollapsedSelector);
  const minimized = isSidebarMinimized(screenWidth, isUserResize);
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const resizeBtnRef = useRef<HTMLButtonElement>(null);

  const desktopType: DesktopType = useMemo(() => {
    let result = 'desktop';
    if (screenWidth >= LAPTOP_WIDTH_BREAKPOINT && screenWidth < DESKTOP_WIDTH_BREAKPOINT) {
      result = 'smallDesktop';
    } else if (screenWidth < LAPTOP_WIDTH_BREAKPOINT) {
      result = 'laptop';
    }
    return result as DesktopType;
  }, [screenWidth]);

  const hideResizeBtn = () => {
    if (resizeBtnRef.current) {
      resizeBtnRef.current.style.top = INITIAL_RESIZE_BTN_POS;
      resizeBtnRef.current.style.left = INITIAL_RESIZE_BTN_POS;
    }
    setResizeBtnVisible(false);
  };

  const handleSetResizeButtonPos = (e: React.MouseEvent<HTMLDivElement>) => {
    const { width } = e.currentTarget.getBoundingClientRect();
    if (e.clientX >= width - BUTTON_WIDTH / 2 && e.clientX <= width + BUTTON_WIDTH / 2) {
      if (resizeBtnRef.current) {
        resizeBtnRef.current.style.top = `${e.clientY - BUTTON_WIDTH / 2}px`;
        resizeBtnRef.current.style.left = `${width - BUTTON_WIDTH / 2}px`;
      }
      setResizeBtnVisible(true);
    } else {
      hideResizeBtn();
    }
  };

  const barWidth = useMemo(
    () => getSidebarWidth(screenWidth, isUserResize),
    [screenWidth, isUserResize]
  );

  const { roleLabels } = getRoleLabels(userRoles);

  const handleSetTooltipParams = (
    event: React.MouseEvent<HTMLElement | SVGSVGElement>,
    title: string
  ) => {
    const elementRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const tooltipPosY = elementRect.y + elementRect.height / 2;
    setTooltipPos({ posX: SIDEBAR_MINIMIZED_WIDTH, posY: tooltipPosY });
    setTooltipTitle(title);
  };

  const clearTooltipParams = () => {
    setTooltipTitle('');
    setTooltipPos(INITIAL_POS);
  };

  const toggleBarWidth = () => {
    hideResizeBtn();
    dispatch(toggleSidebarCollapsed());
  };

  const clearResizeBtnPos = () => {
    hideResizeBtn();
  };

  const handleStudyClick = () => {
    onStudyClick();
    setTooltipTitle('');
  };

  const {
    overview,
    dashboard,
    taskManagement,
    subjectManagement,
    studyData,
    educationalManagement,
    labVisitManagement,
    studySettings
  } = menuItemsRegistry;

  const menuItems = [
    overview,
    dashboard,
    taskManagement,
    subjectManagement,
    studyData,
    educationalManagement,
    labVisitManagement,
    studySettings
  ];

  return (
    <Container
      $barWidth={barWidth}
      ref={ref}
      isResizeVisible={resizeBtnVisible && isUserResizeAllowed}
      desktopType={desktopType}
      minimized={minimized}
      id="sidebar"
      onMouseLeave={clearResizeBtnPos}
      onMouseMove={handleSetResizeButtonPos}
    >
      <Tooltip
        position="r"
        show={minimized && !!selectedStudy && !!tooltipTitle}
        arrow
        content={tooltipTitle}
        key={tooltipTitle}
        point={[tooltipPos.posX, tooltipPos.posY]}
      />
      {desktopType !== 'laptop' && isUserResizeAllowed && (
        <ResizeButton
          data-testid='resize-button'
          fill="text"
          rate="icon"
          icon={<ResizeIcon />}
          onClick={toggleBarWidth}
          ref={resizeBtnRef}
          aria-label="Resize"
        />
      )}
      <StudyPanel
        $visible
        $barWidth={barWidth}
        minimized={minimized}
        onClick={handleStudyClick}
        onMouseLeave={clearTooltipParams}
        desktopType={desktopType}
      >
        {isStudyLoading ? (
          <SkeletonLoading>
            <SkeletonPath
              x="0"
              y="0"
              width={40}
              height={40}
              d="M39.2305 27.8106C37.593 35.4309 33.3858 40 20.0787 40C6.53063 40 2.51968 35.503 0.793622 27.8107C0.328504 25.7378 0.0218898 22.6266 0 20.1972C0 17.656 0.310709 14.3417 0.793622 12.1893C2.51968 4.49704 6.53063 0 20 0C33.3858 0 37.593 4.56907 39.2305 12.1893C39.734 14.5323 40 17.2426 40 20.1183C39.9835 22.9703 39.7179 25.5428 39.2305 27.8106Z"
            />
          </SkeletonLoading>
        ) : (
          <>
            <StyledAvatar
              minimized={minimized}
              color={selectedStudy?.color || 'disabled'}
              onMouseEnter={(e) => handleSetTooltipParams(e, selectedStudy?.name || '')}
            />
            <StudyName $barWidth={barWidth} minimized={minimized}>
              {selectedStudy?.name || ''}
            </StudyName>
          </>
        )}
      </StudyPanel>
      <Menu onMouseLeave={clearTooltipParams}>
        {menuItems.map(({ title, icon, section }) => (
          <Link to={section} key={section}>
            <MenuItem
              minimized={minimized}
              selected={sectionPath === section}
              onMouseEnter={(e) => handleSetTooltipParams(e, title)}
              $barWidth={barWidth}
              desktopType={desktopType}
            >
              <MenuIcon $barWidth={barWidth}>{icon}</MenuIcon>
              <Title minimized={minimized} selected={sectionPath === section}>
                {title}
              </Title>
            </MenuItem>
          </Link>
        ))}
      </Menu>
      <PanelWrapper>
        <UserMenu
          barWidth={barWidth}
          onClearTooltipParams={clearTooltipParams}
          onSetTooltipParams={(e) => handleSetTooltipParams(e, 'Sign out')}
          minimized={minimized}
          onSignOut={signOut}
          desktopType={desktopType}
        />
        <UserPanel
          $visible={!!roleLabels || !!username}
          minimized={minimized}
          $barWidth={barWidth}
          onMouseLeave={clearTooltipParams}
          desktopType={desktopType}
        >
          <Username minimized={minimized} $barWidth={barWidth}>
            {username}
          </Username>
          {minimized ? (
            <UserAvatarIcon onMouseEnter={(e) => handleSetTooltipParams(e, username || '')} />
          ) : (
            <UserRole>{roleLabels}</UserRole>
          )}
        </UserPanel>
      </PanelWrapper>
    </Container>
  );
};

export default Sidebar;

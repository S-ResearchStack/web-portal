import React, { useCallback } from 'react';
import styled from 'styled-components';
import { colors, px, typography } from 'src/styles';

import { useAppDispatch, useAppSelector } from 'src/modules/store';
import { userNameSelector } from 'src/modules/auth/auth.slice';
import { getRoleLabel, UserRole } from 'src/modules/auth/userRole';

import ProfileIcon from 'src/assets/icons/user_avatar.svg';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { UserMenu, UserMenuProps } from 'src/modules/main-layout/sidebar/Sidebar';
import { SIDEBAR_WIDTH } from 'src/modules/main-layout/sidebar/helper';
import { signout } from 'src/modules/auth/auth.slice.signout';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const UserProfileMenuContainer = styled.div`
  transform: translate(${px(-24)}, ${px(-8)});
  width: ${px(SIDEBAR_WIDTH)};
  display: none;
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${px(16)};

  > svg {
    fill: ${colors.primary};
  }
`;

const UserBlock = styled.div`
  position: absolute;
  left: ${px(48)};
  bottom: ${px(32)};
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &:hover ${UserProfileMenuContainer} {
    display: block;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${px(12)};
`;

const UserName = styled.span`
  ${typography.bodyLargeSemibold}
`;

const Role = styled.span`
  ${typography.bodyMediumRegular};
  color: ${colors.onSurface};
`;

const Delimiter = styled.span`
  height: ${px(20)};
  border-left: ${px(1)} solid ${colors.onDisabled};
`;

type UserProfileMenuProps = Pick<UserMenuProps, 'onSignOut'>;

const UserProfileMenu = ({ onSignOut }: UserProfileMenuProps) => (
  <UserProfileMenuContainer>
    <UserMenu
      barWidth={SIDEBAR_WIDTH}
      desktopType="desktop"
      minimized={false}
      onSignOut={onSignOut}
    />
  </UserProfileMenuContainer>
);

interface UserProfileProps extends UserProfileMenuProps {
  userName?: string;
  userRole?: UserRole;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, userRole, onSignOut }) => (
  <UserBlock>
    <UserProfileMenu onSignOut={onSignOut} />
    <UserContainer>
      <ProfileIcon />
      <UserInfo>
        <UserName>{userName}</UserName>
        <Delimiter />
        <Role>{userRole && getRoleLabel(userRole)}</Role>
      </UserInfo>
    </UserContainer>
  </UserBlock>
);

export type StudyLayoutProps = React.PropsWithChildren<{ hideUser?: boolean }>;

const StudyLayout: React.FC<StudyLayoutProps> = ({ hideUser, children }) => {
  const userName = useAppSelector(userNameSelector);
  const userRole = useAppSelector(userRoleSelector);
  const dispatch = useAppDispatch();

  const handleSignOut = useCallback(() => dispatch(signout()), [dispatch]);

  return (
    <Layout>
      <Content>{children}</Content>
      {!hideUser && (
        <UserProfile userName={userName} userRole={userRole} onSignOut={handleSignOut} />
      )}
    </Layout>
  );
};

export default StudyLayout;

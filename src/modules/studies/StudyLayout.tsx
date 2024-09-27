import React from 'react';
import { SIDEBAR_WIDTH } from 'src/modules/main-layout/sidebar/helper';
import styled from 'styled-components';
import { colors, px, typography } from 'src/styles';

import { useAppSelector } from 'src/modules/store';
import {signOut, userNameSelector} from 'src/modules/auth/auth.slice';
import { isTeamAdmin } from 'src/modules/auth/userRole';

import ProfileIcon from 'src/assets/icons/user_avatar.svg';
import { userRoleForStudySelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { UserMenu, UserMenuProps } from 'src/modules/main-layout/sidebar/Sidebar';

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
  color: ${colors.onSurface};

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
  userRole: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, userRole, onSignOut }) => (
  <UserBlock>
    <UserProfileMenu onSignOut={onSignOut} />
    <UserContainer>
      <ProfileIcon />
      <UserInfo>
        <UserName>{userName}</UserName>
        <Delimiter />
        <Role>{userRole}</Role>
      </UserInfo>
    </UserContainer>
  </UserBlock>
);

export type StudyLayoutProps = React.PropsWithChildren;

const StudyLayout: React.FC<StudyLayoutProps> = ({ children }) => {
  const userName = useAppSelector(userNameSelector);
  const userRoles = useAppSelector(userRoleForStudySelector)?.roles;

  const teamLevelRole =
    ((!userRoles || !userRoles.length) && '') ||
    (isTeamAdmin(userRoles) ? 'Team Admin' : 'Team Member');

  return (
    <Layout>
      <Content>{children}</Content>
      <UserProfile userName={userName} userRole={teamLevelRole} onSignOut={signOut} />
    </Layout>
  );
};

export default StudyLayout;

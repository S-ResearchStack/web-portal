import React, { FC, useCallback, useMemo, useState } from 'react';

import styled from 'styled-components';

import Button from 'src/common/components/Button';
import IconButton from 'src/common/components/IconButton';
import Table, { ColumnOptions, getColumnWidthInPercents } from 'src/common/components/Table';
import Card, { TitleContainer } from 'src/common/components/Card';
import { px, typography } from 'src/styles';
import Indicator from 'src/common/components/Indicator';
import { SIDEBAR_MINIMIZED_WIDTH } from 'src/modules/main-layout/sidebar/helper';
import Tooltip from 'src/common/components/Tooltip';
import ServiceScreen from 'src/common/components/ServiceScreen';
import {
  getRoleTextByRoleId,
  getStatusTextByStatusId,
  getStatusTypeByStatusId,
} from 'src/modules/study-settings/utils';
import { BASE_TABLE_BODY_HEIGHT } from 'src/common/components/Table/BaseTable';
import PlusIcon from 'src/assets/icons/plus_small.svg';
import CloseIcon from 'src/assets/icons/cross.svg';
import {
  openInviteEditMember,
  StudyMember,
  StudyMembersListSort,
  useStudySettingsMembersList,
} from './studySettings.slice';
import { useSelectedStudyId } from '../studies/studies.slice';
import { useAppDispatch } from '../store';

const CardContainer = styled(Card)`
  padding-top: ${px(16)} !important;
  height: ${px(528)};
  max-height: ${px(528)};
  min-width: ${px(768 - SIDEBAR_MINIMIZED_WIDTH)};
  p {
    padding-top: ${px(8)};
  }
  & > ${TitleContainer} {
    height: ${px(72)};
  }
`;

const InviteMemberButton = styled(Button)`
  svg {
    margin-right: ${px(4)};
  }
`;

const MembersTable = styled(Table)`
  margin-right: 0;
` as typeof Table;

const EditButton = styled(Button)`
  height: ${px(28)};
  &:hover,
  &:hover:active {
    background-color: transparent;
  }

  > div {
    ${typography.bodyXSmallSemibold};
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled(Indicator)`
  margin-right: ${px(8)};
` as typeof Indicator;

interface StudySettingsMembersListProps {
  shouldShowInviteTooltip: boolean;
  canShowInviteTooltip: boolean;
}

const TooltipContentContainer = styled.div`
  span {
    ${typography.bodyXSmallSemibold};
    line-height: 150%;
  }
  display: flex;
`;

const TooltipCloseButton = styled(IconButton)`
  width: ${px(16)};
  height: ${px(16)};
  margin-left: ${px(4)};
`;

const TooltipContent: FC<{ onClose: () => void }> = ({ onClose }) => (
  <TooltipContentContainer>
    <span>Start by adding your team members.</span>
    <TooltipCloseButton onClick={onClose} icon={CloseIcon} $size="m" color="updOnPrimary" />
  </TooltipContentContainer>
);

const defaultSorting = {
  column: 'email',
  direction: 'asc',
} as StudyMembersListSort;

const MembersList: FC<StudySettingsMembersListProps> = ({
  shouldShowInviteTooltip,
  canShowInviteTooltip,
}): JSX.Element => {
  const dispatch = useAppDispatch();

  const [isShowingInviteTooltip, setShowingInviteTooltip] = useState(shouldShowInviteTooltip);

  const handleOpenEditMemberDrawer = (id?: string) => {
    dispatch(openInviteEditMember({ id }));
    setShowingInviteTooltip(false);
  };

  const columns: ColumnOptions<StudyMember>[] = [
    {
      dataKey: 'email',
      label: 'Email',
      $width: getColumnWidthInPercents(313.97),
    },
    {
      dataKey: 'name',
      label: 'Name',
      $width: getColumnWidthInPercents(193.4),
    },
    {
      dataKey: 'role',
      label: 'Role',
      $width: getColumnWidthInPercents(187.02),
      render(role) {
        return getRoleTextByRoleId(role as StudyMember['role']);
      },
    },
    {
      dataKey: 'status',
      label: 'Status',
      $width: getColumnWidthInPercents(187.02),
      render: (status) => (
        <StatusContainer>
          <StatusIndicator color={getStatusTypeByStatusId(status as StudyMember['status'])} />
          {getStatusTextByStatusId(status as StudyMember['status'])}
        </StatusContainer>
      ),
    },
    {
      dataKey: 'id',
      $width: getColumnWidthInPercents(46),
      render: (id) => (
        <EditButton
          fill="text"
          rate="small"
          width={28}
          onClick={() => handleOpenEditMemberDrawer(id)}
        >
          EDIT
        </EditButton>
      ),
    },
  ];

  const [sort, setSort] = useState<StudyMembersListSort>(defaultSorting);
  const studyId = useSelectedStudyId();

  const membersList = useStudySettingsMembersList({
    fetchArgs: !!studyId && {
      studyId,
      sort,
    },
  });

  const getRowKey = useCallback((row: StudyMember) => row.id, []);

  const rowsWithProcessing = useMemo(
    () => (membersList.data?.users || []).map((u) => ({ ...u, isProcessing: false })),
    [membersList.data]
  );

  const renderTable = () => {
    if (membersList.error) {
      return <ServiceScreen type="error" />;
    }

    return (
      <MembersTable
        stickyHeader
        columns={columns}
        rows={rowsWithProcessing}
        getRowKey={getRowKey}
        bodyHeight={BASE_TABLE_BODY_HEIGHT}
        sort={{
          sortings: [sort],
          isProcessing: membersList.isSortLoading,
          onSortChange(sortings) {
            setSort(sortings[0]);
          },
        }}
      />
    );
  };

  const handleInviteMemberButtonClick = useCallback(() => {
    dispatch(openInviteEditMember({}));
    setShowingInviteTooltip(false);
  }, [dispatch]);

  const handleTooltipClose = () => {
    setShowingInviteTooltip(false);
  };

  const renderActions = () => (
    <div>
      <Tooltip
        show={canShowInviteTooltip && isShowingInviteTooltip}
        position="bl"
        arrow
        dynamic
        content={<TooltipContent onClose={handleTooltipClose} />}
        styles={{
          maxWidth: px(248),
          transform: `translate(${px(-50)}, ${px(-8)})`,
          pointerEvents: 'all',
        }}
      >
        <InviteMemberButton
          icon={<PlusIcon />}
          width={164}
          fill="text"
          onClick={handleInviteMemberButtonClick}
          rate="small"
        >
          Invite member
        </InviteMemberButton>
      </Tooltip>
    </div>
  );

  const isEmpty = !membersList.data?.users.length;

  return (
    <CardContainer
      title="Members and access"
      subtitle
      action={renderActions()}
      loading={
        (membersList.isLoading && !membersList.isSortLoading) ||
        (membersList.isSortLoading && isEmpty)
      }
      empty={isEmpty && !membersList.isLoading && !!studyId}
      onReload={membersList.refetch}
      error={!!membersList.error}
    >
      {renderTable()}
    </CardContainer>
  );
};

export default MembersList;

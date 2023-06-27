import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import useClickAway from 'react-use/lib/useClickAway';
import useUnmount from 'react-use/lib/useUnmount';
import usePrevious from 'react-use/lib/usePrevious';
import useKey from 'react-use/lib/useKey';
import useStateValidator from 'react-use/lib/useStateValidator';

import _union from 'lodash/union';
import _without from 'lodash/without';
import _xor from 'lodash/xor';
import styled from 'styled-components';

import WarningIcon from 'src/assets/icons/warning.svg';
import DeleteIcon from 'src/assets/icons/trash_can_small.svg';
import LockIcon from 'src/assets/icons/lock.svg';
import Toggle from 'src/common/components/Toggle';
import Drawer from 'src/common/components/Drawer';
import InputField from 'src/common/components/InputField';
import Checkbox from 'src/common/components/CheckBox';
import Button from 'src/common/components/Button';
import Modal, { ModalProps } from 'src/common/components/Modal';
import { userEmailSelector } from 'src/modules/auth/auth.slice';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { colors, px, typography } from 'src/styles';
import {
  closeInviteEditMember,
  editStudyMember,
  inviteStudyMember,
  removeStudyMember,
  useInviteEditMember,
} from './studySettings.slice';
import { useAppDispatch } from '../store';
import { getAccessByRole, getViewRoleByPriority, roleLabelsMap, RoleType } from '../auth/userRole';

const DRAWER_ACTION_BUTTON_WIDTH = 164;

interface MemberAccess {
  key: string;
  label?: string;
  children?: MemberAccess[];
  data?: string[];
}

interface MemberRole {
  id: RoleType;
  label: string;
  caption: string;
  access: MemberAccess[];
}

const Container = styled.div`
  padding: ${px(48)};
  color: ${colors.textPrimary};
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: auto;
`;

const Header = styled.div<{ hide?: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background-color: ${colors.surface};
  padding-bottom: ${px(10)};
`;

const Title = styled.div`
  ${typography.headingLargeSemibold};
  padding-top: ${px(58)};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: ${px(50)};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  flex: 1;
`;

const SubTitle = styled.div<{ big?: boolean }>`
  ${({ big }) => (big ? typography.bodyLargeSemibold : typography.headingXMedium)};
`;

const SectionSubTitle = styled.div`
  ${typography.bodyMediumSemibold};
`;

const AccessColumn = styled.div`
  height: ${px(50)};
  margin-bottom: ${px(16)};
`;

const Warning = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.statusWarningText};
  display: flex;
  align-items: center;
  column-gap: ${px(8)};
  height: ${px(24)};
`;

const StyledWarningIcon = styled(WarningIcon)`
  path {
    fill: ${colors.statusWarning};
  }
`;

const SubTitleDescription = styled.div`
  ${typography.bodySmallRegular};
`;

const Column = styled.div`
  > div {
    margin-bottom: ${px(16)};
  }
  > div:first-child {
    min-height: ${px(140)};
  }

  > div:nth-child(2) {
    min-height: ${px(100)};
  }
`;

const StyledInputField = styled(InputField)`
  width: ${px(380)};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  column-gap: ${px(24)};
`;

const Section = styled.div<{ paddingTop?: number; paddingBottom?: number; gap?: number }>`
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: ${({ gap }) => px(gap || 32)};
  padding-bottom: ${({ paddingBottom }) => paddingBottom && px(paddingBottom)};
  padding-top: ${({ paddingTop }) => paddingTop && px(paddingTop)};

  :not(:last-child) {
    border-bottom: ${px(1)} solid rgba(68, 117, 227, 0.2); // TODO unknown color
  }
`;

const Role = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${px(13)};
`;

const RoleLabel = styled.div`
  ${typography.bodySmallSemibold};
  margin-bottom: ${px(10)};
  line-height: ${px(20)};
  border-radius: ${px(4)};
`;

const RoleCaption = styled.div`
  ${typography.bodySmallRegular};
  line-height: ${px(20)};
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: ${px(12)};
  & ${RoleLabel} {
    margin-bottom: ${px(16)};
  }
  > label {
    grid-template-columns: ${px(16)} 1fr;
    > div {
      &:first-child {
        width: ${px(20)};
        height: ${px(38)};
      }
    }
  }
`;

const ManagementAccess = styled.div`
  width: 100%;
  height: ${px(82)};
  background-color: rgba(68, 117, 227, 0.05); // TODO unknown color
  color: ${colors.black60};
  ${typography.bodySmallRegular};
  padding: ${px(20)} ${px(16)} 0 ${px(16)};
  margin-top: ${px(12)};
`;

const AccessLabel = styled.div<{ $checked: boolean }>`
  color: ${({ $checked, theme }) => $checked && theme.colors.primary};
  margin-left: ${px(3)};
  > div {
    &:first-child {
      ${typography.bodySmallSemibold};
      padding-bottom: ${px(8)};
    }
  }
`;

const DataAccessHint = styled.div`
  ${typography.bodySmallRegular};
`;

const DataAccessLabel = styled.div`
  line-height: ${px(21)};
  ${typography.bodySmallSemibold};
  margin-bottom: ${px(6)};
`;

const Ul = styled.ul`
  margin: 0;
  padding: 0;
`;

const Li = styled.li`
  ${typography.bodySmallRegular};
  list-style: none;
  line-height: ${px(16)};
  margin-bottom: ${px(5)};

  ::before {
    content: '\\2022';
    font-weight: bold;
    display: inline-block;
    width: ${px(20)};
    text-align: center;
  }
`;

const DeleteButton = styled(Button)`
  margin-left: auto;
  > div {
    > svg {
      margin-right: ${px(4)};
    }
  }
`;

const rolesList: MemberRole[] = [
  {
    id: 'principal-investigator',
    label: roleLabelsMap['principal-investigator'],
    caption: 'Principal Investigator has full control of the study',
    access: [
      {
        key: 'pi-1',
        children: [
          {
            key: 'pi-study-overview',
            label: 'Study Overview',
            data: [
              'View study progress',
              'View participant dropout',
              'View participant enrollment',
              'View task compliance',
            ],
          },
          {
            key: 'pi-doc-management',
            label: 'Document Management',
            data: ['View education content', 'Edit education content', 'Publish education content'],
          },
          {
            key: 'pi-members-access',
            label: 'Members and Access',
            data: ['View member list', 'Edit member access', 'Remove member'],
          },
        ],
      },
      {
        key: 'pi-2',
        children: [
          {
            key: 'pi-participant-management',
            label: 'Participant Management',
            data: [
              'View participant list',
              'View individual data',
              'View in-lab visit record',
              'Edit in-lab visit record',
              'Download in-lab visit files',
            ],
          },
          {
            key: 'pi-sensor-data',
            label: 'Sensor Data Highlights',
            data: ['View sensor data highlights'],
          },
        ],
      },
      {
        key: 'pi-3',
        children: [
          {
            key: 'pi-task-management',
            label: 'Task Management',
            data: [
              'Create a survey/activity task',
              'Edit a survey/activity task',
              'Publish a survey/activity task',
              'View survey/activity task result',
              'View survey/activity task analytics',
            ],
          },
          {
            key: 'pi-data-query',
            label: 'Data Query',
            data: ['Run query', 'Export .csv'],
          },
        ],
      },
    ],
  },
  {
    id: 'research-assistant',
    label: roleLabelsMap['research-assistant'],
    caption: 'Access to most aspects of the study.',
    access: [
      {
        key: 'ra-1',
        children: [
          {
            key: 'ra-study-overview',
            label: 'Study Overview',
            data: [
              'View study progress',
              'View participant dropout',
              'View participant enrollment',
              'View task compliance',
            ],
          },
          {
            key: 'ra-document-management',
            label: 'Document Management',
            data: ['View education content', 'Edit education content', 'Publish education content'],
          },
          {
            key: 'ra-members-access',
            label: 'Members and Access',
            data: ['View member list'],
          },
        ],
      },
      {
        key: 'ra-2',
        children: [
          {
            key: 'ra-participant-management',
            label: 'Participant Management',
            data: [
              'View participant list',
              'View individual data',
              'View in-lab visit record',
              'Edit in-lab visit record',
              'Download in-lab visit files',
            ],
          },
          {
            key: 'ra-sensor-data',
            label: 'Sensor Data Highlights',
            data: ['View sensor data highlights'],
          },
        ],
      },
      {
        key: 'ra-3',
        children: [
          {
            key: 'ra-task-management',
            label: 'Task Management',
            data: [
              'Create a survey/activity task',
              'Edit a survey/activity task',
              'Publish a survey/activity task',
              'View survey/activity task result',
              'View survey/activity task analytics',
            ],
          },
          {
            key: 'ra-data-query',
            label: 'Data Query',
            data: ['Run query', 'Export .csv'],
          },
        ],
      },
    ],
  },
  {
    id: 'data-scientist',
    label: roleLabelsMap['data-scientist'],
    caption: "Access to most aspects of the study except participants' personal information.",
    access: [
      {
        key: 'ds-1',
        children: [
          {
            key: 'ds-study-overview',
            label: 'Study Overview',
            data: [
              'View study progress',
              'View participant dropout',
              'View participant enrollment',
              'View task compliance',
            ],
          },
          {
            key: 'ds-document-management',
            label: 'Document Management',
            data: ['View education content', 'Edit education content', 'Publish education content'],
          },
          {
            key: 'ds-members-access',
            label: 'Members and Access',
            data: ['View member list'],
          },
        ],
      },
      {
        key: 'ds-2',
        children: [
          {
            key: 'ds-participant-management',
            label: 'Participant Management',
            data: ['View participant list', 'View individual data'],
          },
          {
            key: 'ds-sensor-data',
            label: 'Sensor Data Highlights',
            data: ['View sensor data highlights'],
          },
        ],
      },
      {
        key: 'ds-3',
        children: [
          {
            key: 'ds-task-management',
            label: 'Task Management',
            data: [
              'Create a survey/activity task',
              'Edit a survey/activity task',
              'Publish a survey/activity task',
              'View survey/activity task result',
              'View survey/activity task analytics',
            ],
          },
          {
            key: 'ds-data-query',
            label: 'Data Query',
            data: ['Run query', 'Export .csv'],
          },
        ],
      },
    ],
  },
];

interface RoleAccessProps {
  role: string;
}

type NecessaryModalProps =
  | 'open'
  | 'onAccept'
  | 'onDecline'
  | 'acceptProcessing'
  | 'onExited'
  | 'onEnter';

type ConfirmCloseOrRemoveMemberModalProps = Pick<ModalProps, NecessaryModalProps>;

const ConfirmCloseModal: FC<ConfirmCloseOrRemoveMemberModalProps> = ({ ...props }) => (
  <Modal
    {...props}
    title="Unsaved Changes"
    description={[
      'If you leave this page, any changes you have made will be lost. Are you sure you want to leave this page?',
    ]}
    acceptLabel="Leave page"
    declineLabel="Keep editing"
  />
);

const RemoveMemberModal: FC<ConfirmCloseOrRemoveMemberModalProps> = ({ ...props }) => (
  <Modal
    {...props}
    title="Remove Member"
    description={[
      'Are you sure you want to remove the member from this study?',
      <br key="br" />,
      'By doing this, they will no longer have access to the data of this study.',
    ]}
    acceptLabel="Remove"
    declineLabel="Cancel"
  />
);

const RoleAccess: FC<RoleAccessProps> = ({ role }): JSX.Element =>
  role.length ? (
    <>
      <SectionSubTitle>Role-based access</SectionSubTitle>
      <Row>
        {rolesList
          .find((r) => r.id === role)
          ?.access.map((access) => (
            <Column key={access.key}>
              {access.children?.map((child) => (
                <div key={child.key}>
                  <DataAccessLabel key={child.label}>{child.label}</DataAccessLabel>
                  {child.data ? (
                    <Ul>
                      {child.data.map((item) => (
                        <Li key={item}>{item}</Li>
                      ))}
                    </Ul>
                  ) : null}
                </div>
              ))}
            </Column>
          ))}
      </Row>
    </>
  ) : (
    <DataAccessHint>Please select a role to view data access.</DataAccessHint>
  );

interface UseInputArgs<T> {
  initialValue: T;
  validator: (value: T) => boolean;
}

interface UseInputFieldProps<T> {
  value: T;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (evt: React.FocusEvent<HTMLInputElement>) => void;
  error: boolean;
}

interface UseInputOutput<T> {
  value: T;
  isValid: boolean;
  isTouched: boolean;
  setTouched: (touch?: boolean) => void;
  setValue: (value: T) => void;
  inputFieldProps: UseInputFieldProps<T>;
}

interface UseToggleOutput {
  isValid: boolean;
  isTouched: boolean;
}

const useInput = <T extends string>({
  initialValue,
  validator,
}: UseInputArgs<T>): UseInputOutput<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const [isTouched, setTouched] = useState(false);
  const [[isValid]] = useStateValidator<[boolean], T>(value, (state) => [validator(state)]);

  const inputFieldProps: UseInputFieldProps<T> = {
    value,
    onChange: useCallback((evt) => setValue(evt.target.value as T), [setValue]),
    onBlur: useCallback(() => setTouched(true), [setTouched]),
    error: !!value && isTouched && !isValid,
  };

  return {
    value,
    isValid,
    isTouched,
    setTouched: (touch = true) => setTouched(touch),
    setValue,
    inputFieldProps,
  };
};

const useToggle = (): UseToggleOutput => ({ isValid: true, isTouched: true });

interface UseCheckboxArgs<T> {
  initialValue: T[];
  validator: (values: T[]) => boolean;
}

interface UseCheckboxOutput<T> {
  values: T[];
  isValid: boolean;
  isTouched: boolean;
  setTouched: (touch?: boolean) => void;
  resetValues: () => void;
  setValue: (value: T) => void;
  removeValue: (value: T) => void;
}

const useCheckboxArray = <T extends string>({
  initialValue,
  validator,
}: UseCheckboxArgs<T>): UseCheckboxOutput<T> => {
  const [values, setValues] = useState<T[]>(initialValue);
  const [isTouched, setTouched] = useState(false);
  const [[isValid]] = useStateValidator<[boolean], T[]>(values, (state) => [validator(state)]);

  return {
    values,
    isValid,
    isTouched,
    setTouched: (touch = true) => setTouched(touch),
    resetValues: () => setValues(initialValue),
    setValue: (value) => setValues(_union(values, [value])),
    removeValue: (value) => setValues(_without(values, value)),
  };
};

interface UseFormIO {
  isValid: boolean;
  isTouched: boolean;
}

const useForm = (args: UseFormIO[]): UseFormIO => ({
  isValid: args.every((i) => i.isValid),
  isTouched: args.some((i) => i.isTouched),
});

const MemberEditDrawer: FC = () => {
  const dispatch = useAppDispatch();

  const drawerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const inviteOrEditMember = useInviteEditMember();

  const [isOpenDrawer, setOpenDrawer] = useState<boolean>(inviteOrEditMember.isOpen);
  const [isOpenConfirmClose, setOpenConfirmClose] = useState<boolean>(false);
  const [isOpenRemoveMember, setOpenRemoveMember] = useState<boolean>(false);
  const [isRemoveTransaction, setRemoveTransaction] = useState<boolean>(false);
  const [toggleChecked, setToggleChecked] = useState<boolean>(false);

  const userRoles = useSelector(userRoleSelector)?.roles;
  // TODO: not supported by API currently
  const hasMgmtAccess = false;
  const {
    allowRemoveMember,
    // allowMgmtAccess
  } = getAccessByRole(userRoles, hasMgmtAccess);
  // TODO: not supported by API currently
  const allowMgmtAccess = false;

  const isHotkeysDisabled = isOpenConfirmClose || isOpenRemoveMember || !inviteOrEditMember.isOpen;

  const emailField = useInput<string>({
    initialValue: inviteOrEditMember.data?.email || '',
    validator: (value) => /.+@.+\..+/.test(value.trim()),
  });

  const rolesCheckboxes = useCheckboxArray<RoleType>({
    initialValue: inviteOrEditMember.data?.roles || [],
    validator: (values) => values.length > 0,
  });

  const isProjectOwner = rolesCheckboxes.values.includes('principal-investigator');

  useEffect(() => {
    if (inviteOrEditMember.data?.mgmtAccess !== undefined) {
      setToggleChecked(inviteOrEditMember.data?.mgmtAccess);
    }
    if (isProjectOwner) {
      setToggleChecked(isProjectOwner);
    }
  }, [inviteOrEditMember, isProjectOwner]);

  const form = useForm([emailField, rolesCheckboxes, useToggle()]);

  const isEditing = !!inviteOrEditMember.data?.id;

  const userEmail = useSelector(userEmailSelector);
  const isSelfEdit = userEmail === emailField.value;

  const isNetworkProcessing = useMemo(() => {
    const { isSending, isDeleting } = inviteOrEditMember;
    return isSending || isDeleting;
  }, [inviteOrEditMember]);

  const hasChanges = useMemo(() => {
    const data = {
      email: emailField.value,
      roles: rolesCheckboxes.values,
      mgmtAccess: toggleChecked,
    };

    const originalData = isEditing
      ? { ...inviteOrEditMember.data }
      : { email: '', roles: [], mgmtAccess: false };

    return (
      data.email !== originalData.email ||
      _xor(data.roles, originalData.roles).length !== 0 ||
      (allowMgmtAccess && data.mgmtAccess !== originalData.mgmtAccess)
    );
  }, [
    emailField.value,
    rolesCheckboxes.values,
    toggleChecked,
    allowMgmtAccess,
    inviteOrEditMember.data,
    isEditing,
  ]);

  const handleChangeRole = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = evt;

      rolesCheckboxes.setTouched();

      if (target.checked) {
        rolesCheckboxes.setValue(target.value as RoleType);
      } else {
        rolesCheckboxes.removeValue(target.value as RoleType);
      }
    },
    [rolesCheckboxes]
  );

  const handleToggle = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setToggleChecked(evt.target.checked),
    [setToggleChecked]
  );

  const handleCloseAllModals = useCallback(() => {
    if (inviteOrEditMember.isDeleting) {
      return;
    }

    setOpenConfirmClose(false);
    setOpenRemoveMember(false);
  }, [setOpenConfirmClose, setOpenRemoveMember, inviteOrEditMember.isDeleting]);

  const clearUser = useCallback(() => {
    emailField.setValue('');
    emailField.setTouched(false);

    rolesCheckboxes.resetValues();

    setToggleChecked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setToggleChecked]);

  const closeAndClear = useCallback(() => {
    dispatch(closeInviteEditMember());
    clearUser();
  }, [dispatch, clearUser]);

  const handleClose = useCallback(() => {
    if (!inviteOrEditMember.isOpen || isNetworkProcessing) {
      return;
    }

    if (hasChanges && !isOpenConfirmClose) {
      setOpenConfirmClose(true);
      return;
    }

    setOpenDrawer(false);
  }, [
    isNetworkProcessing,
    hasChanges,
    inviteOrEditMember,
    isOpenConfirmClose,
    setOpenConfirmClose,
    setOpenDrawer,
  ]);

  useClickAway(containerRef, () => !isHotkeysDisabled && handleClose());

  const handleCloseConfirm = useCallback(() => {
    if (isOpenConfirmClose && !inviteOrEditMember.isDeleting) {
      setOpenDrawer(false);
      setOpenConfirmClose(false);
    }
  }, [isOpenConfirmClose, setOpenConfirmClose, setOpenDrawer, inviteOrEditMember.isDeleting]);

  const handleRemoveMember = useCallback(() => {
    if (isRemoveTransaction || isNetworkProcessing || !inviteOrEditMember.data?.id) {
      return;
    }

    if (!isOpenRemoveMember) {
      setOpenRemoveMember(true);
      return;
    }

    setRemoveTransaction(true);
    if (inviteOrEditMember.data) {
      dispatch(removeStudyMember({ id: inviteOrEditMember.data.id }));
    }
  }, [
    isRemoveTransaction,
    isOpenRemoveMember,
    setOpenRemoveMember,
    inviteOrEditMember,
    isNetworkProcessing,
    dispatch,
  ]);

  const handleRemoveMemberEnd = () => setRemoveTransaction(false);

  const lastDeletingState = usePrevious(inviteOrEditMember.isDeleting);

  useEffect(() => {
    if (
      !inviteOrEditMember.isDeleting &&
      lastDeletingState !== inviteOrEditMember.isDeleting &&
      !inviteOrEditMember.error
    ) {
      setOpenRemoveMember(false);
      setOpenDrawer(false);
    }
    if (inviteOrEditMember.error) {
      setOpenRemoveMember(false);
    }
  }, [inviteOrEditMember.error, lastDeletingState, inviteOrEditMember.isDeleting]);

  useEffect(() => {
    if (!inviteOrEditMember.isOpen) {
      dispatch(closeInviteEditMember());
    }
  }, [inviteOrEditMember.isOpen, dispatch]);

  const lastSendingState = usePrevious(inviteOrEditMember.isSending);

  useEffect(() => {
    if (
      !inviteOrEditMember.isSending &&
      lastSendingState !== inviteOrEditMember.isSending &&
      !inviteOrEditMember.error
    ) {
      setOpenDrawer(false);
    }
  }, [inviteOrEditMember.error, inviteOrEditMember.isSending, lastSendingState]);

  const sendUser = useCallback(() => {
    if (isNetworkProcessing || !form.isValid || !form.isTouched || !hasChanges) {
      return;
    }

    if (inviteOrEditMember.data?.id && isEditing) {
      dispatch(
        editStudyMember({
          id: inviteOrEditMember.data?.id,
          name: emailField.value,
          email: emailField.value,
          roles: rolesCheckboxes.values,
          mgmtAccess: toggleChecked,
        })
      );
    } else {
      dispatch(
        inviteStudyMember({
          email: emailField.value,
          roles: rolesCheckboxes.values,
          mgmtAccess: toggleChecked,
        })
      );
    }
  }, [
    inviteOrEditMember,
    dispatch,
    rolesCheckboxes,
    isNetworkProcessing,
    form,
    emailField,
    hasChanges,
    toggleChecked,
    isEditing,
  ]);

  useKey('Escape', () => !isHotkeysDisabled && handleClose(), undefined, [
    isHotkeysDisabled,
    handleClose,
  ]);

  useKey('Enter', () => !isHotkeysDisabled && sendUser(), undefined, [isHotkeysDisabled, sendUser]);

  useUnmount(() => {
    closeAndClear();
  });

  useEffect(() => {
    if (inviteOrEditMember.data && inviteOrEditMember.isOpen) {
      emailField.setValue(inviteOrEditMember.data.email || '');
      emailField.setTouched(false);

      rolesCheckboxes.resetValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteOrEditMember.data, inviteOrEditMember.isOpen]);

  useEffect(() => {
    if (!inviteOrEditMember.isOpen) {
      clearUser();
    }
  }, [inviteOrEditMember.isOpen, clearUser]);

  useEffect(() => {
    if (inviteOrEditMember.isOpen) {
      if (drawerRef.current) {
        drawerRef.current.scrollTop = 0;
      }

      containerRef.current?.focus();
    }

    setOpenDrawer(inviteOrEditMember.isOpen);
  }, [inviteOrEditMember.isOpen]);

  const tabIndex = isOpenDrawer && !isOpenRemoveMember && !isOpenConfirmClose ? 0 : -1;
  const ariaHidden = tabIndex < 0;

  const isDataScientist =
    rolesCheckboxes.values.length === 1 && rolesCheckboxes.values[0] === 'data-scientist';

  const managementAccessSection = useMemo(
    () =>
      toggleChecked && rolesCheckboxes.values.length ? (
        <>
          <SectionSubTitle>Management access</SectionSubTitle>
          <AccessColumn>
            <DataAccessLabel>Members and Access</DataAccessLabel>
            <Ul>
              <Li key="Invite members">Invite members</Li>
            </Ul>
          </AccessColumn>
        </>
      ) : null,
    [toggleChecked, rolesCheckboxes.values.length]
  );

  const renderContent = () => (
    <Body>
      <div>
        <Section paddingTop={20} paddingBottom={0}>
          <SubTitle big>Member Information</SubTitle>
          <Row>
            <Column>
              <StyledInputField
                aria-disabled={ariaHidden}
                tabIndex={tabIndex}
                type="email"
                label="Email"
                disabled={isEditing}
                endExtra={isEditing ? { component: <LockIcon />, extraWidth: 24 } : undefined}
                {...emailField.inputFieldProps}
                maxLength={256}
              />
            </Column>
            <Column />
          </Row>
        </Section>

        <Section paddingTop={30} paddingBottom={30} gap={14}>
          <SubTitle>Member Role</SubTitle>
          <SubTitleDescription>
            Select one or more roles based on the day-to-day tasks listed in the{' '}
            <strong>Data Access</strong> section below.
          </SubTitleDescription>
          {rolesList.map((role) => (
            <StyledCheckbox
              aria-disabled={ariaHidden}
              tabIndex={tabIndex}
              key={role.id}
              checked={rolesCheckboxes.values.includes(role.id)}
              value={role.id}
              onChange={handleChangeRole}
            >
              <Role>
                <RoleLabel>{role.label}</RoleLabel>
                <RoleCaption>{role.caption}</RoleCaption>
              </Role>
            </StyledCheckbox>
          ))}
          {allowMgmtAccess && (
            <ManagementAccess>
              <Toggle
                label={
                  <AccessLabel $checked={toggleChecked}>
                    <div>Allow management access</div>
                    <div>
                      With management access, users can invite other team members to the study.
                    </div>
                  </AccessLabel>
                }
                disabled={isProjectOwner}
                checked={toggleChecked}
                onChange={handleToggle}
              />
            </ManagementAccess>
          )}
        </Section>
        <Section paddingTop={26} gap={23}>
          <SubTitle>Data Access</SubTitle>
          {isDataScientist && (
            <Warning>
              <StyledWarningIcon />
              All personal information for participants is hidden.
            </Warning>
          )}
          <RoleAccess role={getViewRoleByPriority(rolesCheckboxes.values)} />
          {managementAccessSection}
        </Section>
      </div>

      {isEditing && !isSelfEdit && allowRemoveMember ? (
        <div>
          <DeleteButton
            aria-disabled={ariaHidden}
            tabIndex={tabIndex}
            color="error"
            type="button"
            fill="text"
            onClick={handleRemoveMember}
            width={247}
            icon={<DeleteIcon />}
            rate="small"
          >
            Remove member from study
          </DeleteButton>
        </div>
      ) : null}
    </Body>
  );

  return (
    <>
      <Drawer ref={drawerRef} open={isOpenDrawer} onExited={closeAndClear} width={900}>
        <Container ref={containerRef} aria-hidden={ariaHidden} tabIndex={tabIndex}>
          <Header>
            <Title>{isEditing ? 'Edit Member' : 'Invite Member'}</Title>
            <Actions>
              <Button
                aria-disabled={ariaHidden}
                tabIndex={tabIndex}
                double="left"
                fill="text"
                color="primary"
                onClick={handleClose}
                disabled={isNetworkProcessing}
                width={DRAWER_ACTION_BUTTON_WIDTH}
              >
                Cancel
              </Button>
              <Button
                aria-disabled={ariaHidden}
                tabIndex={tabIndex}
                fill="solid"
                $loading={inviteOrEditMember.isSending}
                disabled={!form.isValid || !hasChanges}
                onClick={sendUser}
                width={DRAWER_ACTION_BUTTON_WIDTH}
              >
                {isEditing ? 'Save' : 'Invite member'}
              </Button>
            </Actions>
          </Header>
          {renderContent()}
        </Container>
      </Drawer>

      <ConfirmCloseModal
        open={isOpenConfirmClose}
        onAccept={handleCloseConfirm}
        onDecline={handleCloseAllModals}
      />
      <RemoveMemberModal
        open={isOpenRemoveMember}
        onAccept={handleRemoveMember}
        onDecline={handleCloseAllModals}
        acceptProcessing={inviteOrEditMember.isDeleting}
        onExited={handleRemoveMemberEnd}
      />
    </>
  );
};

export default MemberEditDrawer;

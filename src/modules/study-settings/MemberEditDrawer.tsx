import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import _pick from 'lodash/pick';
import _isEqual from 'lodash/isEqual';
import useClickAway from 'react-use/lib/useClickAway';
import useUnmount from 'react-use/lib/useUnmount';
import usePrevious from 'react-use/lib/usePrevious';
import useStateValidator from 'react-use/lib/useStateValidator';
import _union from 'lodash/union';
import _without from 'lodash/without';
import useKey from 'react-use/lib/useKey';

import DeleteIcon from 'src/assets/icons/trash_can_small.svg';
import Drawer from 'src/common/components/Drawer';
import InputField from 'src/common/components/InputField';
import Checkbox from 'src/common/components/CheckBox';
import Button from 'src/common/components/Button';
import Modal, { ModalProps } from 'src/common/components/Modal';
import { colors, px, typography } from 'src/styles';
import {
  closeInviteEditMember,
  editStudyMember,
  inviteStudyMember,
  removeStudyMember,
  useInviteEditMember,
} from './studySettings.slice';
import { useAppDispatch } from '../store';
import { RoleType } from '../auth/userRole';

const DRAWER_ACTION_BUTTON_WIDTH = 164;

interface MemberAccess {
  label: string;
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
  padding: ${px(32)};
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
  ${({ big }) => (big ? typography.headingMedium : typography.headingXMedium)};
`;

const Column = styled.div`
  flex: 1 1 50%;
`;

const StyledInputField = styled(InputField)`
  width: ${px(380)};
`;

const Row = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;

  ${Column} + ${Column} {
    margin-left: ${px(70)};
  }
`;

const Section = styled.div<{ paddingTop?: number; paddingBottom?: number; gap?: number }>`
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: ${({ gap }) => px(gap || 32)};
  padding-bottom: ${({ paddingBottom }) => paddingBottom && px(paddingBottom)};
  padding-top: ${({ paddingTop }) => paddingTop && px(paddingTop)};

  :not(:last-child) {
    border-bottom: ${px(1)} solid ${colors.disabled};
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
`;

const RoleCaption = styled.div`
  ${typography.bodySmallRegular};
  line-height: ${px(20)};
`;

const StyledCheckbox = styled(Checkbox)`
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

const DataAccessHint = styled.div`
  ${typography.headingXSmall};
`;

const DataAccessTitle = styled.div`
  ${typography.headingXSmall};
  margin-bottom: ${px(20)};
  line-height: ${px(14)};
`;

const DataAccessLabel = styled.div`
  line-height: ${px(14)};
  ${typography.bodySmallRegular};
  margin-bottom: ${px(4)};
`;

const Ul = styled.ul`
  margin: 0;
  margin-bottom: ${px(24)};
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

const IGNORE_ROLE_PREFIX = '_ignore_'; // TODO: remove mock

const rolesList: MemberRole[] = [
  {
    id: 'researcher',
    label: 'Principal Investigator',
    caption: 'Principal Investigator has full control of the study',
    access: [
      {
        label: 'Study Management',
        children: [
          {
            label: 'Participant Management',
            data: ['View participant list', 'View individual data'],
          },
          {
            label: 'Survey Management',
            data: [
              'Create a survey',
              'Publish a survey',
              'View survey responses',
              'View survey analytics',
            ],
          },
        ],
      },
      {
        label: 'Data Insights',
        children: [
          { label: 'Sensor Data Highlights', data: ['View sensor data highlights'] },
          { label: 'Data Query', data: ['Run query', 'Export .csv'] },
        ],
      },
      {
        label: 'Study Settings',
        children: [
          {
            label: 'Role-Based Access Control',
            data: ['Invite member', 'Edit member access', 'Remove member'],
          },
        ],
      },
    ],
  },
  {
    // TODO: remove mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: `${IGNORE_ROLE_PREFIX}assistant` as any,
    label: 'Research Assistant',
    caption: 'Research asssistant has access to the participants data.',
    access: [],
  },
  {
    // TODO: remove mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: `${IGNORE_ROLE_PREFIX}dataScientist` as any,
    label: 'Data Scientist',
    caption: 'Data scientist has access to essential features for data analysis.',
    access: [],
  },
];

interface RoleAccessProps {
  roles: string[];
}

type ConfirmCloseOrRemoveMemberModalProps = Pick<
  ModalProps,
  'open' | 'onAccept' | 'onDecline' | 'acceptProcessing' | 'onExited' | 'onEnter'
>;

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

const RoleAccess: FC<RoleAccessProps> = ({ roles }): JSX.Element =>
  (roles.length ? (
    roles.map((role) => (
      <Row key={role}>
        {rolesList
          .find((r) => r.id === role)
          ?.access.map((access) => (
            <Column key={access.label}>
              <DataAccessTitle>{access.label}</DataAccessTitle>
              {access.children?.map((child) => (
                <React.Fragment key={child.label}>
                  <DataAccessLabel>{child.label}</DataAccessLabel>
                  {child.data ? (
                    <Ul>
                      {child.data.map((item) => (
                        <Li key={item}>{item}</Li>
                      ))}
                    </Ul>
                  ) : null}
                </React.Fragment>
              ))}
            </Column>
          ))}
      </Row>
    ))
  ) : (
    <Row>
      <Column>
        <DataAccessHint>Please select a role to view data access.</DataAccessHint>
      </Column>
    </Row>
  )) as JSX.Element;

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

  const isHotkeysDisabled = isOpenConfirmClose || isOpenRemoveMember || !inviteOrEditMember.isOpen;

  const emailField = useInput<string>({
    initialValue: inviteOrEditMember.data?.email || '',
    validator: (value) => /.+@.+\..+/.test(value.trim()),
  });

  const rolesCheckboxes = useCheckboxArray<string>({
    initialValue: [rolesList[0].id],
    validator: (values) => values.length > 0,
  });

  const form = useForm([emailField, rolesCheckboxes]);

  const isEditing = !!inviteOrEditMember.data?.id;

  const isNetworkProcessing = useMemo(() => {
    const { isSending, isDeleting } = inviteOrEditMember;
    return isSending || isDeleting;
  }, [inviteOrEditMember]);

  const hasChanges = useMemo(
    // @TODO add normal logic for roles
    () => {
      const data = {
        email: emailField.value,
        roles: rolesCheckboxes.values,
      };

      const checkProps = ['email'];

      return !_isEqual(
        _pick(data, checkProps),
        _pick(
          {
            ...inviteOrEditMember.data,
            roles: [inviteOrEditMember.data?.role],
          },
          checkProps
        )
      );
    },
    [rolesCheckboxes.values, emailField.value, inviteOrEditMember.data]
  );

  const handleChangeRole = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = evt;

      rolesCheckboxes.setTouched();

      if (target.checked) {
        rolesCheckboxes.setValue(target.value);
      } else {
        rolesCheckboxes.removeValue(target.value);
      }
    },
    [rolesCheckboxes]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!inviteOrEditMember.isDeleting && lastDeletingState !== inviteOrEditMember.isDeleting) {
      setOpenRemoveMember(false);
      setOpenDrawer(false);
    }
  }, [lastDeletingState, inviteOrEditMember.isDeleting]);

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
          role: rolesCheckboxes.values[0] as RoleType,
        })
      );
    } else {
      dispatch(
        inviteStudyMember({
          email: emailField.value,
          role: rolesCheckboxes.values[0] as RoleType,
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
    isEditing,
  ]);

  const lastSendingState = usePrevious(inviteOrEditMember.isSending);

  useEffect(() => {
    if (!inviteOrEditMember.isSending && lastSendingState !== inviteOrEditMember.isSending) {
      setOpenDrawer(false);
    }
  }, [inviteOrEditMember.isSending, lastSendingState]);

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

  const renderContent = () => (
    <Body>
      <div>
        <Section paddingTop={20} paddingBottom={20}>
          <SubTitle big>Member Information</SubTitle>
          <Row>
            <Column>
              <StyledInputField
                aria-disabled={ariaHidden}
                tabIndex={tabIndex}
                type="email"
                label="Email"
                {...emailField.inputFieldProps}
              />
            </Column>
            <Column />
          </Row>
        </Section>

        <Section paddingTop={30} paddingBottom={35} gap={14}>
          <SubTitle>Member Role</SubTitle>
          {rolesList.map((role) => (
            <StyledCheckbox
              aria-disabled={ariaHidden}
              tabIndex={tabIndex}
              key={role.id}
              checked={rolesCheckboxes.values.includes(role.id)}
              value={role.id}
              onChange={(e) => !role.id.startsWith(IGNORE_ROLE_PREFIX) && handleChangeRole(e)} // TODO: remove mock
            >
              <Role>
                <RoleLabel>{role.label}</RoleLabel>
                <RoleCaption>{role.caption}</RoleCaption>
              </Role>
            </StyledCheckbox>
          ))}
        </Section>
        <Section paddingTop={30} gap={25}>
          <SubTitle>Data Access</SubTitle>
          <RoleAccess roles={rolesCheckboxes.values} />
        </Section>
      </div>

      {isEditing ? (
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
      <Drawer ref={drawerRef} open={isOpenDrawer} onExited={closeAndClear}>
        <Container ref={containerRef} aria-hidden={ariaHidden} tabIndex={tabIndex}>
          <Header hide={!!inviteOrEditMember.error}>
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
                {isEditing ? 'Save' : 'Invite Member'}
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

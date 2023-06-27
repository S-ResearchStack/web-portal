import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import useKey from 'react-use/lib/useKey';

import styled from 'styled-components';

import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import StudyAvatar from 'src/common/components/StudyAvatar';
import { SpecColorType } from 'src/styles/theme';
import { colors, px, typography } from 'src/styles';

import ScreenCenteredCard from '../auth/common/ScreenCenteredCard';

const PLACEHOLDER = 'Name your study';

const Content = styled.div`
  height: ${px(412)};
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin: 0 auto ${px(40)};
`;

const LogosWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(127)};
  width: 100%;
  margin: ${px(8)} 0 ${px(42)};
`;

const StyledTextHeading = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimaryDark};
  height: ${px(42)};
`;

const StyledText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  line-height: ${px(25)};
`;

const StyledLogos = styled.div`
  position: relative;
  width: 100%;
  padding-top: ${px(2)};
  height: ${px(72)};
  display: flex;
  justify-content: space-between;
`;

const AvatarWrapper = styled.div<{ $selected?: boolean }>`
  width: ${px(72)};
  height: ${px(72)};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: ${({ $selected }) => !$selected && px(4)};
`;

type AvatarInfo = {
  color: SpecColorType;
  selected?: boolean;
};

type AvatarIdx = number;

export const avatarColors: Array<AvatarInfo> = [
  { color: 'secondarySkyblue' },
  { color: 'secondaryViolet' },
  { color: 'secondaryTangerine' },
  { color: 'secondaryGreen' },
  { color: 'secondaryRed' },
];

type Props = {
  onClick: (name: string, color: SpecColorType) => void;
};

const CreateStudyScreen = ({ onClick }: Props) => {
  const [studyName, setStudyName] = useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarIdx>(-1);
  const [hoveredAvatarId, setHoveredAvatarId] = useState<AvatarIdx>(-1);

  // TODO add hotkeys

  const isAllSet = studyName && selectedAvatarId > -1;

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStudyName(event.target.value);
  }, []);

  const handleClick = async () => {
    if (isAllSet) {
      onClick(studyName, avatarColors[selectedAvatarId].color);
    }
  };

  const handleSetSelected = useCallback((color: AvatarIdx) => {
    setHoveredAvatarId(color);
    setSelectedAvatarId(color);
  }, []);

  const studyAvatarsRef = useRef<HTMLDivElement>(null);
  const studyNameRef = useRef<HTMLInputElement>(null);

  const handleStudyAvatarsFocus = useCallback(() => setHoveredAvatarId(0), []);

  const handleStudyAvatarsBlur = useCallback(() => setHoveredAvatarId(-1), []);

  const handleAvatarMouseEnter = useCallback(
    (avatarId: AvatarIdx) => setHoveredAvatarId(avatarId),
    []
  );

  const handleAvatarMouseLeave = useCallback(
    () => setHoveredAvatarId(selectedAvatarId),
    [selectedAvatarId]
  );

  useKey(
    'Tab',
    (evt) => {
      if (!document.activeElement || document.activeElement === document.body) {
        evt.preventDefault();
        if (evt.shiftKey) {
          studyAvatarsRef.current?.focus();
        } else {
          studyNameRef.current?.focus();
        }
      }
    },
    { target: window },
    []
  );

  useKey(
    'Enter',
    (evt) => {
      if (document.activeElement === studyAvatarsRef.current) {
        evt.preventDefault();
        setSelectedAvatarId(hoveredAvatarId);
        studyAvatarsRef.current?.blur();
        document.body.focus();
      } else {
        handleClick();
      }
    },
    { target: window },
    [hoveredAvatarId, handleClick]
  );

  useKey(
    'ArrowLeft',
    (evt) => {
      if (document.activeElement === studyAvatarsRef.current) {
        evt.preventDefault();
        const nextIdx = (hoveredAvatarId - 1 + avatarColors.length) % avatarColors.length;
        setHoveredAvatarId(nextIdx);
      }
    },
    { target: window },
    [hoveredAvatarId]
  );

  useKey(
    'ArrowRight',
    (evt) => {
      if (document.activeElement === studyAvatarsRef.current) {
        evt.preventDefault();
        const nextIdx = (hoveredAvatarId + 1) % avatarColors.length;
        setHoveredAvatarId(nextIdx);
      }
    },
    { target: window },
    [hoveredAvatarId]
  );

  return (
    <ScreenCenteredCard width={55.556} minWidth={666} ratio={0.715} onMainButtonClick={handleClick}>
      <Content>
        <Header>Create Study</Header>
        <InputField
          data-testid="create-study-name"
          ref={studyNameRef}
          type="text"
          label="Study name"
          value={studyName}
          onChange={handleChange}
          tabIndex={0}
          placeholder={PLACEHOLDER}
          maxLength={30}
        />
        <LogosWrapper>
          <StyledTextHeading>
            Study logo
            <StyledText>Select a logo to represent your study</StyledText>
          </StyledTextHeading>
          <StyledLogos
            ref={studyAvatarsRef}
            tabIndex={0}
            onFocus={handleStudyAvatarsFocus}
            onBlur={handleStudyAvatarsBlur}
          >
            {avatarColors.map((avatar, idx: AvatarIdx) => (
              <AvatarWrapper $selected={selectedAvatarId === idx} key={avatar.color}>
                <StudyAvatar
                  data-testid="create-study-avatar"
                  key={avatar.color}
                  color={avatar.color}
                  size="m"
                  $selected={selectedAvatarId === -1 ? undefined : selectedAvatarId === idx}
                  faded={selectedAvatarId === idx || hoveredAvatarId === idx}
                  onMouseEnter={() => handleAvatarMouseEnter(idx)}
                  onMouseLeave={handleAvatarMouseLeave}
                  onClick={() => handleSetSelected(idx)}
                />
              </AvatarWrapper>
            ))}
          </StyledLogos>
        </LogosWrapper>
        <Button
          data-testid="switch-select-role"
          disabled={!isAllSet}
          onClick={handleClick}
          fill="solid"
        >
          Continue
        </Button>
      </Content>
    </ScreenCenteredCard>
  );
};

export default CreateStudyScreen;

import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useKey from 'react-use/lib/useKey';
import styled from 'styled-components';

import { Path } from 'src/modules/navigation/store';
import { useAppDispatch } from 'src/modules/store';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { NEW_STUDY_QUERY_PARAM_NAME } from 'src/modules/study-settings/StudySettings';
import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import StudyAvatar from 'src/common/components/StudyAvatar';
import { createStudy } from 'src/modules/studies/studies.slice';
import { SpecColorType } from 'src/styles/theme';
import { colors, px, typography } from 'src/styles';
import ScreenCenteredCard from './ScreenCenteredCard';

const PLACEHOLDER = 'Enter your study name';

const MainWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  @media (max-height: ${px(475)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${px(665)}) {
    overflow-x: scroll;
  }
`;

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
  color: ${colors.textSecondary};
  ${typography.bodySmallRegular};
  margin: ${px(8)} 0 ${px(42)};
`;

const StyledTextHeading = styled.div`
  color: ${colors.updTextPrimaryDark};
  height: ${px(42)};
`;

const StyledText = styled.div`
  color: ${colors.updTextSecondaryGray};
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

const avatarColors: Array<AvatarInfo> = [
  { color: 'secondarySkyblue' },
  { color: 'secondaryViolet' },
  { color: 'secondaryTangerine' },
  { color: 'updSecondaryGreen' },
  { color: 'secondaryRed' },
];

const CreateStudyScreen: React.FC = () => {
  const [studyName, setStudyName] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarIdx>(-1);
  const [hoveredAvatarId, setHoveredAvatarId] = useState<AvatarIdx>(-1);
  const [isStudyNameInputFocused, setIsStudyNameInputFocused] = useState<boolean>(false);
  const history = useHistory();
  const dispatch = useAppDispatch();

  // TODO add hotkeys

  const isAllSet = studyName && selectedAvatarId > -1;

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStudyName(event.target.value);
  }, []);

  const handleClick = async () => {
    if (isAllSet) {
      try {
        setLoading(true);
        await dispatch(
          createStudy({
            name: studyName,
            color: avatarColors[selectedAvatarId].color,
          })
        );

        history.push(`${Path.StudySettings}?${NEW_STUDY_QUERY_PARAM_NAME}=true`);
      } catch (e) {
        applyDefaultApiErrorHandlers(e);
        setLoading(false);
      }
    }
  };

  const handleFocus = useCallback(() => {
    setIsStudyNameInputFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsStudyNameInputFocused(false);
  }, []);

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
      if (isLoading) {
        return;
      }
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
    [isLoading]
  );

  useKey(
    'Enter',
    (evt) => {
      if (isLoading) {
        return;
      }
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
    [hoveredAvatarId, isLoading, handleClick]
  );

  useKey(
    'ArrowLeft',
    (evt) => {
      if (isLoading) {
        return;
      }
      if (document.activeElement === studyAvatarsRef.current) {
        evt.preventDefault();
        const nextIdx = (hoveredAvatarId - 1 + avatarColors.length) % avatarColors.length;
        setHoveredAvatarId(nextIdx);
      }
    },
    { target: window },
    [hoveredAvatarId, isLoading]
  );

  useKey(
    'ArrowRight',
    (evt) => {
      if (isLoading) {
        return;
      }
      if (document.activeElement === studyAvatarsRef.current) {
        evt.preventDefault();
        const nextIdx = (hoveredAvatarId + 1) % avatarColors.length;
        setHoveredAvatarId(nextIdx);
      }
    },
    { target: window },
    [hoveredAvatarId, isLoading]
  );

  return (
    <MainWrapper>
      <ScreenCenteredCard
        width={55.556}
        minWidth={666}
        ratio={0.715}
        onMainButtonClick={handleClick}
      >
        <Content>
          <Header>Create a study</Header>
          <InputField
            ref={studyNameRef}
            type="text"
            label="Study Name"
            value={studyName}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            placeholder={isStudyNameInputFocused ? '' : PLACEHOLDER}
            readOnly={isLoading}
          />
          <LogosWrapper>
            <StyledTextHeading>
              Study Logo
              <StyledText>Please select one to represent your study</StyledText>
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
          <Button disabled={!isAllSet} onClick={handleClick} $loading={isLoading} fill="solid">
            Create Study
          </Button>
        </Content>
      </ScreenCenteredCard>
    </MainWrapper>
  );
};

export default CreateStudyScreen;

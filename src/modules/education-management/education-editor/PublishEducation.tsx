import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import useInterval from 'react-use/lib/useInterval';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import { DateTime, Duration } from 'luxon';
import _range from 'lodash/range';
import styled from 'styled-components';

import BackdropOverlay from 'src/common/components/BackdropOverlay';
import Button from 'src/common/components/Button';
import Fade from 'src/common/components/animations/Fade';
import DatePicker from 'src/common/components/DatePicker';
import Tooltip from 'src/common/components/Tooltip';
import { parseDateTimeToApi, Timestamp } from 'src/common/utils/datetime';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { colors, px, typography } from 'src/styles';
import useShowSnackbar from 'src/modules/snackbar/useShowSnackbar';
import { useParticipantsTimeZones } from 'src/modules/common/participantTimezones.slice';
import { getMaxTimezone } from 'src/modules/common/utils';
import {
  PublishTimeDropdown,
  PublishTimeWithTooltipContainer,
  PublishTimeShell,
  DateInputShell,
  TimeIconStyled,
  InfoIcon,
} from '../../task-management/publish-task/Occurrence';
import { usePublishEducationSlice } from './publishEducation.slice';
import InvalidTime from './InvalidTime';

const Centred = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  padding-top: 27vh;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${px(40)};
  background-color: ${colors.primaryWhite};
  border-radius: ${px(4)};
  width: ${px(587)};
  min-height: ${px(346)};
`;

const Content = styled.div``;

const ContentWrapper = styled.div`
  display: flex;
`;

const StyledPublishTimeShell = styled(PublishTimeShell)`
  margin-left: ${px(8)};
  margin-right: ${px(10)};
`;

const Footer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
  margin-bottom: ${px(40)};
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

interface PublishEducationalContentProps {
  open: boolean;
  onClose: () => void;
}

const PublishEducationalContent: FC<PublishEducationalContentProps> = ({ open, onClose }) => {
  const studyId = useSelectedStudyId();
  const publishEducation = usePublishEducationSlice();
  const participantsTimeZones = useParticipantsTimeZones({
    fetchArgs: !!studyId && { studyId },
  });

  const showSnackbar = useShowSnackbar();

  const [publishDateTime, setPublishDateTime] = useState<Timestamp>(0);
  const [secondsToStart, setSecondsToStart] = useState(0);

  const [minAllowedDateTime, setMinAllowedDateTime] = useState(0);

  const getMinAllowedDateTime = useCallback(() => {
    const maxTz = getMaxTimezone(participantsTimeZones.data);
    const currentTime = DateTime.local({ zone: maxTz.iana });
    let extraMinutes = 30;

    if (currentTime.minute > 30) {
      extraMinutes += 60 - currentTime.minute;
    } else {
      extraMinutes += 30 - currentTime.minute;
    }

    const date = DateTime.fromObject({
      ...currentTime.plus({ minute: extraMinutes }).toObject(),
      second: 0,
      millisecond: 0,
    }).toMillis();

    return date;
  }, [participantsTimeZones.data]);

  const updateMinAllowedDateTime = useCallback(() => {
    const newDate = getMinAllowedDateTime();

    setMinAllowedDateTime(newDate);
  }, [getMinAllowedDateTime]);

  const getMinutesToStart = useCallback(() => {
    const maxTz = getMaxTimezone(participantsTimeZones.data);
    const currentTime = DateTime.local({ zone: maxTz.iana });
    const currentTimeMs = DateTime.fromObject({
      ...currentTime.toObject(),
      millisecond: 0,
    }).toMillis();

    return (publishDateTime - currentTimeMs) / 1000;
  }, [participantsTimeZones.data, publishDateTime]);

  useEffect(() => {
    updateMinAllowedDateTime();
  }, [participantsTimeZones.data, updateMinAllowedDateTime]);

  useUpdateEffect(() => {
    if (open) {
      setPublishDateTime(minAllowedDateTime);
    }
  }, [open]);

  useInterval(
    () => {
      setSecondsToStart(getMinutesToStart());
    },
    !open || !publishDateTime ? null : 1000
  );

  const handleSend = useCallback(async () => {
    if (!studyId || publishEducation.isSending) {
      return;
    }

    const publishDate = DateTime.fromMillis(publishDateTime).toISODate();
    const publishTime = DateTime.fromMillis(publishDateTime).toISOTime()

    await publishEducation.publish(parseDateTimeToApi(publishDate, publishTime));

    if (publishEducation.error) {
      showSnackbar({
        text: 'A server error has occurred while publishing. Please try again.',
        showErrorIcon: true,
        showCloseIcon: true,
        duration: 0,
        actionLabel: 'Retry',
        onAction: handleSend,
      });
    } else {
      onClose();
    }
  }, [onClose, publishDateTime, publishEducation, showSnackbar, studyId]);

  const handlePublishDateChange = useCallback(
    (date: Timestamp) => {
      const currentPublishDateTime = DateTime.fromMillis(publishDateTime);
      const newPublishDateTime = DateTime.fromMillis(date)
        .startOf('day')
        .set({
          hour: currentPublishDateTime.hour,
          minute: currentPublishDateTime.minute,
        })
        .toMillis();

      updateMinAllowedDateTime();

      setPublishDateTime(Math.max(newPublishDateTime, minAllowedDateTime));
    },
    [publishDateTime, updateMinAllowedDateTime, minAllowedDateTime]
  );

  const handlePublishTimeChange = useCallback(
    (minute: number) => {
      setPublishDateTime(
        DateTime.fromMillis(publishDateTime).startOf('day').plus({ minute }).toMillis()
      );
    },
    [publishDateTime]
  );

  const publishTimeList = useMemo(
    () =>
      _range(0, 24 * 60, 30)
        .map(
          (mins) =>
            [
              DateTime.fromMillis(publishDateTime).startOf('day').plus({ minute: mins }),
              mins,
            ] as const
        )
        .filter(([dt]) => dt.toMillis() >= DateTime.fromMillis(minAllowedDateTime).toMillis())
        .map(([dt, mins]) => ({
          label: dt.toFormat('hh:mm a'),
          key: mins,
        })),
    [publishDateTime, minAllowedDateTime]
  );

  const updateExpiredStartDateTime = useCallback(() => {
    const newDate = getMinAllowedDateTime();
    setPublishDateTime(newDate);
    setMinAllowedDateTime(newDate);
  }, [getMinAllowedDateTime]);

  const publishTime = useMemo(
    () =>
      Duration.fromObject({
        hours: DateTime.fromMillis(publishDateTime).hour,
        minutes: DateTime.fromMillis(publishDateTime).minute,
      }).as('minutes'),
    [publishDateTime]
  );

  return (
    <BackdropOverlay id="publish-educational-content" open={open}>
      <Centred>
        <Fade in={open} unmountOnExit>
          <Container data-testid="publish-educational-content">
            <InvalidTime open={secondsToStart < 0} onClose={updateExpiredStartDateTime} />
            <Content>
              <Header>Publish Educational Content</Header>
              <ContentWrapper>
                <DateInputShell label="Publish time">
                  <DatePicker
                    data-testid="date-picker"
                    value={new Date(publishDateTime)}
                    min={new Date(minAllowedDateTime)}
                    onChange={(date) => handlePublishDateChange(date.getTime())}
                  />
                </DateInputShell>
                <StyledPublishTimeShell>
                  <PublishTimeDropdown
                    arrowIcon={<TimeIconStyled />}
                    activeKey={publishTime}
                    items={publishTimeList}
                    onChange={(key) => handlePublishTimeChange(key as number)}
                  />
                </StyledPublishTimeShell>
                <PublishTimeWithTooltipContainer>
                  <Tooltip
                    arrow
                    trigger="hover"
                    position="abr"
                    content="Participant local time when publication will appear in the App."
                    styles={{ width: px(255) }}
                  >
                    <InfoIcon />
                  </Tooltip>
                </PublishTimeWithTooltipContainer>
              </ContentWrapper>
            </Content>
            <Footer>
              <Actions>
                <Button
                  fill="text"
                  onClick={onClose}
                  double="left"
                  width={164}
                  data-testid="decline-button"
                >
                  Cancel
                </Button>
                <Button
                  fill="solid"
                  onClick={handleSend}
                  width={164}
                  $loading={publishEducation.isSending}
                  data-testid="accept-button"
                >
                  Publish
                </Button>
              </Actions>
            </Footer>
          </Container>
        </Fade>
      </Centred>
    </BackdropOverlay>
  );
};

export default PublishEducationalContent;

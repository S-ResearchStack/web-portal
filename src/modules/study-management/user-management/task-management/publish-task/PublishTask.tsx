import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useInterval, useToggle, useUpdateEffect } from 'react-use';

import { DateTime } from 'luxon';
import styled from 'styled-components';

import BackdropOverlay from 'src/common/components/BackdropOverlay';
import Button from 'src/common/components/Button';
import Fade from 'src/common/components/animations/Fade';
import { Timestamp } from 'src/common/utils/datetime';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { colors, px, typography } from 'src/styles';
import { TaskType } from 'src/modules/api';

import { useParticipantsTimeZones } from 'src/modules/study-management/user-management/common/participantTimezones.slice';
import { getMaxTimezone } from 'src/modules/study-management/user-management/common/utils';
import { DurationPeriod, ScheduleFrequency, usePublishTaskSlice } from './publishTask.slice';
import { titleByType } from './utils';
import PublishBanner from './PublishBanner';
import Form from './Form';
import Schedule from './Schedule';
import Series from './Series';
import Occurrence from './Occurrence';
import TimeWarning from './TimeWarning';
import TimeNoLongerValid from './TimeNoLongerValid';
import { DEFAULT_VALID_DURATION_VALUE } from './constants';

const Centred = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: ${px(21)};
  overflow: auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${px(40)};
  background-color: ${colors.primaryWhite};
  border-radius: ${px(4)};
  width: ${px(973)};
  min-height: ${px(857)};
`;

const Content = styled.div``;

const Footer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${px(171)};
`;

const Header = styled.div`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
  margin-bottom: ${px(40)};
`;

const Actions = styled.div<{ timeErrorActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  bottom: 0;
  z-index: ${({ timeErrorActive }) => (timeErrorActive ? 1 : 3)};
`;

const TIME_WARNING_THRESHOLD = 5 * 60;

interface PublishTaskProps {
  open: boolean;
  onClose: () => void;
  type: TaskType;
}

const PublishTask: FC<PublishTaskProps> = ({ open, onClose, type }) => {
  const studyId = useSelectedStudyId();
  const publishTask = usePublishTaskSlice();
  const participantsTimeZones = useParticipantsTimeZones({
    fetchArgs: !!studyId && { studyId },
  });

  const [frequency, setFrequency] = useState<ScheduleFrequency>(ScheduleFrequency.ONE_TIME);
  const [startDateTime, setStartDateTime] = useState<Timestamp>(0);
  const [endDate, setEndDate] = useState<Timestamp>(0);
  const [noExpiration, setNpExpiration] = useToggle(false);
  const [lateResponse, toggleLateResponse] = useToggle(false);
  const [durationPeriodValue, setDurationPeriodValue] = useState(DEFAULT_VALID_DURATION_VALUE);
  const [durationPeriodType, setDurationPeriodType] = useState<DurationPeriod>(DurationPeriod.DAY);
  const [timeWarningHiddenByUser, setTimeWarningHiddenByUser] = useState(false);
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

  const getSecondsToStart = useCallback(() => {
    const maxTz = getMaxTimezone(participantsTimeZones.data);
    const currentTime = DateTime.local({ zone: maxTz.iana });
    const currentTimeMs = DateTime.fromObject({
      ...currentTime.toObject(),
      millisecond: 0,
    }).toMillis();

    return (startDateTime - currentTimeMs) / 1000;
  }, [participantsTimeZones.data, startDateTime]);

  useEffect(() => {
    updateMinAllowedDateTime();
  }, [participantsTimeZones.data, updateMinAllowedDateTime]);

  useUpdateEffect(() => {
    if (open) {
      setStartDateTime(minAllowedDateTime);
      setEndDate(DateTime.fromMillis(minAllowedDateTime).plus({ month: 3 }).toMillis());
      setTimeWarningHiddenByUser(false);
    }
  }, [open]);

  useInterval(
    () => {
      setSecondsToStart(getSecondsToStart());
    },
    !open || !startDateTime ? null : 1000
  );

  const handleSend = useCallback(async () => {
    if (!studyId || publishTask.isSending) {
      return;
    }

    const isOk = await publishTask.publish({
      durationPeriod: durationPeriodType,
      startDate: DateTime.fromMillis(startDateTime).toISODate(),
      endDate: !noExpiration ? DateTime.fromMillis(endDate).toISODate() : undefined,
      publishTime: DateTime.fromMillis(startDateTime).toISOTime(),
      frequency,
      durationPeriodValue,
      lateResponse,
      noExpiration,
      type,
    });

    if (isOk) {
      onClose();
    }
  }, [
    type,
    studyId,
    publishTask,
    startDateTime,
    durationPeriodType,
    noExpiration,
    endDate,
    frequency,
    durationPeriodValue,
    lateResponse,
    onClose,
  ]);

  const handleStartDateChange = useCallback(
    (date: Timestamp) => {
      const timeDt = DateTime.fromMillis(startDateTime);
      const newStartDateTime = DateTime.fromMillis(date)
        .startOf('day')
        .set({
          hour: timeDt.hour,
          minute: timeDt.minute,
        })
        .toMillis();

      updateMinAllowedDateTime();

      setStartDateTime(Math.max(newStartDateTime, minAllowedDateTime));
      setTimeWarningHiddenByUser(false);
    },
    [startDateTime, updateMinAllowedDateTime, minAllowedDateTime]
  );

  const handlePublishTimeChange = useCallback(
    (minute: number) => {
      setStartDateTime(
        DateTime.fromMillis(startDateTime).startOf('day').plus({ minute }).toMillis()
      );
      setTimeWarningHiddenByUser(false);
    },
    [startDateTime]
  );

  const updateExpiredStartDateTime = useCallback(() => {
    const newDate = getMinAllowedDateTime();
    setStartDateTime(newDate);
    setMinAllowedDateTime(newDate);
    setTimeWarningHiddenByUser(false);
  }, [getMinAllowedDateTime]);

  const handleFrequencyChange = useCallback(
    (key: ScheduleFrequency) => {
      if (key !== ScheduleFrequency.ONE_TIME) {
        const endTime = DateTime.fromMillis(startDateTime).plus({ month: 3 }).toMillis();
        setEndDate(endTime);
      }

      setFrequency(key);
    },
    [startDateTime]
  );

  const isTimeWarningHidden = useMemo(
    () => timeWarningHiddenByUser || secondsToStart < 0 || secondsToStart > TIME_WARNING_THRESHOLD,
    [secondsToStart, timeWarningHiddenByUser]
  );

  return (
    <BackdropOverlay id="publish-survey" open={open}>
      <Centred>
        <Fade in={open} unmountOnExit>
          <Container data-testid="publish-survey">
            <TimeNoLongerValid open={secondsToStart < 0} onClose={updateExpiredStartDateTime} />
            <Content>
              <Header>{`Publish ${titleByType(type)}`}</Header>
              <Form>
                <Schedule frequency={frequency} onFrequencyChange={handleFrequencyChange} />
                {frequency !== ScheduleFrequency.ONE_TIME && (
                  <Series
                    noExpiration={noExpiration}
                    startDate={startDateTime}
                    endDate={endDate}
                    minAllowedDate={minAllowedDateTime}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={setEndDate}
                    onChangeExpiration={setNpExpiration}
                  />
                )}
                <Occurrence
                  type={type}
                  frequency={frequency}
                  startDate={startDateTime}
                  endDate={endDate}
                  noExpiration={noExpiration}
                  minAllowedDate={minAllowedDateTime}
                  durationPeriodValue={durationPeriodValue}
                  durationPeriodType={durationPeriodType}
                  onStartDateChange={handleStartDateChange}
                  onPublishTimeChange={handlePublishTimeChange}
                  onDurationPeriodValueChange={setDurationPeriodValue}
                  onDurationPeriodTypeChange={setDurationPeriodType}
                  lateResponse={lateResponse}
                  onLateResponseChange={toggleLateResponse}
                  onPublishTimeClick={updateMinAllowedDateTime}
                />
              </Form>
            </Content>
            <Footer>
              <PublishBanner
                type={type}
                frequency={frequency}
                startDate={startDateTime}
                endDate={endDate}
                durationPeriodValue={durationPeriodValue}
                durationPeriodType={durationPeriodType}
                noExpiration={noExpiration}
              />
              <Actions timeErrorActive={!isTimeWarningHidden}>
                <Button fill="text" onClick={onClose} double="left" width={164}>
                  Cancel
                </Button>
                <Button
                  fill="solid"
                  onClick={handleSend}
                  width={164}
                  $loading={publishTask.isSending}
                >
                  Publish
                </Button>
              </Actions>
              <TimeWarning
                seconds={isTimeWarningHidden ? 0 : secondsToStart}
                onClose={() => setTimeWarningHiddenByUser(true)}
              />
            </Footer>
          </Container>
        </Fade>
      </Centred>
    </BackdropOverlay>
  );
};

export default PublishTask;

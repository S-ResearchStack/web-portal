import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { DateTime } from 'luxon';

import styled from 'styled-components';

import BackdropOverlay from 'src/common/components/BackdropOverlay';
import Button from 'src/common/components/Button';
import Fade from 'src/common/components/animations/Fade';
import { Timestamp } from 'src/common/utils/datetime';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { colors, px, typography } from 'src/styles';

import {
  DurationPeriod,
  ScheduleFrequency,
  useParticipantsTimeZones,
  usePublishSurveySlice,
} from './publishSurvey.slice';
import { getMaxTimezone } from './utils';
import PublishBanner from './PublishBanner';
import Form from './Form';
import SurveySchedule from './SurveySchedule';
import SurveySeries from './SurveySeries';
import SurveyOccurrence from './SurveyOccurrence';
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
  background-color: ${colors.updPrimaryWhite};
  border-radius: ${px(4)};
  width: ${px(973)};
  min-height: ${px(857)};
`;

const Content = styled.div``;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${px(171)};
`;

const Header = styled.div`
  ${typography.headingMedium};
  color: ${colors.updTextPrimary};
  margin-bottom: ${px(40)};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

interface PublishSurveyProps {
  open: boolean;
  onClose: () => void;
}

const PublishSurvey: FC<PublishSurveyProps> = ({ open, onClose }) => {
  const studyId = useSelectedStudyId();
  const publishSurvey = usePublishSurveySlice();
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

  const minAllowedDateTime = useMemo(() => {
    const maxTz = getMaxTimezone(participantsTimeZones.data);
    const currentTime = DateTime.local({ zone: maxTz.iana });
    let extraMinutes = 30;
    if (currentTime.minute > 30) {
      extraMinutes += 60 - currentTime.minute;
    } else {
      extraMinutes += 30 - currentTime.minute;
    }

    return DateTime.fromObject({
      ...currentTime.plus({ minute: extraMinutes }).toObject(),
      second: 0,
      millisecond: 0,
    }).toMillis();
  }, [participantsTimeZones.data]);

  useEffect(() => {
    setStartDateTime(minAllowedDateTime);
    setEndDate(DateTime.fromMillis(minAllowedDateTime).plus({ month: 3 }).toMillis());
  }, [minAllowedDateTime]);

  const handleSend = useCallback(async () => {
    if (!studyId || publishSurvey.isSending) {
      return;
    }

    await publishSurvey.publish({
      durationPeriod: durationPeriodType,
      startDate: DateTime.fromMillis(startDateTime).toISODate(),
      endDate: !noExpiration ? DateTime.fromMillis(endDate).toISODate() : undefined,
      publishTime: DateTime.fromMillis(startDateTime).toISOTime(),
      frequency,
      durationPeriodValue,
      lateResponse,
      noExpiration,
    });

    onClose();
  }, [
    studyId,
    publishSurvey,
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
      setStartDateTime(Math.max(newStartDateTime, minAllowedDateTime));
    },
    [minAllowedDateTime, startDateTime]
  );

  const handlePublishTimeChange = useCallback(
    (minute: number) => {
      setStartDateTime(
        DateTime.fromMillis(startDateTime).startOf('day').plus({ minute }).toMillis()
      );
    },
    [startDateTime]
  );

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

  return (
    <BackdropOverlay id="publish-survey" open={open}>
      <Centred>
        <Fade in={open} unmountOnExit>
          <Container>
            <Content>
              <Header>Publish Survey</Header>
              <Form>
                <SurveySchedule frequency={frequency} onFrequencyChange={handleFrequencyChange} />
                {frequency !== ScheduleFrequency.ONE_TIME && (
                  <SurveySeries
                    noExpiration={noExpiration}
                    startDate={startDateTime}
                    endDate={endDate}
                    minAllowedDate={minAllowedDateTime}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={setEndDate}
                    onChangeExpiration={setNpExpiration}
                  />
                )}
                <SurveyOccurrence
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
                />
              </Form>
            </Content>
            <Footer>
              <PublishBanner
                frequency={frequency}
                startDate={startDateTime}
                endDate={endDate}
                durationPeriodValue={durationPeriodValue}
                durationPeriodType={durationPeriodType}
                noExpiration={noExpiration}
              />
              <Actions>
                <Button fill="text" onClick={onClose} double="left" width={164}>
                  Cancel
                </Button>
                <Button
                  fill="solid"
                  onClick={handleSend}
                  width={164}
                  $loading={publishSurvey.isSending}
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

export default PublishSurvey;

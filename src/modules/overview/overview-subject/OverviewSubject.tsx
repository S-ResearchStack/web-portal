import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import usePrevious from 'react-use/lib/usePrevious';
import _isNumber from 'lodash/isNumber';
import { Duration } from 'luxon';
import SimpleGrid from 'src/common/components/SimpleGrid';
import * as num from 'src/common/utils/number';
import { Path, sectionPathSelector } from 'src/modules/navigation/store';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import GoBackHeader from 'src/modules/study-management/common/GoBackHeader';
import { colors, px } from 'src/styles';
import useHistoryChangeOnce from 'src/modules/study-management/user-management/common/useHistoryChangeOnce';

import LastSyncedTimeView from './LastSyncedTimeView';
import { useOverviewSubject } from './overviewSubject.slice';
import OverviewSubjectCard, { OverviewSubjectCardProps } from './OverviewSubjectCard';
import SubjectInfo from './SubjectInfo';

const Header = styled(GoBackHeader)`
  height: ${px(120)};
`;

const SubjectInfoWrapper = styled.div`
  columns: 2;
  column-gap: ${px(24)};
  color: ${colors.textPrimary};
  margin-bottom: ${px(20)};
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${px(24)};
  margin-bottom: ${px(24)};
`;

const OverviewSubject = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const studyId = useSelectedStudyId();
  const previousStudyId = usePrevious(studyId);
  const isStudyChanged = studyId && previousStudyId && studyId !== previousStudyId;
  const sectionPath = useSelector(sectionPathSelector);
  const history = useHistory();

  const { data, reset } = useOverviewSubject(
    {
      fetchArgs: !isStudyChanged && !!studyId && { id: subjectId, studyId },
    },
    {
      text: "Can't get participant data.",
      showErrorIcon: true,
      actionLabel: 'back',
      onAction: () => history.push(sectionPath || Path.Overview),
      duration: 0,
    }
  );

  useHistoryChangeOnce(reset, [reset]);

  const { avgBpm, avgSteps, avgSleepMins, avgBloodPressure, avgBG, avgSpO2, avgRR } = data || {};
  const avgSleepDuration = useMemo(() => {
    if (!_isNumber(avgSleepMins)) {
      return undefined;
    }

    return Duration.fromObject({
      minutes: avgSleepMins,
    }).shiftTo('hours', 'minutes', 'seconds');
  }, [avgSleepMins]);

  const values: OverviewSubjectCardProps[] = useMemo(
    () =>
      data
        ? [
            {
              cardTitle: 'Avg. Steps',
              values: _isNumber(avgSteps) ? [[num.format(avgSteps), 'steps']] : [],
            },
            {
              cardTitle: 'Avg. Heart Rate',
              values: _isNumber(avgBpm) ? [[num.format(avgBpm), 'bpm']] : [],
            },
            {
              cardTitle: 'Avg. Time in Bed',
              values: avgSleepDuration
                ? [
                    [String(avgSleepDuration.hours), 'hr'],
                    [String(avgSleepDuration.minutes), 'min'],
                  ]
                : [],
            },
            {
              cardTitle: 'Avg. Blood Pressure',
              values: avgBloodPressure ? [[avgBloodPressure, 'mmHg']] : [],
            },
            {
              cardTitle: 'Avg. Blood Glucose Level',
              values: _isNumber(avgBG) ? [[String(avgBG), 'mg/dL']] : [],
            },
            {
              cardTitle: 'Avg. SpO2',
              values: _isNumber(avgSpO2) ? [[String(Math.round(avgSpO2)), '%']] : [],
            },
            {
              cardTitle: 'Avg. Respiration Rate',
              values: _isNumber(avgRR) ? [[String(avgRR), 'bpm']] : [],
            },
          ]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return data ? (
    <>
      <SimpleGrid fullScreen data-testid="overview-subject">
        <Header title="Participant Management" fallbackUrl={sectionPath} />
      </SimpleGrid>
      <SimpleGrid fullScreen>
        <SubjectInfoWrapper>
          <SubjectInfo infoTitle="Subject ID" content={subjectId} />
          <SubjectInfo
            infoTitle="Last Synced"
            content={data.lastSync ? <LastSyncedTimeView time={data.lastSync} /> : null}
          />
        </SubjectInfoWrapper>
      </SimpleGrid>
      <SimpleGrid fullScreen>
        <CardContainer>
          {values.map((cardProps) => (
            <OverviewSubjectCard key={cardProps.cardTitle} {...cardProps} />
          ))}
        </CardContainer>
      </SimpleGrid>
    </>
  ) : null;
};

export default OverviewSubject;

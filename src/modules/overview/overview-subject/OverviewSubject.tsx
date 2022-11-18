import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import usePrevious from 'react-use/lib/usePrevious';
import _isNumber from 'lodash/isNumber';
import { Duration } from 'luxon';
import SimpleGrid from 'src/common/components/SimpleGrid';
import * as num from 'src/common/utils/number';
import { Path, sectionPathSelector } from 'src/modules/navigation/store';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import GoBackHeader from 'src/modules/trial-management/common/GoBackHeader';
import { colors, px } from 'src/styles';

import styled from 'styled-components';
import LastSyncedTimeView from './LastSyncedTimeView';
import { useOverviewSubject } from './overviewSubject.slice';
import OverviewSubjectCard from './OverviewSubjectCard';
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

  const { data } = useOverviewSubject(
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

  const { avgBpm, avgSteps, avgSleepMins, avgBloodPressure } = data || {};
  const avgSleepDuration = useMemo(() => {
    if (!_isNumber(avgSleepMins)) {
      return undefined;
    }

    return Duration.fromObject({
      minutes: avgSleepMins,
    }).shiftTo('hours', 'minutes', 'seconds');
  }, [avgSleepMins]);

  if (!data) {
    return null;
  }

  return (
    <>
      <SimpleGrid fullScreen>
        <Header title="Participant Management" fallbackUrl={sectionPath} />
      </SimpleGrid>
      <SimpleGrid fullScreen>
        <SubjectInfoWrapper>
          <SubjectInfo infoTitle="Subject ID" content={subjectId} />
          <SubjectInfo
            infoTitle="Last Synced"
            content={<LastSyncedTimeView time={data.lastSync} />}
          />
        </SubjectInfoWrapper>
      </SimpleGrid>
      <SimpleGrid fullScreen>
        <CardContainer>
          <OverviewSubjectCard
            cardTitle="Avg. Steps"
            values={_isNumber(avgSteps) ? [[num.format(avgSteps), 'steps']] : []}
          />
          <OverviewSubjectCard
            cardTitle="Avg. Heart Rate"
            values={_isNumber(avgBpm) ? [[num.format(avgBpm), 'bpm']] : []}
          />
          <OverviewSubjectCard
            cardTitle="Avg. Sleep"
            values={
              avgSleepDuration
                ? [
                    [String(avgSleepDuration.hours), 'hr'],
                    [String(avgSleepDuration.minutes), 'min'],
                  ]
                : []
            }
          />
          <OverviewSubjectCard
            cardTitle="Avg. Blood Pressure"
            values={avgBloodPressure ? [[avgBloodPressure, 'mmHg']] : []}
          />
        </CardContainer>
      </SimpleGrid>
    </>
  );
};

export default OverviewSubject;

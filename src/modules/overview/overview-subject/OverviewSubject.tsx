import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import usePrevious from 'react-use/lib/usePrevious';
import _isNumber from 'lodash/isNumber';
import { Duration } from 'luxon';
import { useSelector } from 'react-redux';

import { colors, px } from 'src/styles';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { sectionPathSelector } from 'src/modules/navigation/store';
import SimpleGrid from 'src/common/components/SimpleGrid';
import GoBackHeader from 'src/modules/trial-management/common/GoBackHeader';
import * as num from 'src/common/utils/number';

import LastSyncedTimeView from './LastSyncedTimeView';
import OverviewSubjectCard from './OverviewSubjectCard';
import SubjectInfo from './SubjectInfo';
import { useOverviewSubject } from './overviewSubject.slice';

const Header = styled(GoBackHeader)`
  height: ${px(120)};
`;

const SubjectInfoWrapper = styled.div`
  columns: 2;
  column-gap: ${px(24)};
  color: ${colors.textSecondary};
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

  const overviewSubject = useOverviewSubject({
    fetchArgs: !isStudyChanged && !!studyId && { id: subjectId, studyId },
  });

  const { avgBpm, avgSteps, avgSleepMins } = overviewSubject.data || {};
  const avgSleepDuration = useMemo(() => {
    if (!_isNumber(avgSleepMins)) {
      return undefined;
    }

    return Duration.fromObject({
      minutes: avgSleepMins,
    }).shiftTo('hours', 'minutes', 'seconds');
  }, [avgSleepMins]);

  if (!overviewSubject.data) {
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
            content={<LastSyncedTimeView time={overviewSubject.data.lastSync} />}
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
          <OverviewSubjectCard cardTitle="Avg. Blood Pressure" values={[['120/80', 'mmHg']]} />
        </CardContainer>
      </SimpleGrid>
    </>
  );
};

export default OverviewSubject;

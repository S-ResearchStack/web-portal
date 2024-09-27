import React, { useEffect } from 'react';
import _capitalize from 'lodash/capitalize';

import { Path } from '../navigation/store';
import { useShowSnackbar } from 'src/modules/snackbar';
import { useAppDispatch } from 'src/modules/store';
import { useTranslation } from '../localization/useTranslation';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

import SimpleGrid, { SimpleGridCell } from 'src/common/components/SimpleGrid';
import {
  useStudyOverviewData,
  setStorageLastSeenStatus,
  getStorageLastSeenStatus,
} from './overview.slice';
import BasicInfo from './BasicInfo';
import CardText from './common/CardText';
import CardStage from './CardStage';
import CardList from './common/CardList';

type Props = {
  isSwitchStudy?: boolean;
};

const StudyOverview: React.FC<Props> = ({ isSwitchStudy }) => {
  const { t } = useTranslation();
  const studyId = useSelectedStudyId();
  const { data, isLoading } = useStudyOverviewData({
    fetchArgs: !!studyId && studyId,
    refetchSilentlyOnMount: true,
  });
  const showSnackbar = useShowSnackbar();
  const dispatch = useAppDispatch();

  const lastSeenStatus = studyId ? getStorageLastSeenStatus(studyId) : undefined;
  const { study, subject = [], investigator = [] } = data || {};

  useEffect(() => {
    if (isSwitchStudy) {
      dispatch(hideSnackbar());
    } else if (
      studyId &&
      study?.stage &&
      lastSeenStatus &&
      lastSeenStatus !== study?.stage &&
      study?.id === studyId
    ) {
      showSnackbar({
        id: `${studyId}-${study?.stage}`,
        text: `Study status is updated to “${_capitalize(
          study?.stage
        )}” since the first participant has completed onboarding.`,
        actionLabel: 'OK',
        onAction: (settings) => {
          settings.hideAfterCall = true;
          setStorageLastSeenStatus(studyId, study?.stage);
        },
        duration: 0,
      });
    }
  }, [studyId, study?.stage, lastSeenStatus, showSnackbar, dispatch, study?.id, isSwitchStudy]);

  return (
    <SimpleGrid
      verticalGap
      customSchema={{ desktop: { columnWidth: 100 }, laptop: { columnWidth: 80 } }}
      columns={{ desktop: 4, laptop: 2, tablet: 1 }}
    >
      <SimpleGridCell
        columns={{ desktop: [1, 2], laptop: [1, 1], tablet: [1, 1] }}
        rows={{ desktop: [1, 4], laptop: [1, 5], tablet: [1, 2] }}
      >
        <BasicInfo data={study} isLoading={isLoading} />
      </SimpleGridCell>
      <SimpleGridCell
        columns={{ desktop: [3, 3], laptop: [2, 2], tablet: [1, 1] }}
        rows={{ desktop: [1, 2], laptop: [1, 2], tablet: [2, 3] }}
      >
        <CardText title={t("TITLE_TOTAL_DURATION")} titleTooltip={t('TOOLTIP_TOTAL_ENROLLMENT')} text={study?.totalDuration} isLoading={isLoading} />
      </SimpleGridCell>
      <SimpleGridCell
        columns={{ desktop: [4, 4], laptop: [2, 2], tablet: [1, 1] }}
        rows={{ desktop: [1, 2], laptop: [2, 3], tablet: [3, 4] }}
      >
        <CardStage title={t("TITLE_STAGE")} stage={study?.stage} isLoading={isLoading} />
      </SimpleGridCell>
      <SimpleGridCell
        columns={{ desktop: [3, 4], laptop: [2, 2], tablet: [1, 1] }}
        rows={{ desktop: [2, 3], laptop: [3, 4], tablet: [4, 5] }}
      >
        <CardList title={t('TITLE_INVESTIGATOR')} data={investigator} detailPath={Path.StudySettings} isLoading={isLoading} />
      </SimpleGridCell>
      <SimpleGridCell
        columns={{ desktop: [3, 4], laptop: [2, 2], tablet: [1, 1] }}
        rows={{ desktop: [3, 4], laptop: [4, 5], tablet: [5, 6] }}
      >
        <CardList title={t('TITLE_SUBJECT')} data={subject} detailPath={Path.SubjectManagement} isLoading={isLoading} />
      </SimpleGridCell>
    </SimpleGrid>
  );
};

export default StudyOverview;

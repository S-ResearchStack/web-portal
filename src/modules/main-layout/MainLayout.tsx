import React, { RefObject, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { matchPath, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import useEvent from 'react-use/lib/useEvent';
import useMount from 'react-use/lib/useMount';
import usePrevious from 'react-use/lib/usePrevious';
import useToggle from 'react-use/lib/useToggle';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import styled from 'styled-components';
import { Location } from 'history';
import _isNull from 'lodash/isNull';

import useDisableElasticScroll from 'src/common/useDisableElasticScroll';
import { scrollToTop } from 'src/common/utils/scrollToTop';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { UserRole } from 'src/modules/auth/userRole';
import DataInsights from 'src/modules/data-collection/DataInsights';
import { Path } from 'src/modules/navigation/store';
import Overview from 'src/modules/overview/Overview';
import OverviewSubject from 'src/modules/overview/overview-subject/OverviewSubject';
import { SnackbarContainer } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import Studies from 'src/modules/studies/Studies';
import { fetchStudies, useSelectedStudyId } from 'src/modules/studies/studies.slice';
import StudyManagement from 'src/modules/study-management';
import EducationEditor from 'src/modules/study-management/user-management/education-management/education-editor/EducationEditor';
import ActivityEditor from 'src/modules/study-management/user-management/task-management/activity/activity-editor/ActivityEditor';
import ActivityPage from 'src/modules/study-management/user-management/task-management/activity/ActivityPage';
import SurveyEditor from 'src/modules/study-management/user-management/task-management/survey/survey-editor/SurveyEditor';
import SurveyPage from 'src/modules/study-management/user-management/task-management/survey/SurveyPage';
import StudySettings from 'src/modules/study-settings/StudySettings';
import { colors } from 'src/styles';
import { SWITCH_STUDY_SEARCH_PARAM } from './constants';
import EmptyTab from './EmptyTab';

import { LayoutContentCtx } from './LayoutContentCtx';
import Sidebar from './sidebar/Sidebar';

export const Layout = styled.div<{ isSwitchStudy?: boolean }>`
  width: 100%;
  height: 100%;
  padding: 0;
  transition: 1.4s cubic-bezier(0.45, 0.05, 0, 1);
  transform: translateY(${({ isSwitchStudy }) => (isSwitchStudy ? 0 : '-100%')});
`;

export const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: ${colors.background};
`;

const StudiesContentWrapper = styled(ContentWrapper)`
  overflow: auto;
  flex-direction: column;
`;

const MainContentWrapper = styled(ContentWrapper)`
  position: relative;
  z-index: 1;
`;

export const Content = styled.div`
  min-height: unset;
  flex: 1;
  overflow: auto;
  position: relative;
`;

const useSwitchStudy = (initialState: boolean) => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isSwitchStudy, toggleIsSwitchStudy] = useToggle(initialState);
  const [isSwitchStudyInTransition, toggleIsSwitchStudyInTransition] = useToggle(false);

  const isSelfElement = useCallback((evt: Event) => evt.currentTarget === evt.target, []);

  const onTransitionStart = useCallback(
    (evt: Event) => {
      if (isSelfElement(evt)) {
        toggleIsSwitchStudyInTransition(true);
      }
    },
    [isSelfElement, toggleIsSwitchStudyInTransition]
  );

  useEvent('transitionstart', onTransitionStart, layoutRef.current);

  const onTransitionEnd = useCallback(
    (evt: Event) => {
      if (isSelfElement(evt)) {
        toggleIsSwitchStudyInTransition(false);
      }
    },
    [isSelfElement, toggleIsSwitchStudyInTransition]
  );

  useEvent('transitionend', onTransitionEnd, layoutRef.current);

  return {
    layoutRef,
    isSwitchStudy,
    isSwitchStudyInTransition,
    toggleIsSwitchStudy,
  };
};

interface UseFetchBootDataReturnType {
  userRole?: UserRole;
}

const useFetchBootData = (): UseFetchBootDataReturnType => {
  const userRole = useAppSelector(userRoleSelector);
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchStudies());
  });

  return { userRole };
};

const useScrollHistory = (paths: Path[], content: RefObject<HTMLElement>) => {
  const pathMap = useRef<Record<string, number>>({});
  const location = useLocation();
  const prevLocation = usePrevious<Location>(location);
  const lastScrollRef = useRef(0);

  useEvent(
    'scroll',
    () => {
      lastScrollRef.current = content.current?.scrollTop ?? 0;
    },
    content.current
  );

  useLayoutEffect(() => {
    const trySaveScroll = () => {
      paths.forEach((path) => {
        if (!prevLocation) {
          return;
        }

        const matched = matchPath(prevLocation.pathname, { path });
        if (matched?.isExact && prevLocation?.key) {
          pathMap.current[prevLocation.key] = lastScrollRef.current;
        }
      });

      lastScrollRef.current = 0;
    };

    const tryRestoreScroll = () => {
      if (!content.current || prevLocation?.key === location.key) {
        return;
      }

      if (location.key && typeof pathMap.current[location.key] === 'number') {
        content.current.scrollTop = pathMap.current[location.key];
        delete pathMap.current[location.key];
      } else {
        content.current.scrollTop = 0;
      }
    };

    trySaveScroll();
    tryRestoreScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, paths]);
};

const MainLayout = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const studyId = useSelectedStudyId();
  const dispatch = useAppDispatch();

  useUpdateEffect(() => {
    dispatch(hideSnackbar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, studyId]);

  useDisableElasticScroll(contentRef);

  useScrollHistory(
    [Path.Overview, Path.DataCollection, Path.StudyManagement, Path.StudySettings],
    contentRef
  );

  const { userRole } = useFetchBootData();

  const history = useHistory();
  const isForceStudySwitched = useMemo(
    () => !_isNull(new URLSearchParams(history.location.search).get(SWITCH_STUDY_SEARCH_PARAM)),
    [history.location.search]
  );

  const { layoutRef, isSwitchStudy, toggleIsSwitchStudy, isSwitchStudyInTransition } =
    useSwitchStudy(isForceStudySwitched);

  const onStudyClick = () => {
    if (isSwitchStudy) {
      toggleIsSwitchStudy();
    } else {
      scrollToTop(contentRef.current as HTMLElement, toggleIsSwitchStudy);
    }
  };

  const studiesContentRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // disable elements focus between content containers
  useEvent(
    'keydown',
    (e) => {
      const evt = e as unknown as KeyboardEvent;
      const target = evt.target as unknown as Node;
      const currentContainer = isSwitchStudy ? studiesContentRef.current : mainContentRef.current;

      if (evt.key === 'Tab' && currentContainer && !currentContainer.contains(target)) {
        evt.preventDefault();
        evt.stopPropagation();
        document.body.focus();
      }
    },
    document.body,
    { capture: true }
  );

  return (
    <LayoutContentCtx.Provider value={contentRef}>
      <Layout data-testid="main-layout" ref={layoutRef} isSwitchStudy={isSwitchStudy}>
        <StudiesContentWrapper ref={studiesContentRef}>
          <Studies onStudySelectionFinished={toggleIsSwitchStudy} />
          {isSwitchStudy && <SnackbarContainer useSimpleGrid />}
        </StudiesContentWrapper>
        <MainContentWrapper>
          <Sidebar onStudyClick={onStudyClick} />
          {userRole && (
            <Content ref={contentRef}>
              <Switch>
                <Route
                  exact
                  path={Path.Overview}
                  render={() => (
                    <Overview isSwitchStudy={isSwitchStudy || isSwitchStudyInTransition} />
                  )}
                />
                <Route exact path={Path.OverviewSubject} component={OverviewSubject} />
                <Route exact path={Path.StudyManagement} component={StudyManagement} />
                <Route exact path={Path.StudyManagementEditSurvey} component={SurveyEditor} />
                <Route exact path={Path.StudyManagementSubject} component={OverviewSubject} />
                <Route exact path={Path.StudyManagementSurveyResults} component={SurveyPage} />
                <Route exact path={Path.StudyManagementActivityResults} component={ActivityPage} />
                <Route exact path={Path.StudyManagementEditActivity} component={ActivityEditor} />
                <Route exact path={Path.StudyManagementEditEducation} component={EducationEditor} />
                <Route path={Path.UserAnalytics} component={EmptyTab} />
                <Route exact path={Path.DataCollection} component={DataInsights} />
                <Route exact path={Path.DataCollectionSubject} component={OverviewSubject} />
                <Route exact path={Path.StudySettings}>
                  <StudySettings
                    isSwitchStudy={isSwitchStudy}
                    isSwitchStudyInTransition={isSwitchStudyInTransition}
                  />
                </Route>
                <Redirect to={Path.Overview} />
              </Switch>
              {!isSwitchStudy && <SnackbarContainer useSimpleGrid />}
            </Content>
          )}
        </MainContentWrapper>
      </Layout>
    </LayoutContentCtx.Provider>
  );
};

export default MainLayout;

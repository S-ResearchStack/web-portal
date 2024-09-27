import React, { RefObject, useCallback, useLayoutEffect, useRef } from 'react';
import { matchPath, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import useEvent from 'react-use/lib/useEvent';
import useMount from 'react-use/lib/useMount';
import usePrevious from 'react-use/lib/usePrevious';
import useToggle from 'react-use/lib/useToggle';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import styled from 'styled-components';
import { Location } from 'history';

import { colors } from 'src/styles';
import {STORAGE_SHOW_STUDIES} from "src/modules/auth/utils";
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';
import { scrollToTop } from 'src/common/utils/scrollToTop';
import { userRoleForStudySelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { UserRole } from 'src/modules/auth/userRole';
import { Path } from 'src/modules/navigation/store';
import { SnackbarContainer } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import { fetchStudies, useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { LayoutContentCtx } from './LayoutContentCtx';
import Sidebar from './sidebar/Sidebar';
import Studies from 'src/modules/studies/Studies';
import Overview from 'src/modules/overview/Overview';
import Dashboard from 'src/modules/dashboard/Dashboard';
import TaskManagement from 'src/modules/task-management/TaskManagement';
import StudyManagement from 'src/modules/subject/StudyManagement';
import StudyData from "src/modules/study-data/StudyData";
import EducationManagement from '../education-management/EducationManagement';
import LabVisitManagement from '../lab-visit';
import StudySettings from 'src/modules/study-settings/StudySettings';
import ChartEditor from 'src/modules/dashboard/chart-editor/ChartEditor';
import SurveyEditor from 'src/modules/task-management/survey/survey-editor/SurveyEditor';
import ActivityEditor from 'src/modules/task-management/activity/activity-editor/ActivityEditor';
import EducationEditor from 'src/modules/education-management/education-editor/EducationEditor';

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

const useSwitchStudy = () => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isSwitchStudy, toggleIsSwitchStudy] = useToggle(!!sessionStorage.getItem(STORAGE_SHOW_STUDIES));
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
    // isSwitchStudy: !!sessionStorage.getItem(STORAGE_SHOW_STUDIES),
    isSwitchStudy,
    isSwitchStudyInTransition,
    toggleIsSwitchStudy: () => {
      toggleIsSwitchStudy()
      if(sessionStorage.getItem(STORAGE_SHOW_STUDIES)) {
        sessionStorage.removeItem(STORAGE_SHOW_STUDIES)
      } else {
        sessionStorage.setItem(STORAGE_SHOW_STUDIES, 'true')
      }
    }
  };
};

interface UseFetchBootDataReturnType {
  userRole?: UserRole;
}

const useFetchBootData = (): UseFetchBootDataReturnType => {
  const userRole = useAppSelector(userRoleForStudySelector);
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
  }, [location.pathname, studyId]);

  useDisableElasticScroll(contentRef);

  useScrollHistory(
    [
      Path.Overview,
      Path.Dashboard,
      Path.TaskManagement,
      Path.SubjectManagement,
      Path.StudyData,
      Path.EducationalManagement,
      Path.LabVisitManagement,
      Path.StudySettings
    ],
    contentRef
  );

  const { userRole } = useFetchBootData();

  const { layoutRef, isSwitchStudy, toggleIsSwitchStudy, isSwitchStudyInTransition } =
    useSwitchStudy();

  const onStudyClick = () => {
     if (isSwitchStudy) {
      toggleIsSwitchStudy();
     } else {
      scrollToTop(contentRef.current as HTMLElement, toggleIsSwitchStudy);
    }
  }

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
          {(
            <Content ref={contentRef}>
              <Switch>
                <Route
                  exact
                  path={Path.Overview}
                  render={() => (
                    <Overview isSwitchStudy={isSwitchStudy || isSwitchStudyInTransition} />
                  )}
                />

                <Route exact path={Path.Dashboard} component={Dashboard} />
                <Route exact path={Path.CreateChart} component={ChartEditor} />
                <Route exact path={Path.EditChart} component={ChartEditor} />

                <Route exact path={Path.TaskManagement} component={TaskManagement} />
                <Route exact path={Path.CreateSurvey} component={SurveyEditor} />
                <Route exact path={Path.CreateActivity} component={ActivityEditor} />

                <Route exact path={Path.SubjectManagement} component={StudyManagement} />

                <Route exact path={Path.StudyData} component={StudyData} />

                <Route exact path={Path.EducationalManagement} component={EducationManagement} />
                <Route exact path={Path.CreateEducational} component={EducationEditor} />
                <Route exact path={Path.EditEducational} component={EducationEditor} />

                <Route exact path={Path.LabVisitManagement} component={LabVisitManagement} />

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

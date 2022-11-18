import React, { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { matchPath, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import useEvent from 'react-use/lib/useEvent';
import useMount from 'react-use/lib/useMount';
import useToggle from 'react-use/lib/useToggle';
import usePrevious from 'react-use/lib/usePrevious';
import styled from 'styled-components';
import { Location } from 'history';

import { userRoleSelector } from 'src/modules/auth/auth.slice';
import { UserRole } from 'src/modules/auth/userRole';
import { Path } from 'src/modules/navigation/store';
import StudySettings from 'src/modules/study-settings/StudySettings';
import Overview from 'src/modules/overview/Overview';
import OverviewSubject from 'src/modules/overview/overview-subject/OverviewSubject';
import SurveyEditor from 'src/modules/trial-management/survey-editor/SurveyEditor';
import SurveyPage from 'src/modules/trial-management/SurveyPage';
import DataInsights from 'src/modules/data-collection/DataInsights';
import { SnackbarContainer } from 'src/modules/snackbar';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import { fetchStudies, useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { colors } from 'src/styles';
import { scrollToTop } from 'src/common/utils/scrollToTop';
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';
import StudyManagement from 'src/modules/trial-management/StudyManagement';
import { LayoutContentCtx } from 'src/modules/main-layout/LayoutContentCtx';

import Sidebar from './sidebar/Sidebar';
import SwitchStudy from './switch-study/SwitchStudy';
import EmptyTab from './EmptyTab';

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

export const Content = styled.div`
  min-height: unset;
  flex: 1;
  overflow: auto;
  position: relative;
`;

const useSwitchStudy = () => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isSwitchStudy, toggleIsSwitchStudy] = useToggle(false);
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
  const pathMap = useRef<{ [key: string]: number }>({});
  const location = useLocation();
  const history = useHistory();
  const prevLocation = usePrevious<Location>(location);
  const pathHistory = useRef<string[]>([location.pathname]);

  useLayoutEffect(() => {
    if (prevLocation?.pathname === location.pathname) {
      return;
    }

    if (history.action === 'PUSH') {
      const prevPath = pathHistory.current[pathHistory.current.length - 1];

      paths.forEach((path) => {
        const matched = matchPath(prevPath, { path });

        if (matched && matched.isExact) {
          pathMap.current[path] = content.current?.scrollTop || 0;
        }
      });

      if (content.current) {
        content.current.scrollTop = 0;
      }

      pathHistory.current.push(location.pathname);
    } else {
      if (pathHistory.current.length < 2) {
        return;
      }
      pathHistory.current.pop();

      const currentPath = pathHistory.current[pathHistory.current.length - 1];

      paths.forEach((path) => {
        const matched = matchPath(currentPath, { path });

        if (matched && matched.isExact && content.current) {
          content.current.scrollTop = pathMap.current[path];
          delete pathMap.current[path];
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
};

const MainLayout = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const studyId = useSelectedStudyId();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hideSnackbar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, studyId]);

  useDisableElasticScroll(contentRef);

  useScrollHistory([Path.Overview, Path.DataCollection, Path.TrialManagement], contentRef);

  const { userRole } = useFetchBootData();

  const { layoutRef, isSwitchStudy, toggleIsSwitchStudy, isSwitchStudyInTransition } =
    useSwitchStudy();

  const onStudyClick = () => {
    if (isSwitchStudy) {
      toggleIsSwitchStudy();
    } else {
      scrollToTop(contentRef.current as HTMLElement, toggleIsSwitchStudy);
    }
  };

  return (
    <LayoutContentCtx.Provider value={contentRef}>
      <Layout ref={layoutRef} isSwitchStudy={isSwitchStudy}>
        <ContentWrapper>
          <SwitchStudy onStudySelectionFinished={toggleIsSwitchStudy} />
        </ContentWrapper>
        <ContentWrapper>
          <Sidebar onStudyClick={onStudyClick} />
          {userRole && (
            <Content ref={contentRef}>
              <Switch>
                <Route exact path={Path.Overview} component={Overview} />
                <Route exact path={Path.OverviewSubject} component={OverviewSubject} />
                <Route exact path={Path.TrialManagement} component={StudyManagement} />
                <Route exact path={Path.TrialManagementEditSurvey} component={SurveyEditor} />
                <Route exact path={Path.TrialManagementSubject} component={OverviewSubject} />
                <Route exact path={Path.TrialManagementSurveyResults} component={SurveyPage} />
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
              <SnackbarContainer useSimpleGrid />
            </Content>
          )}
        </ContentWrapper>
      </Layout>
    </LayoutContentCtx.Provider>
  );
};

export default MainLayout;

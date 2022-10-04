import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Switch, Route, Redirect, useHistory, matchPath, useLocation } from 'react-router-dom';
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
import { colors } from 'src/styles';
import { scrollToTop } from 'src/common/utils/scrollToTop';
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';
import StudyManagement from 'src/modules/trial-management/StudyManagement';

import Sidebar from './sidebar/Sidebar';
import SwitchStudy from './switch-study/SwitchStudy';
import EmptyTab from './EmptyTab';

interface NavigationScrollRestoreContextSchema {
  scrollHistoryStack: number[];
  saveScroll: () => void;
  restoreScroll: () => void;
  resetScroll: () => void;
  prevLocation?: Location;
}

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
  background-color: ${colors.updBackground};
`;

export const Content = styled.div`
  min-height: unset;
  flex: 1;
  overflow: auto;
  position: relative;
`;

export const NavigationScrollRestoreContext =
  React.createContext<NavigationScrollRestoreContextSchema>({
    scrollHistoryStack: [],
    saveScroll() {},
    restoreScroll() {},
    resetScroll() {},
    prevLocation: undefined,
  });

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

interface UseNavigationScrollRestoreReturnType {
  scrollRestoreCtx: NavigationScrollRestoreContextSchema;
}

const useNavigationScrollRestore = <T extends HTMLElement>(
  contentRef: React.RefObject<T>
): UseNavigationScrollRestoreReturnType => {
  const scrollHistoryStackRef = useRef<number[]>([]);

  const location = useLocation();
  const prevLocation = usePrevious<Location>(location);

  const setScrollHistory = useCallback((scrollHistoryStack: number[]) => {
    scrollHistoryStackRef.current = scrollHistoryStack;
  }, []);

  const saveScroll = useCallback(() => {
    const scrollTop = contentRef.current?.scrollTop;

    if (scrollTop) {
      const scrollHistoryStack = [...scrollHistoryStackRef.current];

      scrollHistoryStack.push(scrollTop);

      setScrollHistory(scrollHistoryStack);
    }
  }, [contentRef, setScrollHistory]);

  const restoreScroll = useCallback(() => {
    const scrollHistoryStack = [...scrollHistoryStackRef.current];

    if (contentRef.current && scrollHistoryStack.length) {
      contentRef.current.scrollTop = scrollHistoryStack.pop() as number;

      setScrollHistory(scrollHistoryStack);
    }
  }, [contentRef, setScrollHistory]);

  const resetScroll = useCallback(() => {
    setScrollHistory([]);
  }, [setScrollHistory]);

  const scrollRestoreCtx: NavigationScrollRestoreContextSchema = useMemo(
    () => ({
      scrollHistoryStack: scrollHistoryStackRef.current,
      prevLocation,
      saveScroll,
      restoreScroll,
      resetScroll,
    }),
    [prevLocation, resetScroll, restoreScroll, saveScroll]
  );

  return {
    scrollRestoreCtx,
  };
};

interface UseNavigationScrollRestoreCheckpointOptions {
  startPath: Path;
}

export const useNavigationScrollRestoreCheckpoint = ({
  startPath,
}: UseNavigationScrollRestoreCheckpointOptions): void => {
  const contentCtx = useContext(NavigationScrollRestoreContext);
  const history = useHistory();

  useEffect(() => {
    if (contentCtx.prevLocation) {
      const isMatchReferrer = matchPath(contentCtx.prevLocation.pathname, { path: startPath });

      if (isMatchReferrer) {
        contentCtx.restoreScroll();
      } else {
        contentCtx.resetScroll();
      }
    }

    const unregisterHistoryListener = history.listen((location) => {
      const isMatchPath = matchPath(location.pathname, { path: startPath });

      if (isMatchPath) {
        contentCtx.saveScroll();
      } else {
        contentCtx.resetScroll();
      }
    });

    return () => unregisterHistoryListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, startPath]);
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

const MainLayout = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  useDisableElasticScroll(contentRef);

  const { userRole } = useFetchBootData();
  const { scrollRestoreCtx } = useNavigationScrollRestore(contentRef);
  const studyId = useSelectedStudyId();

  useEffect(() => {
    scrollRestoreCtx.resetScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId]);

  const { layoutRef, isSwitchStudy, toggleIsSwitchStudy, isSwitchStudyInTransition } =
    useSwitchStudy();

  return (
    <NavigationScrollRestoreContext.Provider value={scrollRestoreCtx}>
      <Layout ref={layoutRef} isSwitchStudy={isSwitchStudy}>
        <ContentWrapper>
          <SwitchStudy onStudySelectionFinished={toggleIsSwitchStudy} />
        </ContentWrapper>
        <ContentWrapper>
          <Sidebar
            onStudyClick={() => {
              if (isSwitchStudy) {
                toggleIsSwitchStudy();
              } else {
                scrollToTop(contentRef.current as HTMLElement, toggleIsSwitchStudy);
              }
            }}
          />
          {userRole && (
            <Content ref={contentRef}>
              <Switch>
                <Route exact path={Path.Overview} component={Overview} />
                <Route exact path={Path.OverviewSubject} component={OverviewSubject} />
                <Route exact path={Path.TrialManagement} component={StudyManagement} />
                <Route exact path={Path.TrialManagementEditSurvey} component={SurveyEditor} />
                <Route exact path={Path.TrialManagementSubject} component={OverviewSubject} />
                <Route exact path={Path.TrialManagementSurveyResults}>
                  <SurveyPage mainContainerRef={contentRef} />
                </Route>
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
              <SnackbarContainer mainContainerRef={contentRef} useSimpleGrid />
            </Content>
          )}
        </ContentWrapper>
      </Layout>
    </NavigationScrollRestoreContext.Provider>
  );
};

export default MainLayout;

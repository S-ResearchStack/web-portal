import React, { FC } from 'react';
import useMeasure from 'react-use/lib/useMeasure';
import styled from 'styled-components';

import Button from 'src/common/components/Button';
import Spinner from 'src/common/components/Spinner';

import ErrorServiceIcon from 'src/assets/service/error.svg';
import EmptyServiceIcon from 'src/assets/service/empty_data.svg';
import { px, typography } from 'src/styles';

const COMPACT_MIN_WIDTH = 420;

const COMPACT_MIN_HEIGHT = 400;

enum ServiceScreenType {
  error = 'error',
  empty = 'empty',
  loading = 'loading',
}

interface ServiceScreenPreparedProps {
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title?: React.ReactNode;
}

export interface ServiceScreenProps
  extends React.PropsWithChildren<
    Omit<ServiceScreenPreparedProps, 'icon'> & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>
  > {
  type: keyof typeof ServiceScreenType;
  title?: React.ReactNode;
  onReload?: () => void;
}

const CONTAINER_PADDING = 32;

export const Container = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: 100%;
  min-height: 100%;
  flex: 1;
`;

const Image = styled.div<{ $empty?: boolean }>`
  margin-bottom: ${({ $empty }) => ($empty ? 0 : px(18))};
`;

const Title = styled.div<{ $empty?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${({ $empty, theme }) => ($empty ? theme.colors.textPrimary : theme.colors.onSurface)};
  margin-bottom: ${px(23)};
`;

const ButtonContainer = styled.div`
  margin-top: ${px(69)};
  width: ${px(248)};
`;

const ServiceScreen: FC<ServiceScreenProps> = ({
  type,
  title,
  children,
  onReload,
  ...props
}): JSX.Element => {
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();

  const isCompact =
    width + CONTAINER_PADDING * 2 < COMPACT_MIN_WIDTH ||
    height + CONTAINER_PADDING * 2 < COMPACT_MIN_HEIGHT;

  const renderScreen = () => {
    if (type === 'error') {
      return (
        <>
          {!isCompact && (
            <Image>
              <ErrorServiceIcon />
            </Image>
          )}
          <Title>{title || 'Server Error'}</Title>
          {onReload && (
            <ButtonContainer>
              <Button fill="solid" onClick={onReload} data-testid="reload-button">
                Reload
              </Button>
            </ButtonContainer>
          )}
        </>
      );
    }
    if (type === 'empty' || type === 'loading') {
      let icon;

      if (type === 'loading') {
        icon = <Spinner size="l" data-testid="spinner" />;
      } else if (type === 'empty') {
        icon = <EmptyServiceIcon data-testid="empty-icon" />;
      }

      return (
        <>
          <Image $empty>{icon}</Image>
          <Title $empty>{title || 'No Data'}</Title>
        </>
      );
    }

    return null;
  };

  return (
    <Container ref={containerRef} {...props}>
      {renderScreen()}
    </Container>
  );
};

export default ServiceScreen;

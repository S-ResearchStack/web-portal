import React from 'react';

import styled from 'styled-components';

import AppbarBack from 'src/assets/icons/appbar_back.svg';
import { ExtendProps } from 'src/common/utils/types';
import { boxShadow, px, typography } from 'src/styles';
import { PREVIEW_SCALE } from 'src/styles/GlobalStyles';

const SCREEN_WIDTH = 270;
const SCREEN_HEIGHT = 600;

const PreviewScreenLayoutContainer = styled.div`
  flex: 1;
  width: ${px(SCREEN_WIDTH)};
  box-shadow: ${boxShadow.previewScreen};
  display: flex;
  flex-direction: row;
  height: ${px(SCREEN_HEIGHT)};
  max-height: ${px(SCREEN_HEIGHT)};
  margin: 0 ${px(40)} ${px(24)};
  background-color: #fbfbfb;
`;

const Screen = styled.div`
  min-width: ${px((1 / PREVIEW_SCALE) * SCREEN_WIDTH)};
  height: ${px((1 / PREVIEW_SCALE) * SCREEN_HEIGHT)};
  transform: scale(${PREVIEW_SCALE}) translateY(-17%) translateX(-17%);
  display: flex;
  flex-direction: column;
`;

const StatusBar = styled.div`
  height: ${px(32)};
`;

const Header = styled.div`
  display: flex;
  height: ${px(56)};
  align-items: center;
  padding-right: ${px(28)};
  padding-left: ${px(23)};
  background-color: #fbfbfb;

  svg {
    margin-right: ${px(8)};
  }
`;

const Body = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  ${typography.bodyLargeRegular};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: ${px(276)};
`;

type Props = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    title: string;
  }
>;

const PreviewScreenLayout = ({ title, children, ...rest }: Props) => (
  <PreviewScreenLayoutContainer {...rest} data-testid="preview">
    <Screen>
      <StatusBar />
      <Header>
        <AppbarBack />
        <Title>{title}</Title>
      </Header>
      <Body>{children}</Body>
    </Screen>
  </PreviewScreenLayoutContainer>
);

export default PreviewScreenLayout;

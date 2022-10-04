import React, { useState } from 'react';
import { ComponentStory } from '@storybook/react';

import styled from 'styled-components';
import _uniqueId from 'lodash/uniqueId';

import { getStoreDecorator } from 'src/modules/store/storybook';
import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import { typography } from 'src/styles';
import { useShowSnackbar, SnackbarContainer } from '.';

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  > :first-child {
    width: 30%;
    background: gray;
  }

  > :nth-child(2) {
    background: lightgray;
    flex: 1;
    overflow-y: scroll;
  }
`;

const ControlsContainer = styled.div`
  height: calc(100% + 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Text = styled.div`
  ${typography.body2Medium14};
  height: 18px;
  width: 100%;
  text-align: center;
`;

const PageWithSnackbar: React.FC = () => {
  const showSnackbar = useShowSnackbar();
  const [snackbarText, setSnackbarText] = useState('');
  const [infoText, setInfoText] = useState('');

  return (
    <Container>
      <div />
      <div>
        <Text>{infoText}</Text>
        <ControlsContainer>
          <InputField
            style={{ width: 500 }}
            type="text"
            label="Text"
            value={snackbarText}
            onChange={(e) => setSnackbarText(e.target.value)}
          />
          <Button
            fill="solid"
            onClick={() =>
              showSnackbar({
                text: snackbarText || `Some sample text #${_uniqueId()}`,
              })
            }
          >
            Show
          </Button>
          <Button
            fill="solid"
            onClick={() => {
              const text = snackbarText || `Some sample text #${_uniqueId()} with action`;
              showSnackbar({
                text,
                actionLabel: 'Undo',
                onAction: () => setInfoText(`Action clicked for "${text}"`),
              });
            }}
          >
            Show with action
          </Button>
        </ControlsContainer>
        <SnackbarContainer />
      </div>
    </Container>
  );
};

export default {
  component: PageWithSnackbar,
  decorators: [getStoreDecorator({})],
};

const Template: ComponentStory<typeof PageWithSnackbar> = (args) => <PageWithSnackbar {...args} />;

export const Default = Template.bind({});

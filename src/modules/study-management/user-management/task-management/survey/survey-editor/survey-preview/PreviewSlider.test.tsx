import React from 'react';
import { act, render, screen } from '@testing-library/react';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider } from 'styled-components';
import theme from 'src/styles/theme';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import userEvent from '@testing-library/user-event';
import { makeStore } from 'src/modules/store/store';
import { makeHistory } from 'src/modules/navigation/store';
import PreviewSlider from './PreviewSlider';

describe('PreviewSlider', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
  });

  it('should render', async () => {
    const minIndex = 1;
    const maxIndex = 10;
    const maxLabel = 'max';
    const minLabel = 'min';
    const activeIndex = 5;
    const onChange = jest.fn();

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <PreviewSlider
                minIndex={minIndex}
                maxIndex={maxIndex}
                maxLabel={maxLabel}
                minLabel={minLabel}
                activeIndex={activeIndex}
                onChange={onChange}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-preview-slider')).toMatchSnapshot();

    const maxLabelElement = await screen.findByTestId('survey-preview-slider-max-label');
    const minLabelElement = await screen.findByTestId('survey-preview-slider-min-label');
    const maxValueElement = await screen.findByTestId('survey-preview-slider-max-value');
    const minValueElement = await screen.findByTestId('survey-preview-slider-min-value');
    const sliderPoints = await screen.findAllByTestId('survey-preview-slider-point');

    expect(maxLabelElement).toHaveTextContent(maxLabel);
    expect(minLabelElement).toHaveTextContent(minLabel);
    expect(maxValueElement).toHaveTextContent(String(maxIndex));
    expect(minValueElement).toHaveTextContent(String(minIndex));
    expect(sliderPoints).toHaveLength(maxIndex - minIndex + 1);

    await userEvent.click(sliderPoints[1]);
    expect(onChange).toHaveBeenCalled();
  });
});

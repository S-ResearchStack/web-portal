import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import InputImage, { InputImageProps } from './InputImage';

const mockOnChange = jest.fn();

const renderComponent = (props: Partial<InputImageProps>) => {
  return render(
    <ThemeProvider theme={theme}>
      <InputImage onChange={mockOnChange} {...props} />
    </ThemeProvider>
  );
};

describe('InputImage component test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('[NEGATIVE] should render without crashing', () => {
    renderComponent({});
    expect(screen.getByTestId('input-image')).toBeInTheDocument();
  });


  it('should call onChange function with file and URL when image is selected', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    renderComponent({});
    const inputElement = screen.getByTestId('input-image-input');
    fireEvent.change(inputElement, { target: { files: [file] } });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockOnChange).toHaveBeenCalledWith(file, expect.any(String));
  });
});

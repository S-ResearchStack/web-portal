import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import buildProvidersTree, { ProvidersType } from './ProviderTree';

const ProviderTest = ({ children, id }: { children: ReactNode; id: number }) => (
  <div data-testid={`provider-${id}`}>{children}</div>
);

const mockProviders: ProvidersType[] = [
  [ProviderTest, {id: 1}],
  [ProviderTest, {id: 2}],
  [ProviderTest, {id: 3}],
];

describe('ProviderTree test', () => {
  it('should build correct provider tree', () => {
    const ProviderTree = buildProvidersTree(mockProviders);
    render(<ProviderTree><div data-testid='test'></div></ProviderTree>);
    mockProviders.forEach(provider => {
      expect(screen.getByTestId(`provider-${provider[1].id}`)).toBeInTheDocument()
    })
    expect(screen.getByTestId('test')).toBeInTheDocument()
  })

  it('[NEGATIVE] should build correctly with no providers', () => {
    const ProviderTree = buildProvidersTree([]);
    render(<ProviderTree><div data-testid='test'></div></ProviderTree>);
    mockProviders.forEach(provider => {
      expect(screen.queryByTestId(`provider-${provider[1].id}`)).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('test')).toBeInTheDocument()
  })
});

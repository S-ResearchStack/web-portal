import React from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Label, { LabelProps } from './Label';
import Spinner from 'src/common/components/Spinner';

interface ListViewProps extends LabelProps {
  label: string;
  items: string[];
  loading?: boolean;
  onClick?: (item: string) => void;
};
const ListView = ({ label, items, loading, onClick, ...props }: ListViewProps) => {
  return (
    <Container>
      <Label {...props}>{label}</Label>
      {!loading ? (
        <List>
          {items.map(i => <Item data-testid='data-item' key={i} onClick={() => onClick?.(i)}>{i}</Item>)}
        </List>
      ) : (
        <Loading>
          <Spinner size="xs" />
        </Loading>
      )}

    </Container>
  );
};

export default ListView;

const Container = styled.div`
  margin-bottom: ${px(12)};
`;
const List = styled.ul`
  margin: 0;
  overflow: hidden auto;
  max-height: ${px(400)};
  padding-left: ${px(20)};
`;
const Item = styled.li`
`;

const Loading = styled.div`
  height: ${px(200)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';

import { typography, colors } from 'src/styles';

const Text = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
`;

type Props = {
  fromTs?: number;
  toTs?: number;
  placeholder?: string;
};

const CardDurationTitle: React.FC<Props> = ({ fromTs, toTs, placeholder }) => {
  const from = useMemo(() => DateTime.fromMillis(fromTs || 0).startOf('day'), [fromTs]);
  const to = useMemo(() => DateTime.fromMillis(toTs || 0).startOf('day'), [toTs]);

  const datesRange = useMemo(() => {
    const commonPart = 'MMM d';
    const yearPart = ', yyyy';

    const getFormat = (year = false) => `${commonPart}${year ? yearPart : ''}`;

    if (!toTs) {
      return from.toFormat(getFormat(true));
    }

    const startHasYear = !to.hasSame(from, 'year');
    return `${from.toFormat(getFormat(startHasYear))} - ${to.toFormat(getFormat(true))}`;
  }, [from, to, toTs]);

  if (!fromTs && !toTs) {
    return <Text>{placeholder}</Text>;
  }

  return <Text>{datesRange}</Text>;
};

export default CardDurationTitle;

import React from 'react';

import styled from 'styled-components';

import SkipLogicIcon from 'src/assets/icons/skip_logic.svg';
import SkipLogicWarningIcon from 'src/assets/icons/skip_logic_warning.svg';
import Button from 'src/common/components/Button';
import Tooltip from 'src/common/components/Tooltip';
import { useAppDispatch } from 'src/modules/store';
import { px } from 'src/styles';
import { QuestionItem } from '../questions';
import { isSkipLogicComplete } from './helpers';
import { startEditSkipLogic } from './skipLogic.slice';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${px(5)};
`;

type Props = {
  question: QuestionItem;
};

const ChangeSkipLogicButton: React.FC<Props> = ({ question }) => {
  const dispatch = useAppDispatch();

  if (question.type !== 'single' && question.type !== 'multiple' && question.type !== 'dropdown') {
    return null;
  }

  const handleClick = () => {
    dispatch(startEditSkipLogic(question.id));
  };

  return (
    <Container>
      {!isSkipLogicComplete(question.skipLogic) && (
        <Tooltip
          position="b"
          trigger="hover"
          arrow
          styles={{ transform: `translateY(${px(-4)})` }}
          triggerStyle={{ height: 24 }}
          horizontalPaddings="l"
          content={
            <>
              This question has incomplete skip logic.
              <br />
              Publishing ignores incomplete skip logic rules.
            </>
          }
        >
          <SkipLogicWarningIcon />
        </Tooltip>
      )}
      <Button
        fill="text"
        icon={<SkipLogicIcon />}
        width={120}
        rate="small"
        onClick={handleClick}
        rippleOff
      >
        {question.skipLogic ? 'Edit skip logic' : 'Add skip logic'}
      </Button>
    </Container>
  );
};

export default ChangeSkipLogicButton;

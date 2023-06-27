import React, { useState } from 'react';

import Modal from 'src/common/components/Modal';
import { getQuestionHandler } from './questions';
import { hasQuestionAssociatedSkipLogic } from './skip-logic/helpers';
import { QuestionItem, SurveyItem } from './surveyEditor.slice';

function useHandleQuestionDelete({
  survey,
  onDeleteConfirmed,
}: {
  survey: SurveyItem;
  onDeleteConfirmed: (q: QuestionItem) => void;
}) {
  const [questionToDelete, setQuestionToDelete] = useState<
    { question: QuestionItem; hasAssociatedSkipLogic: boolean } | undefined
  >(undefined);

  const tryDeleteQuestion = (q: QuestionItem) => {
    const hasAssociatedSkipLogic = hasQuestionAssociatedSkipLogic(
      q,
      survey.questions.map((s) => s.children).flat()
    );
    if (getQuestionHandler(q.type).isEmpty(q) && !hasAssociatedSkipLogic) {
      onDeleteConfirmed(q);
    } else {
      setQuestionToDelete({
        question: q,
        hasAssociatedSkipLogic,
      });
    }
  };

  const cancel = () => {
    setQuestionToDelete(undefined);
  };

  const confirm = () => {
    if (questionToDelete?.question) {
      setQuestionToDelete(undefined);
      onDeleteConfirmed(questionToDelete.question);
    }
  };

  const modalElements = (
    <>
      <Modal
        open={!!questionToDelete && !questionToDelete.hasAssociatedSkipLogic}
        title="Delete Question"
        onAccept={confirm}
        onDecline={cancel}
        declineLabel="Cancel"
        acceptLabel="Delete Question"
        description="Are you sure you want to delete the question? By doing this, you will lose the content you have entered for this question."
      />
      <Modal
        open={!!questionToDelete && questionToDelete.hasAssociatedSkipLogic}
        title="Delete Question"
        onAccept={confirm}
        onDecline={cancel}
        declineLabel="Cancel"
        acceptLabel="Delete question"
        description="Are you sure you want to delete the question? By doing this, you will lose any associated skip logic rules."
      />
    </>
  );

  return { tryDeleteQuestion, modalElements };
}

export default useHandleQuestionDelete;

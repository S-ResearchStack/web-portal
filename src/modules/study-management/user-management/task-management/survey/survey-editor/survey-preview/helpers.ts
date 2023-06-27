import { getQuestionHandler, QuestionItem } from '../questions';
import { PreviewQuestionAnswers } from '../questions/common/types';
import { evaluateSkipLogicDestination } from '../skip-logic/helpers';
import { SkipLogicDestination } from '../skip-logic/types';
import { MIN_SURVEY_SECTIONS, SurveySection } from '../surveyEditor.slice';

export type PreviewScreenQuestion = QuestionItem & {
  previewAnswer: PreviewQuestionAnswers;
  isAnswered: boolean;
};

type PreviewScreenData = {
  type: 'question' | 'section';
  id: string;
  label: string;
  isComplete: boolean;
  questions: PreviewScreenQuestion[];
};

export function getPreviewScreens(
  sections: SurveySection[],
  getAnswerForQuesiton: (questionId: string) => PreviewQuestionAnswers
) {
  const questionToPreviewQuestion = (q: QuestionItem) => {
    const previewAnswer = getAnswerForQuesiton(q.id);
    return {
      ...q,
      previewAnswer,
      isAnswered: getQuestionHandler(q.type).isPreviewQuestionAnswered({
        question: q,
        answers: previewAnswer,
      }),
    };
  };

  // build screens
  let screens: PreviewScreenData[] =
    sections?.length >= MIN_SURVEY_SECTIONS
      ? sections.map((s, idx) => ({
          type: 'section',
          id: s.id,
          label: `Section ${idx + 1}`,
          isComplete: false,
          questions: s.children.map(questionToPreviewQuestion),
        }))
      : sections[0].children.map((q, idx) => ({
          type: 'question',
          id: q.id,
          label: `Question ${idx + 1}`,
          isComplete: false,
          questions: [questionToPreviewQuestion(q)],
        }));

  // figure out skipped questions based on skip logic
  const skippedQuestionIds = new Set<string>();
  let skipUntil: SkipLogicDestination | undefined;
  for (const screen of screens) {
    if (skipUntil?.targetId === screen.id) {
      skipUntil = undefined;
    }

    for (const question of screen.questions) {
      if (skipUntil) {
        if (skipUntil.targetId === question.id) {
          skipUntil = undefined;
        } else {
          skippedQuestionIds.add(question.id);
          continue;
        }
      }

      skipUntil = evaluateSkipLogicDestination(question, question.previewAnswer);
    }
  }

  // filter out skipped questions
  screens = screens.reduce((acc, s) => {
    const qs = s.questions.filter((q) => !skippedQuestionIds.has(q.id));
    if (qs.length) {
      acc.push({
        ...s,
        questions: qs,
      });
    }
    return acc;
  }, [] as PreviewScreenData[]);

  // mark as complete
  for (const screen of screens) {
    screen.isComplete = screen.questions.every((q) => q.isAnswered);
  }

  // inside a section, hide questions after first unanswered with a skip logic
  for (const screen of screens) {
    if (screen.type !== 'section') {
      continue;
    }
    const firstUnansweredSkipLogicIdx = screen.questions.findIndex(
      (q) => !q.isAnswered && !!q.skipLogic
    );
    if (firstUnansweredSkipLogicIdx !== -1) {
      screen.questions = screen.questions.filter((q, idx) => idx <= firstUnansweredSkipLogicIdx);
    }
  }

  return screens;
}

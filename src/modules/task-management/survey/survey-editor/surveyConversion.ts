import { getQuestionHandler } from "./questions";
import type { SurveyItem } from "./surveyEditor.slice";
import type { Survey, SurveyTaskSectionQuestion, SurveyTaskSection } from "src/modules/api";

type NecessarySurveyProps = 'title' | 'description' | 'task';
export const surveyUpdateToApi = (s: SurveyItem): Pick<Survey, NecessarySurveyProps> => {
  const surveySections: SurveyTaskSection[] = [];

  s.questions.forEach((section) => {
    const questionsForSection: SurveyTaskSectionQuestion[] = [];
    section.children.forEach((q) => {
      const qh = getQuestionHandler(q.type);
      
      const item = qh?.toApi(q);
      if (item) {
        questionsForSection.push(item);
      }
    });

    const sectionApi: SurveyTaskSection = { questions: questionsForSection };
    surveySections.push(sectionApi);
  });

  return {
    title: s.title,
    description: s.description,
    task: { sections: surveySections }
  };
};

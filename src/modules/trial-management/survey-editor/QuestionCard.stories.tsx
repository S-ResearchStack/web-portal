import React, { useState } from 'react';
import styled from 'styled-components';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';

import { px } from 'src/styles';
import QuestionCard from 'src/modules/trial-management/survey-editor/QuestionCard';
import { QuestionItem } from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import { ContentWrapper, Layout } from 'src/modules/main-layout/MainLayout';

interface SurveyEntry {
  title: string;
  description: string;
  questions: QuestionItem[];
}

const question: SurveyEntry = {
  title: 'Please select the symptoms you experienced today.',
  description: 'Recall the feelings you had today.',
  questions: [
    {
      id: '1',
      type: 'single',
      title: 'Please select the symptoms you experienced today.',
      description: 'Recall the feelings you had today.',
      optional: true,
      answers: [
        {
          id: '1',
          label: 'Dizzy1',
          value: 'Dizzy1',
        },
        {
          id: '2',
          label: 'Sore throat1',
          value: 'Sore throat1',
        },
      ],
    },
    {
      id: '2',
      type: 'multiple',
      title: 'Please select the symptoms you experienced today.',
      description: 'Recall the feelings you had today.',
      optional: true,
      answers: [
        {
          id: '1',
          label: 'Dizzy2',
          value: 'Dizzy2',
        },
        {
          id: '2',
          label: 'Sore throat2',
          value: 'Sore throat2',
        },
      ],
    },
    {
      id: '3',
      type: 'slider',
      title: 'Please select the symptoms you experienced today.',
      description: 'Recall the feelings you had today.',
      optional: true,
      answers: [
        {
          id: '1',
          label: 'Dizzy',
          value: 1,
        },
        {
          id: '2',
          label: 'Sore throat',
          value: 10,
        },
      ],
    },
  ],
};

export default {
  component: QuestionCard,
} as ComponentMeta<typeof QuestionCard>;

const TemplateContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  overflow: auto;

  & > div {
    max-width: ${px(1040)};
    margin: ${px(12)} auto;
    box-shadow: 0 0 ${px(2)} rgba(0, 0, 0, 0.15);
  }
`;

const Template: ComponentStory<typeof QuestionCard> = (args) => {
  const [surveys, setSurveys] = useState<QuestionItem[]>(question.questions);

  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <Layout isSwitchStudy={false}>
        <ContentWrapper />
        <ContentWrapper>
          <TemplateContainer>
            {question.questions.map((data, idx) => (
              <QuestionCard
                key={data.id}
                {...args}
                question={data}
                // eslint-disable-next-line no-restricted-syntax
                onCopy={(item) => console.log('copy', item)}
                // eslint-disable-next-line no-restricted-syntax
                onRemove={(item) => console.log('remove', item)}
                onChange={(item) => {
                  const newSurveys = [...surveys];
                  newSurveys[idx] = item;
                  setSurveys(newSurveys);
                }}
              />
            ))}
          </TemplateContainer>
        </ContentWrapper>
      </Layout>
    </DndProvider>
  );
};

export const QuestionCardDefault = Template.bind({});

QuestionCardDefault.args = {};

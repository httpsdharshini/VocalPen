export type Question = {
  id: string;
  text: string;
};

export type Exam = {
  id: string;
  title: string;
  timeLimit: number; // in minutes
  questions: Question[];
};

export const mockExam: Exam = {
  id: 'exam-01',
  title: 'Introduction to Modern History',
  timeLimit: 30,
  questions: [
    {
      id: 'q1',
      text: 'Explain the primary causes of World War I, focusing on the concepts of militarism, alliances, imperialism, and nationalism.',
    },
    {
      id: 'q2',
      text: 'Describe the impact of the Industrial Revolution on urban society in the 19th century. What were the main social and economic changes?',
    },
    {
      id: 'q3',
      text: 'Analyze the significance of the fall of the Berlin Wall in 1989 as a symbol of the end of the Cold War.',
    },
  ],
};

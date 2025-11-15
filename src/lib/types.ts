export type Student = {
    id: string;
    regNumber: string;
    name: string;
    hasImage: boolean;
    hasVoice: boolean;
    imageUrl?: string;
    voiceUrl?: string;
};

export type Exam = {
    id: string;
    title: string;
    questions: number;
    timeLimit: number;
};

export type Submission = {
    id: string;
    studentName: string;
    examTitle: string;
    date: string;
};

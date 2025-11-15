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
    duration: number; // in minutes
    questionText: string;
};

export type Submission = {
    id: string;
    studentName: string;
    examTitle: string;
    date: string;
};

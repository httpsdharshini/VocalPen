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
    examId: string;
    studentId: string;
    answers: string[];
    timestamp: {
        seconds: number;
        nanoseconds: number;
    } | Date;
};

export type HydratedSubmission = Submission & {
    studentName?: string;
    examTitle?: string;
    examQuestionText?: string;
};

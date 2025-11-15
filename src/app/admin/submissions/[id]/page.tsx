'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, LogOut, Upload, Users, FileText, ArrowLeft, Loader2, Download, Eye } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Submission, Student, Exam, HydratedSubmission } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ViewSubmissionPage() {
    const params = useParams();
    const submissionId = params.id as string;
    
    const { firestore } = useFirebase();
    const [hydratedSubmission, setHydratedSubmission] = useState<HydratedSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const submissionDocRef = useMemoFirebase(() => 
        (firestore && submissionId) ? doc(firestore, 'responses', submissionId) : null,
        [firestore, submissionId]
    );

    const { data: submission, isLoading: isLoadingSubmission } = useDoc<Submission>(submissionDocRef);

    const studentDocRef = useMemoFirebase(() => 
        (firestore && submission) ? doc(firestore, 'students', submission.studentId) : null,
        [firestore, submission]
    );
    const { data: student, isLoading: isLoadingStudent } = useDoc<Student>(studentDocRef);

    const examDocRef = useMemoFirebase(() =>
        (firestore && submission) ? doc(firestore, 'exams', submission.examId) : null,
        [firestore, submission]
    );
    const { data: exam, isLoading: isLoadingExam } = useDoc<Exam>(examDocRef);
    
    useEffect(() => {
        const allLoaded = !isLoadingSubmission && !isLoadingStudent && !isLoadingExam;
        setIsLoading(!allLoaded);
        if (allLoaded && submission) {
            const timestamp = submission.timestamp as any;
            const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date();

            setHydratedSubmission({
                ...submission,
                studentName: student?.name || 'Unknown Student',
                examTitle: exam?.title || 'Unknown Exam',
                examQuestionText: exam?.questionText,
                timestamp: date,
            });
        }
    }, [submission, student, exam, isLoadingSubmission, isLoadingStudent, isLoadingExam]);

    const questions = useMemo(() => {
        return hydratedSubmission?.examQuestionText?.split('\n').filter(q => q.trim() !== '') || [];
    }, [hydratedSubmission]);

    const handleDownload = () => {
        if (!hydratedSubmission) return;

        let content = `Exam Submission\n\n`;
        content += `Student: ${hydratedSubmission.studentName}\n`;
        content += `Exam: ${hydratedSubmission.examTitle}\n`;
        content += `Date: ${format(hydratedSubmission.timestamp as Date, 'PPP p')}\n`;
        content += `------------------------------------\n\n`;

        questions.forEach((question, index) => {
            content += `Question ${index + 1}:\n${question}\n\n`;
            content += `Answer:\n${hydratedSubmission.answers[index] || 'No answer provided.'}\n\n`;
            content += `------------------------------------\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `submission-${hydratedSubmission.studentName}-${hydratedSubmission.examTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 flex-col hidden md:flex">
        <div className="flex items-center gap-2 mb-8">
            <VocalPenLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VocalPen</span>
        </div>
        <nav className="flex flex-col gap-2">
            <Link href="/admin" passHref>
                <Button variant="ghost" className="justify-start gap-2">
                    <Home /> Dashboard
                </Button>
            </Link>
            <Link href="/admin/students" passHref>
                <Button variant="ghost" className="justify-start gap-2">
                    <Users /> Manage Students
                </Button>
            </Link>
             <Link href="/admin/exams" passHref>
                <Button variant="ghost" className="justify-start gap-2">
                    <Upload /> Manage Exams
                </Button>
            </Link>
             <Link href="/admin/submissions" passHref>
                <Button variant="ghost" className="justify-start gap-2 bg-muted">
                    <FileText /> View Submissions
                </Button>
            </Link>
        </nav>
        <div className="mt-auto">
            <Separator className="my-4" />
            <Link href="/admin/login" passHref>
                 <Button variant="outline" className="w-full justify-start gap-2">
                    <LogOut /> Logout
                </Button>
            </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
             <Link href="/admin/submissions" passHref>
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Submissions
                </Button>
            </Link>
            <Button onClick={handleDownload} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" /> Download
            </Button>
        </div>
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>View Submission</CardTitle>
                <CardDescription>Review the student's submitted answers for the exam.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <div className="pt-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                ) : hydratedSubmission ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{hydratedSubmission.examTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                                Submitted by: <span className="font-medium text-foreground">{hydratedSubmission.studentName}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Date: <span className="font-medium text-foreground">{format(hydratedSubmission.timestamp as Date, 'PPP p')}</span>
                            </p>
                        </div>
                        <Separator />
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                            {questions.map((question, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    Question {index + 1}: {question.substring(0, 100)}{question.length > 100 ? '...' : ''}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                                        <p className="font-semibold text-primary">Full Question:</p>
                                        <p className="whitespace-pre-wrap">{question}</p>
                                        <Separator />
                                        <p className="font-semibold text-primary">Student's Answer:</p>
                                        <p className="whitespace-pre-wrap text-foreground/80">
                                            {hydratedSubmission.answers[index] || 'No answer provided.'}
                                        </p>
                                    </div>
                                </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        {questions.length === 0 && <p className='text-muted-foreground'>No questions found for this exam.</p>}
                    </div>
                ) : (
                    <p className='text-center text-muted-foreground'>Submission not found.</p>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

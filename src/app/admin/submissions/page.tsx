'use client';

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, LogOut, Upload, Users, FileText, Loader2, AlertCircle, Download, Eye } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Submission, Student, Exam, HydratedSubmission } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function ViewSubmissionsPage() {
  const firestore = useFirestore();

  const submissionsQuery = useMemoFirebase(() => firestore ? collection(firestore, "responses") : null, [firestore]);
  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const examsQuery = useMemoFirebase(() => firestore ? collection(firestore, "exams") : null, [firestore]);

  const { data: submissions, isLoading: isLoadingSubmissions } = useCollection<Submission>(submissionsQuery);
  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);
  const { data: exams, isLoading: isLoadingExams } = useCollection<Exam>(examsQuery);
  
  const isLoading = isLoadingSubmissions || isLoadingStudents || isLoadingExams;

  const hydratedSubmissions = useMemo((): HydratedSubmission[] => {
    if (!submissions || !students || !exams) return [];
    
    const studentMap = new Map(students.map(s => [s.id, s.name]));
    const examMap = new Map(exams.map(e => [e.id, { title: e.title, questionText: e.questionText }]));

    return submissions.map(sub => {
        const timestamp = sub.timestamp as any; // Firestore timestamp object
        const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date();

        return {
            ...sub,
            studentName: studentMap.get(sub.studentId) || 'Unknown Student',
            examTitle: examMap.get(sub.examId)?.title || 'Unknown Exam',
            examQuestionText: examMap.get(sub.examId)?.questionText,
            timestamp: date,
        }
    }).sort((a, b) => (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime());
  }, [submissions, students, exams]);

  const handleDownload = (submission: HydratedSubmission) => {
    if (!submission.examQuestionText) {
        alert("Cannot download: Question text is missing for this exam.");
        return;
    }
    
    const questions = submission.examQuestionText.split('\n').filter(q => q.trim() !== '');

    let content = `Exam Submission\n\n`;
    content += `Student: ${submission.studentName}\n`;
    content += `Exam: ${submission.examTitle}\n`;
    content += `Date: ${format(submission.timestamp as Date, 'PPP p')}\n`;
    content += `------------------------------------\n\n`;

    questions.forEach((question, index) => {
        content += `Question ${index + 1}:\n${question}\n\n`;
        content += `Answer:\n${submission.answers[index] || 'No answer provided.'}\n\n`;
        content += `------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submission-${submission.studentName}-${submission.examTitle}.txt`;
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
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Exam Submissions</h1>
        </header>

        <Card>
            <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-medium">Student Name</th>
                                <th className="p-4 font-medium">Exam Title</th>
                                <th className="p-4 font-medium">Submission Date</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {isLoading && (
                              <tr>
                                <td colSpan={4} className="text-center p-8">
                                  <div className="flex justify-center items-center">
                                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                                    <span>Loading submissions...</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {!isLoading && hydratedSubmissions.length === 0 && (
                                 <tr>
                                    <td colSpan={4} className="text-center p-8">
                                    <p className="text-muted-foreground">No submissions found.</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && hydratedSubmissions.map((submission) => (
                                <tr key={submission.id} className="border-b">
                                    <td className="p-4">{submission.studentName}</td>
                                    <td className="p-4">{submission.examTitle}</td>
                                    <td className="p-4">{format(submission.timestamp as Date, 'PPP p')}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/submissions/${submission.id}`} passHref>
                                                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View</Button>
                                            </Link>
                                            <Button variant="secondary" size="sm" onClick={() => handleDownload(submission)}>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

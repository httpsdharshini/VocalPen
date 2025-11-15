'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, LogOut, Upload, Users, FileText, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase, useStorage } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Exam } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const examDocRef = useMemoFirebase(() => {
    if (!firestore || !examId) return null;
    return doc(firestore, 'exams', examId);
  }, [firestore, examId]);

  const { data: exam, isLoading: isLoadingExam } = useDoc<Exam>(examDocRef);

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setDuration(String(exam.duration));
      setQuestionText(exam.questionText || '');
    }
  }, [exam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration || !questionText) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields.",
      });
      return;
    }
    
    if (!examDocRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Exam document reference not available. Please try again.",
        });
        return;
    }
    setIsUpdating(true);

    const updatedExamData: Partial<Omit<Exam, 'id'>> = {
      title,
      duration: parseInt(duration, 10),
      questionText,
    };
    
    updateDoc(examDocRef, updatedExamData)
        .then(() => {
            toast({
              title: "Update Successful",
              description: `The exam "${title}" has been updated.`,
            });
            router.push('/admin/exams');
        })
        .catch(error => {
            console.error("Error updating exam: ", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "An error occurred while updating the exam.",
            });
        })
        .finally(() => {
            setIsUpdating(false);
        });
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
                <Button variant="ghost" className="justify-start gap-2 bg-muted">
                    <Upload /> Manage Exams
                </Button>
            </Link>
             <Link href="/admin/submissions" passHref>
                <Button variant="ghost" className="justify-start gap-2">
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
        <div className="mb-8">
             <Link href="/admin/exams" passHref>
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exams
                </Button>
            </Link>
        </div>
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Exam</CardTitle>
                <CardDescription>Update the exam's details and question paper text.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingExam ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Exam Title</Label>
                        <Input 
                          id="title" 
                          placeholder="e.g., Introduction to Modern History" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Time Limit (in minutes)</Label>
                        <Input 
                          id="duration" 
                          type="number" 
                          placeholder="e.g., 30" 
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="qp-text">Question Paper Text</Label>
                        <Textarea
                          id="qp-text"
                          placeholder="Paste the entire question paper text here..."
                          className="min-h-[250px]"
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Copy and paste the questions for the exam.</p>
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Update Exam
                    </Button>
                </form>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

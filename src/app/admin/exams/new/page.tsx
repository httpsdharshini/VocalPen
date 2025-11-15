'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, LogOut, Upload, Users, FileText, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useStorage } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Exam } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';


export default function NewExamPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration || !questionText) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields.",
      });
      return;
    }
    
    if (!firestore) {
       toast({
        variant: "destructive",
        title: "Firebase Error",
        description: "Firestore is not available. Please try again later.",
      });
      return;
    }

    setIsCreating(true);

    try {
      const newExamData: Omit<Exam, 'id'> = {
        title,
        duration: parseInt(duration, 10),
        questionText,
      };
      const examsCollection = collection(firestore, 'exams');
      await addDoc(examsCollection, newExamData);

      toast({
        title: "Exam Created",
        description: `The exam "${title}" has been created.`,
      });
      router.push('/admin/exams');

    } catch (error) {
      console.error("Error creating exam: ", error);
      toast({
          variant: "destructive",
          title: "Exam Creation Error",
          description: "An error occurred while creating the exam. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
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
                <CardTitle>Create New Exam</CardTitle>
                <CardDescription>Fill in the details and paste the questions to create a new exam.</CardDescription>
            </CardHeader>
            <CardContent>
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
                            required
                         />
                        <p className="text-xs text-muted-foreground">Copy and paste the questions for the exam.</p>
                    </div>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Exam
                    </Button>
                </form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

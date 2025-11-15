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
import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Exam } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function NewExamPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { firestore, storage } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration || !pdfFile) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields and upload a question paper.",
      });
      return;
    }
    
    if (!firestore || !storage) {
       toast({
        variant: "destructive",
        title: "Firebase Error",
        description: "Firestore or Storage is not available. Please try again later.",
      });
      return;
    }

    setIsCreating(true);

    try {
      // 1. Create the exam document shell first and get its reference.
      const newExamData: Omit<Exam, 'id' | 'questionPaperUrl'> = {
        title,
        duration: parseInt(duration, 10),
      };
      const examsCollection = collection(firestore, 'exams');
      const docRef = await addDoc(examsCollection, newExamData);

      // 2. Start the file upload process in the background.
      const storageRef = ref(storage, `questionPapers/${docRef.id}_${pdfFile.name}`);
      
      // The promise chain will run in the background without blocking the UI.
      uploadBytes(storageRef, pdfFile)
        .then(uploadResult => getDownloadURL(uploadResult.ref))
        .then(downloadURL => {
            // 3. Update the document with the URL using the non-blocking helper.
            updateDocumentNonBlocking(docRef, { questionPaperUrl: downloadURL });
        })
        .catch(error => {
            console.error("Error during background upload/update: ", error);
            // Optionally, you could implement a more robust global error notification system.
             toast({
                variant: "destructive",
                title: "Background Upload Failed",
                description: `The exam "${title}" was created, but the PDF failed to upload. You can edit the exam to try again.`,
                duration: 5000,
            });
        });

      // 4. Immediately notify the user and navigate away.
      toast({
        title: "Exam Creation Initiated",
        description: `The exam "${title}" is being created in the background.`,
      });
      router.push('/admin/exams');

    } catch (error) {
      console.error("Error creating exam document: ", error);
      toast({
          variant: "destructive",
          title: "Exam Creation Error",
          description: "An error occurred while creating the exam document. Please try again.",
      });
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
                <CardDescription>Fill in the details and upload the question paper to create a new exam.</CardDescription>
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
                        <Label htmlFor="qp-pdf">Question Paper (PDF)</Label>
                         <Input 
                          id="qp-pdf"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Upload the exam question paper in PDF format.</p>
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

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
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Exam } from '@/lib/types';

export default function NewExamPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { firestore, storage } = useFirebase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration || !pdfFile) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields and upload a question paper.",
      });
      return;
    }
    setIsLoading(true);

    // 1. Create the exam document shell first
    const newExamData: Omit<Exam, 'id' | 'questionPaperUrl'> = {
      title,
      duration: parseInt(duration, 10),
    };
    const examsCollection = collection(firestore, 'exams');
    addDocumentNonBlocking(examsCollection, newExamData).then(docRef => {
        if (!docRef || !pdfFile || !storage) return;

        // 2. Upload the file
        const storageRef = ref(storage, `questionPapers/${docRef.id}_${pdfFile.name}`);
        
        uploadBytes(storageRef, pdfFile).then(uploadResult => {
            // 3. Get the download URL
            getDownloadURL(uploadResult.ref).then(downloadURL => {
                // 4. Update the document with the URL
                updateDocumentNonBlocking(docRef, { questionPaperUrl: downloadURL });
            });
        }).catch(error => {
            console.error("Error uploading file: ", error);
            toast({
                variant: "destructive",
                title: "File Upload Error",
                description: "An error occurred while uploading the PDF. Please try again.",
            });
        });
    });

    toast({
      title: "Exam Creation Started",
      description: `The exam "${title}" is being created in the background.`,
    });
    router.push('/admin/exams');
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
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Exam
                    </Button>
                </form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

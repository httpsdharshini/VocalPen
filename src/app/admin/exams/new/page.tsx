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
import { collection, DocumentReference } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Exam } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function NewExamPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      // 1. Create the exam document shell first, but this time, wait for the reference.
      const newExamData: Omit<Exam, 'id' | 'questionPaperUrl'> = {
        title,
        duration: parseInt(duration, 10),
      };
      const examsCollection = collection(firestore, 'exams');
      const docRef = await addDoc(examsCollection, newExamData);

      // Now that we have the docRef, we can proceed with the upload.
      if (!docRef || !pdfFile || !storage) {
        throw new Error("Failed to create document or missing file/storage instance.");
      }

      // 2. Upload the file
      const storageRef = ref(storage, `questionPapers/${docRef.id}_${pdfFile.name}`);
      const uploadResult = await uploadBytes(storageRef, pdfFile);
      
      // 3. Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // 4. Update the document with the URL using the non-blocking helper
      updateDocumentNonBlocking(docRef, { questionPaperUrl: downloadURL });

      toast({
        title: "Exam Creation Started",
        description: `The exam "${title}" is being created in the background.`,
      });
      router.push('/admin/exams');

    } catch (error) {
      console.error("Error creating exam: ", error);
      toast({
          variant: "destructive",
          title: "Exam Creation Error",
          description: "An error occurred while creating the exam. Please try again.",
      });
       setIsLoading(false);
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

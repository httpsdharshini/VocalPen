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
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Student } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !studentId) return null;
    return doc(firestore, 'students', studentId);
  }, [firestore, studentId]);

  const { data: student, isLoading: isLoadingStudent } = useDoc<Student>(studentDocRef);

  useEffect(() => {
    if (student) {
      setRegNumber(student.regNumber);
      setName(student.name);
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber || !name) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required fields.",
      });
      return;
    }
    setIsLoading(true);

    try {
      if (!studentDocRef) throw new Error("Student document reference not available");
      
      const updatedStudentData: Partial<Student> = {
        regNumber,
        name,
      };

      if (imageFile) {
        updatedStudentData.imageUrl = `/uploads/images/${imageFile.name}`;
        updatedStudentData.hasImage = true;
      }
      if (voiceFile) {
        updatedStudentData.voiceUrl = `/uploads/voices/${voiceFile.name}`;
        updatedStudentData.hasVoice = true;
      }

      await updateDocumentNonBlocking(studentDocRef, updatedStudentData);

      toast({
        title: "Student Updated",
        description: `${name} has been successfully updated.`,
      });
      router.push('/admin/students');

    } catch (error) {
      console.error("Error updating student: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the student. Please try again.",
      });
    } finally {
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
                <Button variant="ghost" className="justify-start gap-2 bg-muted">
                    <Users /> Manage Students
                </Button>
            </Link>
             <Link href="/admin/exams" passHref>
                <Button variant="ghost" className="justify-start gap-2">
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
             <Link href="/admin/students" passHref>
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Students
                </Button>
            </Link>
        </div>
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Student</CardTitle>
                <CardDescription>Update the student's details and verification data.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingStudent ? (
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
                      <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="regNumber">Registration Number</Label>
                        <Input 
                          id="regNumber" 
                          placeholder="e.g., S12345" 
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g., John Doe" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Student Image</Label>
                        <Input 
                          id="image" 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <p className="text-xs text-muted-foreground">Upload a new file to replace the existing one. Current: {student?.hasImage ? 'Image on file' : 'None'}</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="voice">Voice Recording</Label>
                        <Input 
                          id="voice" 
                          type="file" 
                          accept="audio/*" 
                          onChange={(e) => setVoiceFile(e.target.files ? e.target.files[0] : null)}
                        />
                         <p className="text-xs text-muted-foreground">Upload a new file to replace the existing one. Current: {student?.hasVoice ? 'Recording on file' : 'None'}</p>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Update Student
                    </Button>
                </form>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

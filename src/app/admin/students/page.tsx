'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, LogOut, PlusCircle, Upload, Users, FileText, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from "firebase/firestore";
import type { Student } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function ManageStudentsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "students");
  }, [firestore]);
  
  const { data: students, isLoading, error } = useCollection<Student>(studentsQuery);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleDelete = (student: Student) => {
    if (!firestore) return;
    const studentDocRef = doc(firestore, 'students', student.id);
    deleteDocumentNonBlocking(studentDocRef);
    toast({
        title: "Student Deleted",
        description: `${student.name} has been removed.`,
    });
    setStudentToDelete(null);
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 flex flex-col">
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
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Students</h1>
            <Link href="/admin/students/new" passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
                </Button>
            </Link>
        </header>

        <Card>
            <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-medium">Registration No.</th>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Image Uploaded</th>
                                <th className="p-4 font-medium">Voice Recorded</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                              <tr>
                                <td colSpan={5} className="text-center p-8">
                                  <div className="flex justify-center items-center">
                                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                                    <span>Loading students...</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {error && (
                               <tr>
                                <td colSpan={5} className="p-4">
                                  <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                      Failed to load students. Please check your connection and try again.
                                    </AlertDescription>
                                  </Alert>
                                </td>
                              </tr>
                            )}
                            {!isLoading && !error && students?.length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center p-8">
                                  <p className="text-muted-foreground">No students found. Add a new student to get started.</p>
                                </td>
                              </tr>
                            )}
                            {!isLoading && students && students.map((student) => (
                                <tr key={student.id} className="border-b">
                                    <td className="p-4">{student.regNumber}</td>
                                    <td className="p-4">{student.name}</td>
                                    <td className="p-4">{student.hasImage ? 'Yes' : 'No'}</td>
                                    <td className="p-4">{student.hasVoice ? 'Yes' : 'No'}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/students/${student.id}/edit`} passHref>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                            <Button variant="destructive" size="sm" onClick={() => setStudentToDelete(student)}>Delete</Button>
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

       {studentToDelete && (
        <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student record for <span className='font-bold'>{studentToDelete.name}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(studentToDelete)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

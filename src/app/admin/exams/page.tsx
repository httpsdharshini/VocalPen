'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, LogOut, PlusCircle, Upload, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";

// Mock Data for exams
const exams = [
  { id: 1, title: "Introduction to History", questions: 3, timeLimit: 30 },
  { id: 2, title: "Algebra Midterm", questions: 10, timeLimit: 60 },
  { id: 3, title: "Physics Final", questions: 25, timeLimit: 120 },
];

export default function ManageExamsPage() {
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
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Exams</h1>
            <Link href="/admin/exams/new" passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Exam
                </Button>
            </Link>
        </header>

        <Card>
            <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-medium">Exam Title</th>
                                <th className="p-4 font-medium">No. of Questions</th>
                                <th className="p-4 font-medium">Time Limit (mins)</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((exam) => (
                                <tr key={exam.id} className="border-b">
                                    <td className="p-4">{exam.title}</td>
                                    <td className="p-4">{exam.questions}</td>
                                    <td className="p-4">{exam.timeLimit}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="destructive" size="sm">Delete</Button>
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

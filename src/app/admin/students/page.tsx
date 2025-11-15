'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, LogOut, PlusCircle, Upload, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";

// Mock Data for students
const students = [
  { id: 1, regNumber: "S12345", name: "John Doe", hasImage: true, hasVoice: true },
  { id: 2, regNumber: "S12346", name: "Jane Smith", hasImage: true, hasVoice: false },
  { id: 3, regNumber: "S12347", name: "Peter Jones", hasImage: false, hasVoice: true },
];

export default function ManageStudentsPage() {
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
                    <Upload /> Upload Questions
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
                            {students.map((student) => (
                                <tr key={student.id} className="border-b">
                                    <td className="p-4">{student.regNumber}</td>
                                    <td className="p-4">{student.name}</td>
                                    <td className="p-4">{student.hasImage ? 'Yes' : 'No'}</td>
                                    <td className="p-4">{student.hasVoice ? 'Yes' : 'No'}</td>
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

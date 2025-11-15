'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, LogOut, Upload, Users, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { VocalPenLogo } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewStudentPage() {
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
                <CardTitle>Add New Student</CardTitle>
                <CardDescription>Enter the student's details and upload their verification data.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="regNumber">Registration Number</Label>
                        <Input id="regNumber" placeholder="e.g., S12345" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="e.g., John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Student Image</Label>
                        <Input id="image" type="file" accept="image/*" />
                        <p className="text-xs text-muted-foreground">Upload a clear, forward-facing photo.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="voice">Voice Recording</Label>
                        <Input id="voice" type="file" accept="audio/*" />
                         <p className="text-xs text-muted-foreground">Upload a clear recording of the student stating their name.</p>
                    </div>
                    <Button type="submit">Save Student</Button>
                </form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

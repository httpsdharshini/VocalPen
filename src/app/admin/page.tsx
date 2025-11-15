'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, LogOut, PlusCircle, Upload, Users } from 'lucide-react';
import { VocalPenLogo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
            <VocalPenLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VocalPen</span>
        </div>
        <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start gap-2 bg-muted">
                <Home /> Dashboard
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
                <Users /> Manage Students
            </Button>
             <Button variant="ghost" className="justify-start gap-2">
                <Upload /> Upload Questions
            </Button>
        </nav>
        <div className="mt-auto">
            <Separator className="my-4" />
            <Link href="/" passHref>
                 <Button variant="outline" className="w-full justify-start gap-2">
                    <LogOut /> Logout
                </Button>
            </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Students</CardTitle>
              <CardDescription>Add, edit, or remove student verification data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Here you can manage student profiles including their registration number, photo, and voice sample.
              </p>
              <Button>Go to Students</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Question Papers</CardTitle>
              <CardDescription>Create or upload new exams for students.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Upload a formatted file to create a new exam with questions and a time limit.
              </p>
              <Button>Upload Exam</Button>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>View Exam Results</CardTitle>
              <CardDescription>Review submitted exams and student answers.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground mb-4">
                Access and download the transcribed answers from completed exams.
              </p>
              <Button variant="outline">View Submissions</Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

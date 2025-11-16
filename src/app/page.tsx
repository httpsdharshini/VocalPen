
'use client';

import { VocalPenLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-4">
                <VocalPenLogo className="h-16 w-16 text-primary" />
                <h1 className="text-5xl font-bold tracking-tight">VocalPen</h1>
            </div>
            <p className="text-xl text-muted-foreground">
                An AI-powered exam assistant for voice-based answers.
            </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <User className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>For Students</CardTitle>
                    <CardDescription>Start your voice-based exam session.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">
                        Proceed to the student portal to log in, verify your identity, and begin your exam using only your voice.
                    </p>
                    <Link href="/exam" passHref>
                        <Button className="w-full">
                            Go to Student Exam <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <ShieldCheck className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>For Administrators</CardTitle>
                    <CardDescription>Manage exams, students, and submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="mb-6 text-muted-foreground">
                        Access the admin dashboard to create exams, manage student verification data, and review submissions.
                    </p>
                    <Link href="/admin/login" passHref>
                        <Button variant="outline" className="w-full">
                            Go to Admin Login <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </main>
         <footer className="text-center mt-12 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} VocalPen. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
'use client';

import { ArrowRight, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VocalPenLogo } from '@/components/icons';

export default function RoleSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <VocalPenLogo className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to VocalPen</h1>
            <p className="text-muted-foreground mt-2">Please select your role to continue.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          <Card className="text-center hover:shadow-xl transition-shadow">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Student</CardTitle>
                <CardDescription>Take an exam using your voice.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/exam">
                    <Button className="w-full">
                        Proceed as Student <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-shadow">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 mb-2">
                    <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Administrator</CardTitle>
                <CardDescription>Manage exams and students.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/admin/login">
                    <Button variant="outline" className="w-full">
                        Admin Login <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

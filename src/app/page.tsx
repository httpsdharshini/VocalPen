import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VocalPenLogo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-6">
        <Card className="w-full max-w-md text-center shadow-2xl">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <VocalPenLogo className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome to VocalPen
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your AI-powered exam assistant for voice-based answers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm">
              Complete your exams by speaking your answers. VocalPen transcribes your voice in real-time and allows for easy voice-based editing.
            </p>
            <Link href="/exam">
              <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Start Exam
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

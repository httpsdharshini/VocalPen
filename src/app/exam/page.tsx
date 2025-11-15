'use client';

import { editAnswerWithVoiceCommands } from '@/ai/flows/edit-answers-with-voice-commands';
import { transcribeStudentAnswer } from '@/ai/flows/transcribe-student-answers';
import { VocalPenLogo } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  ChevronRight,
  Download,
  Loader2,
  LogIn,
  Mic,
  RotateCcw,
  Scissors,
  Square,
  Timer,
  Trash2,
  User,
  Volume2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useMemo } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import type { Student, Exam } from '@/lib/types';
import { format } from 'date-fns';

type ExamStep = 'login' | 'verification' | 'selectExam' | 'takingExam' | 'finished';

export default function ExamPage() {
  const [step, setStep] = useState<ExamStep>('login');

  // Login state
  const [regNumber, setRegNumber] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  
  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Exam selection state
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Taking exam state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { firestore } = useFirebase();

  const questions = useMemo(() => {
    return selectedExam?.questionText?.split('\n').filter(q => q.trim() !== '') || [];
  }, [selectedExam]);

  // Fetch exams for selection
  const examsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'exams') : null, [firestore]);
  const { data: exams, isLoading: isLoadingExams } = useCollection<Exam>(examsQuery);
  
  // Camera permission for verification
  useEffect(() => {
    if (step === 'verification') {
        const getCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
        };

        getCameraPermission();
        
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }
  }, [step, toast]);


  // Timer effect
  useEffect(() => {
    if (examStarted && step === 'takingExam' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && examStarted) {
      handleFinishExam();
    }
  }, [examStarted, step, timeLeft]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim() || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a registration number.' });
        return;
    }
    setIsLoggingIn(true);
    try {
        const studentsRef = collection(firestore, 'students');
        const q = query(studentsRef, where('regNumber', '==', regNumber.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'No student found with that registration number.' });
            setStudent(null);
        } else {
            const studentDoc = querySnapshot.docs[0];
            setStudent({ id: studentDoc.id, ...studentDoc.data() } as Student);
            toast({ title: 'Login Successful', description: `Welcome, ${studentDoc.data().name}.` });
            setStep('verification');
        }
    } catch (error) {
        console.error("Login error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during login. Please try again.' });
    } finally {
        setIsLoggingIn(false);
    }
  };

  const handleStartVerification = () => {
    setIsProcessing(true);
    setVerificationStatus('pending');
    setTimeout(() => {
      // In a real scenario, this would involve AI-based face and voice matching.
      // We are simulating a successful verification based on finding the student.
      if (student) {
        setIsVerified(true);
        setIsProcessing(false);
        setVerificationStatus('success');
        toast({
          title: 'Verification Successful',
          description: 'You can now proceed to select your exam.',
        });
      } else {
        handleSimulateMismatch();
      }
    }, 2000);
  };

  const handleSimulateMismatch = () => {
    setIsProcessing(true);
    setVerificationStatus('pending');
    setTimeout(() => {
      setIsVerified(false);
      setIsProcessing(false);
      setVerificationStatus('error');
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'Identity verification failed. Please try again.',
      });
    }, 2000);
  };

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
    setTimeLeft(exam.duration * 60);
    setAnswers(Array(exam.questionText.split('\n').filter(q => q.trim() !== '').length).fill(''));
    setStep('takingExam');
    setExamStarted(true);
  };

  const handleReadQuestion = () => {
    if (!selectedExam) return;
    const currentQuestionText = questions[currentQuestionIndex];
    if ('speechSynthesis' in window && currentQuestionText) {
      const utterance = new SpeechSynthesisUtterance(currentQuestionText);
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Text-to-speech is not supported in your browser.',
      });
    }
  };

  const startRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const isVerificationStep = step === 'verification';
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          try {
            if (isVerificationStep) {
                // Mock voice verification
                setTimeout(() => {
                    handleStartVerification();
                }, 1500)
            } else {
                const result = await transcribeStudentAnswer({ audioDataUri });
                setCurrentAnswer(prev => (prev ? prev + ' ' : '') + result.transcription);
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              variant: 'destructive',
              title: 'Transcription Error',
              description: 'Could not transcribe audio. Please try again.',
            });
          } finally {
            setIsProcessing(false);
            // Clean up stream tracks
            stream.getTracks().forEach(track => track.stop());
          }
        };
      };

      mediaRecorderRef.current.start();
      if(isVerificationStep) {
        setIsVoiceRecording(true);
      } else {
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Microphone access error:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to record your answer.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if(step === 'verification') {
        setIsVoiceRecording(false);
      } else {
        setIsRecording(false);
      }
    }
  };

  const handleVoiceEdit = async (command: string) => {
    if (!currentAnswer.trim()) {
      toast({ title: 'Nothing to edit', description: 'Your answer is empty.' });
      return;
    }
    setIsProcessing(true);
    try {
      const result = await editAnswerWithVoiceCommands({
        answerText: currentAnswer,
        voiceCommand: command,
      });
      setCurrentAnswer(result.editedAnswerText);
    } catch (error) {
      console.error('Editing error:', error);
      toast({
        variant: 'destructive',
        title: 'Editing Error',
        description: 'Could not process the edit command.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    setCurrentAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(answers[currentQuestionIndex + 1] || '');
    } else {
      handleFinishExam(newAnswers);
    }
  };
  
  const handleFinishExam = async (finalAnswers = answers) => {
    if (!firestore || !student || !selectedExam) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit exam. Missing required data.' });
      return;
    }
    
    // Save the final answer for the current question
    const newAnswers = [...finalAnswers];
    if (currentAnswer) {
      newAnswers[currentQuestionIndex] = currentAnswer;
    }
    setAnswers(newAnswers);
    
    setExamStarted(false);
    
    try {
        const submissionData = {
            studentId: student.id,
            examId: selectedExam.id,
            answers: newAnswers,
            timestamp: new Date(),
        };
        const responsesCollection = collection(firestore, 'responses');
        await addDoc(responsesCollection, submissionData);
        setStep('finished');

    } catch (error) {
        console.error("Error submitting exam:", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error submitting your answers.' });
    }
  };

  const handleDownloadAnswers = () => {
    if (!selectedExam || !student) return;
    let content = `Exam: ${selectedExam.title}\n`;
    content += `Student: ${student.name} (${student.regNumber})\n`;
    content += `Date: ${new Date().toLocaleString()}\n\n`;

    questions.forEach((q, index) => {
      content += `--- Question ${index + 1} ---\n`;
      content += `${q}\n\n`;
      content += `--- Answer ---\n`;
      content += `${answers[index] || 'No answer provided.'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocalpen-exam-${student.regNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressValue =
    step === 'login' ? 0 
    : step === 'verification' ? 25
    : step === 'selectExam' ? 50
    : step === 'takingExam' ? 50 + (((currentQuestionIndex + 1) / (questions.length || 1)) * 50)
    : 100;
  
  const renderLoginStep = () => (
     <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Student Login</CardTitle>
        <CardDescription>Please enter your registration number to proceed.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                    id="regNumber"
                    placeholder="e.g., S12345"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    required
                />
            </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Login
            </Button>
        </CardFooter>
      </form>
    </Card>
  );

  const renderVerificationStep = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>Welcome, <span className='font-bold text-primary'>{student?.name}</span>. Please verify your identity to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex justify-center items-center h-64 w-full bg-muted rounded-lg border-2 border-dashed overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <div className="absolute inset-0 flex justify-center items-center bg-black/30">
                {isProcessing ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : verificationStatus === 'success' ? (
                    <CheckCircle className="h-24 w-24 text-green-500" />
                ) : verificationStatus === 'error' ? (
                    <XCircle className="h-24 w-24 text-destructive" />
                ) : !hasCameraPermission ? (
                    <div className="text-center text-white p-4">
                        <Camera className="h-12 w-12 mx-auto mb-2" />
                        <p>Camera access is required for verification.</p>
                    </div>
                ) : null}
            </div>
        </div>
        <Alert>
          <User className="h-4 w-4" />
          <AlertTitle>Instructions</AlertTitle>
          <AlertDescription>
            Center your face in the camera, then record a short voice sample stating your full name clearly.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {isVoiceRecording ? "Recording your voice... Say your name." : "Ready to record your voice sample."}
            </p>
             <Button 
                onClick={isVoiceRecording ? stopRecording : startRecording}
                size="lg"
                className={`rounded-full w-20 h-20 text-white ${isVoiceRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                disabled={isProcessing || !hasCameraPermission}
            >
                {isVoiceRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-between gap-2">
         <Button variant="outline" onClick={() => { setStep('login'); setStudent(null); setIsVerified(false); setVerificationStatus('pending')}}>
            Back to Login
        </Button>
        {isVerified ? (
          <Button onClick={() => setStep('selectExam')} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
            Proceed to Exam Selection <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleStartVerification} disabled={isProcessing || isVoiceRecording} className="w-full sm:w-auto">
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Identity
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderSelectExamStep = () => (
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle>Select Exam</CardTitle>
            <CardDescription>Choose the exam you wish to take.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingExams ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Loading exams...</p>
                </div>
            ) : exams && exams.length > 0 ? (
                <div className="space-y-4">
                    {exams.map(exam => (
                        <button key={exam.id} onClick={() => handleStartExam(exam)} className='w-full'>
                            <Card className="hover:bg-muted/50 hover:shadow-md transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="text-left">
                                        <h3 className="font-semibold">{exam.title}</h3>
                                        <p className="text-sm text-muted-foreground">{exam.duration} minutes</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground p-8">No exams available at this time.</p>
            )}
        </CardContent>
    </Card>
  );

  const renderTakingExamStep = () => (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <CardDescription>Read the question carefully before answering.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={handleReadQuestion}>
                <Volume2 className="h-5 w-5" />
            </Button>
        </CardHeader>
        <CardContent>
            <p className="text-lg leading-relaxed">{questions[currentQuestionIndex]}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Your Answer</CardTitle>
            <CardDescription>Click the microphone to record your answer. Use voice commands to edit.</CardDescription>
        </CardHeader>
        <CardContent>
            <Textarea 
              placeholder="Your transcribed answer will appear here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[200px] text-base"
              disabled={isProcessing || isRecording}
            />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-center gap-4">
                <Button variant="outline" size="sm" onClick={() => handleVoiceEdit('Strike last word')} disabled={isProcessing || isRecording}>
                    <Scissors className="mr-2 h-4 w-4" /> Strike Word
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleVoiceEdit('Strike last sentence')} disabled={isProcessing || isRecording}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Strike Sentence
                </Button>
                 <Button variant="destructive" size="sm" onClick={() => handleVoiceEdit('Start over')} disabled={isProcessing || isRecording}>
                    <Trash2 className="mr-2 h-4 w-4" /> Start Over
                </Button>
            </div>
            <div className="flex w-full items-center justify-between">
                <div className="w-32">
                  {isProcessing && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</p>}
                </div>
                <Button 
                    onClick={isRecording ? stopRecording : startRecording}
                    size="lg"
                    className={`rounded-full w-20 h-20 text-white ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                    disabled={isProcessing}
                >
                    {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
                <div className="w-32 text-right">
                    <Button onClick={handleNextQuestion} disabled={isProcessing || isRecording}>
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );

  const renderFinishedStep = () => (
     <Card className="w-full max-w-2xl text-center">
        <CardHeader>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <CardTitle className="text-3xl">Exam Completed</CardTitle>
            <CardDescription>You have successfully submitted your answers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-center items-baseline gap-2 text-2xl">
                <span className="text-muted-foreground">Time Taken:</span>
                <span className="font-bold">{formatTime((selectedExam?.duration ?? 0)*60 - timeLeft)}</span>
            </div>
            <p className="text-muted-foreground">Your answers have been saved. You can download a copy for your records.</p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button size="lg" onClick={handleDownloadAnswers} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download Answers
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">Return to Home</Button>
            </Link>
        </CardFooter>
     </Card>
  );

  const renderStep = () => {
    switch (step) {
        case 'login': return renderLoginStep();
        case 'verification': return renderVerificationStep();
        case 'selectExam': return renderSelectExamStep();
        case 'takingExam': return renderTakingExamStep();
        case 'finished': return renderFinishedStep();
        default: return renderLoginStep();
    }
  }


  return (
    <div className="flex min-h-screen flex-col items-center bg-background font-body">
      <header className="w-full border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <VocalPenLogo className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">VocalPen</span>
            </Link>
            {examStarted && step === 'takingExam' && (
                <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
                    <Timer className="h-5 w-5 text-primary" />
                    <span>Time Left: {formatTime(timeLeft)}</span>
                </div>
            )}
             {student && (step === 'verification' || step === 'selectExam') && (
                <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-5 w-5 text-primary" />
                    <span>{student.name} ({student.regNumber})</span>
                </div>
            )}
        </div>
      </header>
      
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-4 mb-8">
          <Progress value={progressValue} className="w-full h-2" />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span className={step === 'login' ? 'text-primary font-semibold' : ''}>Login</span>
            <span className={step === 'verification' ? 'text-primary font-semibold' : ''}>Verification</span>
            <span className={step === 'selectExam' ? 'text-primary font-semibold' : ''}>Select Exam</span>
            <span className={step === 'takingExam' ? 'text-primary font-semibold' : ''}>Exam in Progress</span>
            <span className={step === 'finished' ? 'text-primary font-semibold' : ''}>Finished</span>
          </div>
        </div>
        {renderStep()}
      </main>
    </div>
  );
}

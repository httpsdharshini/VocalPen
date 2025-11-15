# **App Name**: VocalPen

## Core Features:

- Identity Verification: Uses facial and voice recognition (Firebase ML or Vision API) to confirm the student's identity by comparing the captured face and voice with stored templates.
- Question Reading: Text-to-speech functionality to read exam questions aloud, fetching questions from Firestore (exams/{examId}/questions/{qId}). Allows repetition of questions. Reads only the question, starting with the first question or section (e.g., Part A) upon user acknowledgment.
- Answer Dictation: Speech-to-text conversion to transcribe the student's spoken answers accurately. Listens until the user indicates completion and automatically downloads the transcribed text in PDF format after the exam.
- Voice Editing: Enables voice commands like 'Strike last word,' 'Strike last sentence,' and 'Start over' to edit the dictated answer. An AI tool listens to user commands to control editing.
- Answer Storage: Saves student answers securely in Firestore (exams/{examId}/responses/{studentId}/{qId}) with student ID, question ID, timestamp, and answer text.
- Exam Monitoring: Logs the total time taken to complete the exam and ensures answers cannot be altered after submission unless admin unlocks. Maintains integrity of the exam by avoiding hints or answers, respecting exam time limits.
- Error Handling: Provides prompts and actions for when background noise is detected, a student stays silent for too long, or a facial mismatch occurs, giving useful error messaging.

## Style Guidelines:

- Primary color: Soft blue (#72BCD4), symbolizing trust and calmness for a focused exam environment.
- Background color: Light grey (#F0F4F7), offering a neutral backdrop that reduces screen glare and enhances readability.
- Accent color: Warm yellow (#FFDA63) to highlight key interactive elements such as buttons, important notifications, or active options, creating a gentle call to action.
- Body and headline font: 'Inter' sans-serif for clear and accessible readability.
- Code font: 'Source Code Pro' for displaying code snippets.
- Simple, professional icons for commands such as repeat, submit, and edit to aid quick navigation and interaction.
- Clean and straightforward layout, emphasizing the current question and minimizing distractions. Prioritize intuitive placement of voice command prompts and feedback messages.
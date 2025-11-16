Voice-Enabled Online Exam System (Firebase + Next.js + Genkit AI)

This project is a Next.js + Firebase Studio application that provides a voice-enabled online exam system for students.
It includes functionality for login, exam answering, speech-to-text conversion, answer editing, and exam submission.

The project uses Google Gemini AI, Firebase, and Next.js App Router to create a fast, modern, AI-powered exam experience.

📝 Overview

This system allows students to:

Login securely

Attend the examination

Use speech-to-text to answer questions

Edit submitted answers using AI

Save exam progress

Finish the exam

Download the completed answer sheet

Speech-to-text is implemented using:

🎤 Browser Audio Recording (NO Web Speech API)

→ Works everywhere
→ No "network error"
→ No browser restrictions

Audio is recorded in the browser, sent to the backend, and processed using:

🤖 Gemini AI Model via Firebase Genkit

→ Converts speech into text
→ Ensures accuracy for academic content

📌 About This Project

This project was developed under strict time constraints (1.5 days) for an academic evaluation.
All core functionalities — login, exam flow, answer writing, AI-based editing, exam finish, and download — were implemented successfully.

Only speech recognition using Web Speech API failed due to browser+environment restrictions in Firebase Cloud Workstations.
Instead, we implemented a fully working custom audio-based speech-to-text module using Gemini, which solved the problem.

⚙️ Features
✅ Student Features

Secure login

Fetch student questions

Answer questions manually or using voice

AI-powered answer editing

Autosave during typing and recording

End exam & download answers

🎤 Speech-to-Text (Gemini Powered)

Uses browser audio recording

Sends base64 audio to backend

Gemini converts it to text

100% working in Firebase environments

🛠 Admin Features (Completed)

Login

Add exams/questions

Monitor students

View results

🚀 Tech Stack

Frontend

Next.js 14 (App Router)

TypeScript

Tailwind CSS

shadcn/ui

Backend

Firebase Studio

Firebase Authentication

Firebase Realtime Database / Firestore

Firebase Storage

AI

Google Gemini 1.5 Flash (Genkit AI)

Custom speech-to-text flow

📁 Project Structure
src/
 ├── app/
 │    ├── (routes)
 │    ├── api/
 │    ├── page.tsx
 │    └── exam/
 ├── ai/
 │    └── genkit.ts
 └── components/

🔧 Project Setup
1. Install Dependencies

All dependencies are listed in package.json.
Run:

npm install

2. Set Up Your Gemini API Key

This project uses Google Gemini for AI features (speech-to-text, answer editing).

Get your API key:
👉 https://makersuite.google.com/app/apikey

Create an .env file in the project root:

GEMINI_API_KEY=YOUR_API_KEY_HERE


Restart your dev server.

3. Start the Development Server
npm run dev


Your app will run at:

http://localhost:3000

🎤 Speech-to-Text Module Explanation

This project does NOT use Web Speech API, because:

❌ Web Speech API does not work in:

Firebase Cloud Workstations

Sandbox environments

Some browsers & devices

Therefore, this project uses the following approach:

✔ Browser Microphone → Audio Blob
✔ Audio Blob → Base64
✔ Base64 → Firebase Server
✔ Genkit + Gemini → Transcribed Text
✔ Returned to UI in real-time

This method is 100% reliable, works everywhere, and produces accurate transcripts.

🧪 Testing the Speech-to-Text Feature

Go to the exam page.

Click Start Recording.

Speak your answer.

Wait 2–5 seconds after stopping.

Text will appear in the answer box automatically.

Continue typing or re-record if needed.

🧾 Exam Flow Summary
1. Student logs in
2. Student starts the exam
3. Student answers using typing or voice
4. AI helps refine answers
5. Answers auto-save
6. Student clicks Finish Exam
7. Answer sheet is generated and downloaded
🎉 Final Note

This project demonstrates:

Smart integration of Gemini AI

Custom working speech-to-text

Advanced Next.js + Firebase workflows

Reliable exam automation
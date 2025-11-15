# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Project Setup

### 1. Install Dependencies

The necessary packages are listed in `package.json` and will be installed automatically.

### 2. Set Up Your Gemini API Key

This project uses Google's Generative AI for features like speech-to-text. To enable these features, you need a Gemini API key.

1.  **Get an API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to create and copy your API key.
2.  **Create an `.env` file**: In the root directory of the project, create a file named `.env`.
3.  **Add the Key**: Add the following line to your `.env` file, replacing `YOUR_API_KEY_HERE` with the key you copied.

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

After adding your API key, restart the development server for the changes to take effect.

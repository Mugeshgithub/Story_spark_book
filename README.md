# Story Spark

This is a Next.js starter project for building creative applications with AI.

## Local Development Setup

To run this project on your local machine, please follow these steps.

### 1. Set Up Environment Variables

The AI features in this app are powered by Google's Gemini models. You will need an API key to enable them.

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free API key.
2.  Create a file named `.env` in the root directory of this project.
3.  Add the following line to the `.env` file, replacing `YOUR_API_KEY_HERE` with the key you generated:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 2. Install Dependencies

Open your terminal in the project's root directory and run the following command to install all the required packages:

```bash
npm install
```

### 3. Run the Development Servers

This project requires two separate processes to be running in parallel in two different terminals.

**Terminal 1: Start the Next.js Frontend**

This command starts the main user interface of your application.

```bash
npm run dev
```

Your application should now be accessible at `http://localhost:9002`.

**Terminal 2: Start the Genkit AI Backend**

This command starts the server that runs all the AI logic and flows. Using `genkit:watch` ensures it will automatically restart when you make changes to the AI files.

```bash
npm run genkit:watch
```

With both servers running, your local setup is complete. You can now start building!

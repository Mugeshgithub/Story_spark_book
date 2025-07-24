# Story Spark ✨

A modern AI-powered story creation platform that helps writers and storytellers generate engaging stories with AI assistance and beautiful illustrations.

![Story Spark](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### ✍️ **AI-Powered Story Creation**
- **Smart Story Generation** - Create stories with AI assistance
- **Interactive Editor** - Rich text editor with formatting tools
- **Story Templates** - Pre-built templates for different genres
- **Real-time Collaboration** - Work on stories with others

### 🎨 **AI Image Generation**
- **Story Illustrations** - Generate images based on your story content
- **Multiple AI Models** - Support for Hugging Face and other AI models
- **Custom Prompts** - Fine-tune image generation with custom prompts
- **High-Quality Output** - Professional-grade illustrations

### 📚 **Story Management**
- **Story Library** - Organize and manage your stories
- **Gallery View** - Visual browsing of your story collection
- **Export Options** - Download stories in various formats
- **Cloud Storage** - Secure cloud storage for your work

### 🔐 **User Authentication**
- **Secure Login** - Firebase authentication
- **User Profiles** - Personalized experience
- **Data Privacy** - Your stories are private and secure

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- Firebase account (for authentication)
- Hugging Face API key (for image generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mugeshgithub/Story_spark_book.git
   cd Story_spark_book
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
   FIREBASE_API_KEY=your_firebase_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📖 How to Use

### Creating Your First Story

1. **Sign up/Login** - Create an account or sign in
2. **Start New Story** - Click "Create New Story" 
3. **Write Your Story** - Use the rich text editor
4. **Generate Images** - Click the image generation button
5. **Save & Share** - Save your story and share with others

### AI Features

- **Story Suggestions** - Get AI-powered writing suggestions
- **Character Development** - AI helps develop characters
- **Plot Ideas** - Generate plot twists and story arcs
- **Image Generation** - Create illustrations for your stories

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI/ML**: Hugging Face API, Genkit
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Vercel, Firebase Hosting

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── story-creator/  # Story creation pages
│   └── gallery/        # Story gallery
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Feature components
├── ai/                # AI integration
│   └── flows/         # AI workflows
├── lib/               # Utilities and configurations
└── hooks/             # Custom React hooks
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - For the amazing React framework
- **Tailwind CSS** - For the beautiful styling system
- **Hugging Face** - For AI model APIs
- **Firebase** - For backend services
- **Radix UI** - For accessible UI components

## 📞 Support

If you have any questions or need help:

- **Issues**: [GitHub Issues](https://github.com/Mugeshgithub/Story_spark_book/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mugeshgithub/Story_spark_book/discussions)

## 🌟 Star the Repository

If you find this project helpful, please give it a ⭐ star on GitHub!

---

**Made with ❤️ by [Mugesh](https://github.com/Mugeshgithub)**

*Transform your ideas into stories with AI magic! ✨*

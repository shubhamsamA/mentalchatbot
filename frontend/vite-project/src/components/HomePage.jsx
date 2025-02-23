import React, { useState, lazy, Suspense } from "react";
import chatbotIcon from "../Chatbot/Chatbot.png";

const LazyChatbot = lazy(() => import("../Chatbot/Chatbot"));

const HomePage = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      <header className="pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">
          Your Mental Health Companion
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Find peace, support, and guidance on your journey to better mental
          well-being. We&apos;re here to help you every step of the way.
        </p>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transform hover:translate-y-[-5px] transition-all">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">AI Chat Support</h3>
            <p className="text-gray-600">
              24/7 compassionate AI assistant ready to listen and provide
              guidance.
            </p>
          </div>
          <div className="card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transform hover:translate-y-[-5px] transition-all">
            <div className="text-2xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Mood Tracking</h3>
            <p className="text-gray-600">
              Track your emotional well-being and identify patterns over time.
            </p>
          </div>
          <div className="card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transform hover:translate-y-[-5px] transition-all">
            <div className="text-2xl mb-4">🧘‍♀️</div>
            <h3 className="text-xl font-semibold mb-2">Guided Exercises</h3>
            <p className="text-gray-600">
              Access meditation, breathing exercises, and relaxation techniques.
            </p>
          </div>
        </div>
      </main>
      <div
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-5 right-5 bg-slate-50 p-4 rounded-full cursor-pointer shadow-lg hover:shadow-2xl"
        aria-label="Open Chatbot"
      >
        <img src={chatbotIcon} alt="Chatbot" className="h-10 w-10" />
      </div>

      {isChatbotOpen && (
        <Suspense fallback={<div>Loading chatbot...</div>}>
          <LazyChatbot onClose={() => setIsChatbotOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default HomePage;
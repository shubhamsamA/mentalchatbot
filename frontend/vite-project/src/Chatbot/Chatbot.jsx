import React, { useState, useEffect, useRef } from "react";


const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
          setMessages((prev) => [
            ...prev,
            { role: "bot", text: "Unable to access your location. Sharing your location helps find nearby therapists." },
          ]);
        },
        { enableHighAccuracy: true, timeout: 10000 } // Added high accuracy and timeout
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Location services are not supported in your browser." },
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // User message
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText: input, location: userLocation }),
      });

      const data = await response.json();
      const botMessage = { role: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);

      // Add therapist data if available
      if (data.therapists && data.therapists.length > 0) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Here are some nearby therapists:" },
          ...data.therapists.map((therapist) => ({
            role: "bot",
            text: `${therapist.name}, ${therapist.address} (${therapist.rating})`,
          })),
        ]);
      } else if (data.therapists && data.therapists.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "No therapists found nearby. You can consider online therapy options like BetterHelp or Talkspace." },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [...prev, { role: "bot", text: "An error occurred. Please try again later." }]);
    }
  };

  return (
    <div className="fixed bottom-2 right-5 bg-white shadow-lg rounded-lg w-96 h-[600px] flex flex-col z-50">
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center rounded-t-lg">
        <h2 className="text-lg font-semibold">AI THERAPIST</h2>
        <button onClick={onClose} className="text-white">✕</button>
      </div>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded-lg ${
              msg.role === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input field */}
      <div className="p-4 border-t bg-white flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
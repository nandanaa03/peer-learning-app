import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const Chat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch current user and session details
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get current user profile
        const userRes = await axios.get('/api/profile/me', {
          headers: { 'x-auth-token': token }
        });
        // The profile object has the user ID in the 'user' field
        setCurrentUser({ _id: userRes.data.user, name: userRes.data.name });

        // Get session details
        const sessionRes = await axios.get(`/api/session/${sessionId}`, {
          headers: { 'x-auth-token': token }
        });
        setSession(sessionRes.data);

        // Get chat history
        const chatRes = await axios.get(`/api/chat/${sessionId}`, {
          headers: { 'x-auth-token': token }
        });
        setMessages(chatRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();

    // Socket connection
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinRoom', sessionId);

    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [sessionId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current.emit('sendMessage', {
      sessionId,
      senderId: currentUser._id,
      message: newMessage
    });

    setNewMessage('');
  };

  if (!session || !currentUser) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600">Loading chat...</p></div>;

  return (
    <div className="bg-white p-6 rounded-2xl w-full max-w-4xl mx-auto border border-stone-200 flex flex-col h-[90vh]">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="m-0 text-2xl font-bold text-stone-800">Chat: {session.topic}</h2>
        <button onClick={() => navigate(`/session/${sessionId}`)} className="px-4 py-2 bg-stone-500 text-white font-bold rounded-xl hover:bg-stone-600 transition-all">
          Back to Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-amber-50 rounded-xl p-6 mb-4 border border-stone-200 flex flex-col gap-4">
        {messages.length === 0 ? (
          <p className="text-center text-stone-500 py-10">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender._id === currentUser._id;
            return (
              <div key={msg._id || index} className={`max-w-[70%] flex flex-col ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className="text-xs mb-1 font-semibold text-stone-500">
                  {msg.sender.name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`px-4 py-2 text-sm font-medium leading-relaxed ${isMe ? 'bg-orange-500 text-white rounded-t rounded-bl rounded-br-none' : 'bg-white text-stone-800 border border-stone-200 rounded-t rounded-br rounded-bl-none'}`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded border border-stone-300 text-sm outline-none focus:border-orange-400 bg-white"
        />
        <button type="submit" className="px-6 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;

import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { MessagePortail } from '@/types/message';

interface ScrollingMessagesProps {
  className?: string;
}

const ScrollingMessages: React.FC<ScrollingMessagesProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<MessagePortail[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
        setCurrentIndex(0);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Actualiser les messages toutes les 5 minutes
    const messageInterval = setInterval(fetchMessages, 5 * 60 * 1000);
    
    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;

    // Faire défiler les messages toutes les 10 secondes
    const scrollInterval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === messages.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 300); // Durée de la transition
      
    }, 10000); // 10 secondes entre chaque message

    return () => clearInterval(scrollInterval);
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentIndex];

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <Info className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <p className="text-sm font-medium whitespace-nowrap animate-scroll">
              {currentMessage?.contenu}
            </p>
          </div>
        </div>
        {messages.length > 1 && (
          <div className="flex space-x-1">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollingMessages;
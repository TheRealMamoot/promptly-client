import '@styles/PromptDetailModal.css';
import React, { useEffect, useState } from 'react';
import type { Prompt } from '../utils/api';

interface PromptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ isOpen, onClose, prompt }) => {
  const [animationClass, setAnimationClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setAnimationClass('detail-modal-enter');
    } else {
      setAnimationClass('detail-modal-exit');
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) {
    return null;
  }

  if (!prompt) {
    return null;
  }

  return (
    <div className={`detail-modal-overlay ${animationClass}`}>
      <div className={`detail-modal-content ${animationClass}`}>
        <div className="detail-modal-header">
        </div>

        <div className="detail-main-content-area">
          <h3 className="detail-prompt-title">{prompt.title}</h3>
          <p className="detail-prompt-text">{prompt.text}</p>
        </div>

        <div className="detail-modal-footer">
          <button className="detail-modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailModal;

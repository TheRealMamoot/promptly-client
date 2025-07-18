// PromptLibraryModal.tsx
import '@styles/PromptLibraryModal.css';
import React, { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FiCheck, FiCopy } from 'react-icons/fi';
import type { KeyedMutator } from 'swr';
import type { Prompt } from '../utils/api';
import { formatTimeAgo } from '../utils/timeFormatter';
import PromptDetailModal from './PromptDetailModal';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[] | undefined;
  error: any;
  isLoading: boolean;
  isValidating: boolean;
  mutate: KeyedMutator<Prompt[]>;
}

const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  prompts,
  error,
  isLoading,
  isValidating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animationClass, setAnimationClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCopyTick, setShowCopyTick] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setAnimationClass('modal-enter');
    } else {
      setAnimationClass('modal-exit');
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isDetailModalOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isDetailModalOpen]); 

  useEffect(() => {
    if (showCopyTick) {
      const timer = setTimeout(() => {
        setShowCopyTick(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCopyTick]);

  const filteredPrompts = prompts?.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (prompt.category && prompt.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  ) || [];

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  let noPromptsMessage = '';
  const hasPromptsInLibrary = prompts && prompts.length > 0;
  const hasFilteredResults = filteredPrompts.length > 0;

  if (!isLoading && !error && prompts !== undefined) {
    if (!hasPromptsInLibrary) {
      noPromptsMessage = 'Your library is empty. Add some prompts to get started!';
    } else if (!hasFilteredResults) {
      noPromptsMessage = 'No prompts found matching your search. Try a different query!';
    }
  }

  const shouldDisplayNoPromptsMessage = (isOpen || isAnimating) && !isLoading && !error && (noPromptsMessage !== '');

  const handleManage = () => {
    alert("Manage functionality coming soon!");
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      const textToCopy = `Title: ${prompt.title}\nPrompt: ${prompt.text}`;
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      setShowCopyTick(prompt.id);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    }
  };

  const openDetailModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPrompt(null);
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  const showContent = !isLoading && !error && sortedPrompts.length > 0;
  const MAX_PROMPT_TEXT_LENGTH = 80;

  return (
    <>
      <div className={`modal-overlay ${animationClass}`}>
        <div className={`modal-content ${animationClass}`}>
          <div className="modal-header">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-search-input"
            />
          </div>
          <div className="modal-body">
            {error && (
              <p className="error-message">
                Failed to load prompts: {error.message?.message || 'Unknown error'}
              </p>
            )}

            {isLoading && <p>Loading prompts...</p>}

            {shouldDisplayNoPromptsMessage && (
              <p>{noPromptsMessage}</p>
            )}

            {showContent && (
              <div className="prompt-list">
                {sortedPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="prompt-item"
                    onClick={() => openDetailModal(prompt)} 
                  >
                    <div className="prompt-item-header">
                      <h3>{prompt.title}</h3>
                      <div className="prompt-actions">
                          {showCopyTick === prompt.id ? (
                              <FiCheck className="action-icon copy-tick-icon" />
                          ) : (
                              <FiCopy
                                  className="action-icon copy-icon"
                                  onClick={(e) => { 
                                    e.stopPropagation();
                                    handleCopyPrompt(prompt);
                                  }}
                              />
                          )}
                          {prompt.favorite ? (
                              <FaStar className="action-icon favorite-icon favorited" />
                          ) : (
                              <FaRegStar className="action-icon favorite-icon" />
                          )}
                      </div>
                    </div>
                    <p>
                      {prompt.text.length > MAX_PROMPT_TEXT_LENGTH
                        ? prompt.text.substring(0, MAX_PROMPT_TEXT_LENGTH) + '...'
                        : prompt.text}
                    </p>
                    <div className="prompt-timestamp">
                      {formatTimeAgo(prompt.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isValidating && !isLoading && prompts && prompts.length > 0 && (
              <div className="revalidating-indicator">Refreshing library...</div>
            )}
          </div>
          <div className="modal-footer">
            <button className="modal-manage-button" onClick={handleManage}>
              Manage
            </button>
            <button className="modal-close-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      <PromptDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        prompt={selectedPrompt}
      />
    </>
  );
};

export default PromptLibraryModal;
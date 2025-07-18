import React, { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import type { KeyedMutator } from 'swr';
import type { Prompt } from '../utils/api';
import './PromptLibraryModal.css';

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
  isValidating
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animationClass, setAnimationClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

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

  const filteredPrompts = prompts?.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (prompt.category && prompt.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  ) || [];

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

  if (!isOpen && !isAnimating) {
    return null;
  }

  const showContent = !isLoading && !error && filteredPrompts.length > 0;

  return (
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
              {filteredPrompts.map((prompt) => (
                <div key={prompt.id} className="prompt-item">
                  <div className="prompt-item-header">
                    <h3>{prompt.title}</h3>
                    {prompt.favorite ? (
                      <FaStar className="favorite-icon favorited" />
                    ) : (
                      <FaRegStar className="favorite-icon" />
                    )}
                  </div>
                  <p>{prompt.text.substring(0, 150)}{prompt.text.length > 150 ? '...' : ''}</p>
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
  );
};

export default PromptLibraryModal;
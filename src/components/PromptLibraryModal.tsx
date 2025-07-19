import "@styles/PromptLibraryModal.css";
import React, { useCallback, useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import type { KeyedMutator } from "swr";
import { api, API_ROUTES } from "../config/api";
import type { Prompt } from "../utils/api";
import { formatTimeAgo } from "../utils/timeFormatter";
import ConfirmationModal from "./ConfirmationModal";
import PromptDetailModal from "./PromptDetailModal";

// todo: fix favorite requests
// todo: fix favortie orders after change

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
  mutate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [animationClass, setAnimationClass] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCopyTick, setShowCopyTick] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<
    Set<string | number>
  >(new Set());
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setAnimationClass("modal-enter");
    } else {
      setAnimationClass("modal-exit");
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setIsManaging(false);
        setSelectedPromptIds(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        if (isDetailModalOpen) {
          closeDetailModalInitiate();
        } else if (showConfirmationModal) {
          setShowConfirmationModal(false);
        } else if (isManaging) {
          setIsManaging(false);
          setSelectedPromptIds(new Set());
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, isDetailModalOpen, isManaging, showConfirmationModal]);

  useEffect(() => {
    if (showCopyTick) {
      const timer = setTimeout(() => {
        setShowCopyTick(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCopyTick]);

  const filteredPrompts =
    prompts?.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prompt.description &&
          prompt.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (prompt.category &&
          prompt.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (prompt.tags &&
          prompt.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          )),
    ) || [];

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;

    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  let noPromptsMessage = "";
  const hasPromptsInLibrary = prompts && prompts.length > 0;
  const hasFilteredResults = filteredPrompts.length > 0;

  if (!isLoading && !error && prompts !== undefined) {
    if (!hasPromptsInLibrary) {
      noPromptsMessage =
        "Your library is empty. Add some prompts to get started!";
    } else if (!hasFilteredResults) {
      noPromptsMessage =
        "No prompts found matching your search. Try a different query!";
    }
  }

  const shouldDisplayNoPromptsMessage =
    (isOpen || isAnimating) && !isLoading && !error && noPromptsMessage !== "";

  const handleManage = useCallback(() => {
    setIsManaging((prev) => !prev);
    setSelectedPromptIds(new Set());
  }, []);

  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      const textToCopy = `Title: ${prompt.title}\nPrompt: ${prompt.text}`;
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setShowCopyTick(prompt.id);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      console.log("Failed to copy text to clipboard.");
    }
  };

  const handleToggleFavorite = useCallback(
    async (prompt: Prompt) => {
      try {
        await api.patch(`${API_ROUTES.PROMPTS}/${prompt.id}`, {
          favorite: !prompt.favorite,
        });
        mutate();
      } catch (error) {
        console.error("Error toggling favorite status:", error);
      }
    },
    [mutate],
  );

  const openDetailModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDetailModalOpen(true);
  };

  const closeDetailModalInitiate = () => {
    setIsDetailModalOpen(false);
  };

  const onDetailModalAnimationComplete = () => {
    setSelectedPrompt(null);
  };

  const handleUpdateSelectedPromptData = (updatedPrompt: Prompt) => {
    setSelectedPrompt(updatedPrompt);
    mutate();
  };

  const handlePromptSelection = useCallback((promptId: string | number) => {
    setSelectedPromptIds((prevSelected) => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(promptId)) {
        newSelection.delete(promptId);
      } else {
        newSelection.add(promptId);
      }
      return newSelection;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allPromptIds = new Set(sortedPrompts.map((prompt) => prompt.id));
    setSelectedPromptIds(allPromptIds);
  }, [sortedPrompts]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPromptIds(new Set());
  }, []);

  const initiateDeleteSelected = useCallback(() => {
    if (selectedPromptIds.size === 0) {
      console.log("No prompts selected for deletion.");
      return;
    }
    setShowConfirmationModal(true);
  }, [selectedPromptIds]);

  const handleConfirmDelete = useCallback(async () => {
    setShowConfirmationModal(false);

    try {
      const idsToDelete = Array.from(selectedPromptIds);
      await api.delete(API_ROUTES.PROMPTS, { data: idsToDelete });

      console.log("Prompts deleted successfully!");
      setSelectedPromptIds(new Set());
      setIsManaging(false);
      mutate();
    } catch (error: any) {
      console.error("Error deleting prompts:", error);
      console.log(
        `Failed to delete prompts: ${error.message || "Unknown error"}`,
      );
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
    }
  }, [selectedPromptIds, mutate]);

  const handleCancelDelete = useCallback(() => {
    setShowConfirmationModal(false);
    console.log("Deletion cancelled by user.");
  }, []);

  if (!isOpen && !isAnimating) {
    return null;
  }

  const showContent = !isLoading && !error && sortedPrompts.length > 0;
  const MAX_PROMPT_TEXT_LENGTH = 80;
  const isDeleteButtonDisabled = selectedPromptIds.size === 0;

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
                Failed to load prompts:{" "}
                {error.message?.message || "Unknown error"}
              </p>
            )}

            {isLoading && <p>Loading prompts...</p>}

            {shouldDisplayNoPromptsMessage && <p>{noPromptsMessage}</p>}

            {showContent && (
              <div className="prompt-list">
                {sortedPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`prompt-item ${isManaging ? "prompt-item-managing" : ""}`}
                    onClick={
                      isManaging
                        ? () => handlePromptSelection(prompt.id)
                        : () => openDetailModal(prompt)
                    }
                  >
                    {isManaging && (
                      <div className="prompt-checkbox-container">
                        <div
                          className={`prompt-checkbox ${selectedPromptIds.has(prompt.id) ? "checked" : ""}`}
                        >
                          {selectedPromptIds.has(prompt.id) && (
                            <FiCheck className="checkbox-tick" />
                          )}
                        </div>
                      </div>
                    )}
                    <div className="prompt-item-content">
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
                            <FaStar
                              className={`action-icon favorite-icon favorited ${isManaging ? "clickable" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isManaging) handleToggleFavorite(prompt);
                              }}
                            />
                          ) : (
                            <FaRegStar
                              className={`action-icon favorite-icon ${isManaging ? "clickable" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isManaging) handleToggleFavorite(prompt);
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <p>
                        {prompt.text.length > MAX_PROMPT_TEXT_LENGTH
                          ? prompt.text.substring(0, MAX_PROMPT_TEXT_LENGTH) +
                            "..."
                          : prompt.text}
                      </p>
                      <div className="prompt-timestamp">
                        {formatTimeAgo(prompt.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div className="modal-footer-left-buttons">
              <button className="modal-manage-button" onClick={handleManage}>
                {isManaging ? "Done" : "Manage"}
              </button>

              <button
                className={`modal-action-button modal-select-all-button ${!isManaging ? "modal-action-button-hidden" : ""}`}
                onClick={handleSelectAll}
              >
                Select All
              </button>
              <button
                className={`modal-action-button modal-deselect-button ${!isManaging ? "modal-action-button-hidden" : ""}`}
                onClick={handleDeselectAll}
              >
                Deselect
              </button>
              <button
                className={`modal-action-button modal-delete-button ${!isManaging ? "modal-action-button-hidden" : ""}`}
                onClick={initiateDeleteSelected}
                disabled={isDeleteButtonDisabled}
              >
                Delete
              </button>
            </div>
            <button className="modal-close-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {(isDetailModalOpen || selectedPrompt) && (
        <PromptDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModalInitiate}
          onAnimationComplete={onDetailModalAnimationComplete}
          prompt={selectedPrompt}
          mutate={mutate}
          onUpdateSelectedPrompt={handleUpdateSelectedPromptData}
        />
      )}

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedPromptIds.size} selected prompt(s)? This action cannot be undone.`}
        confirmButtonType="delete"
      />
    </>
  );
};

export default PromptLibraryModal;

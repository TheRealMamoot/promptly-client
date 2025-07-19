import "@styles/PromptDetailModal.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { KeyedMutator } from "swr";
import { api, API_ROUTES } from "../config/api";
import type { Prompt } from "../utils/api";

// todo: smooth out success and warning messages
// todo: add devider between title and text
// todo: add escape to cancel edit mode without existing the modal

interface PromptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimationComplete: () => void;
  prompt: Prompt | null;
  mutate: KeyedMutator<Prompt[]>;
  onUpdateSelectedPrompt: (updatedPrompt: Prompt) => void;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  isOpen,
  onClose,
  onAnimationComplete,
  prompt,
  mutate,
  onUpdateSelectedPrompt,
}) => {
  const [animationClass, setAnimationClass] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedText, setEditedText] = useState("");
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState<
    string | number | undefined
  >(prompt?.id);

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChanges =
    prompt && (editedTitle !== prompt.title || editedText !== prompt.text);

  const handleCancelEdit = useCallback(() => {
    if (prompt) {
      setEditedTitle(prompt.title);
      setEditedText(prompt.text);
    }
    setIsEditing(false);
    setShowEmptyWarning(false);
    setShowSuccessMessage(false);
  }, [prompt]);

  useEffect(() => {
    if (isOpen) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }

      setIsAnimating(true);
      setAnimationClass("detail-modal-enter");
      setIsEditing(false);
    } else {
      setAnimationClass("detail-modal-exit");
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete();
        setEditedTitle("");
        setEditedText("");
        setIsEditing(false);
        setShowEmptyWarning(false);
        setShowSuccessMessage(false);
      }, 300);
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [isOpen, onAnimationComplete]);

  useEffect(() => {
    if (prompt) {
      setEditedTitle(prompt.title);
      setEditedText(prompt.text);
    } else {
      setEditedTitle("");
      setEditedText("");
    }
  }, [prompt]);

  useEffect(() => {
    if (prompt?.id !== currentPromptId) {
      setCurrentPromptId(prompt?.id);
      setIsEditing(false);
      setShowEmptyWarning(false);
      setShowSuccessMessage(false);
    }
  }, [prompt, currentPromptId]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        if (isEditing) {
          handleCancelEdit();
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
  }, [isOpen, onClose, isEditing, handleCancelEdit]);

  useEffect(() => {
    if (showEmptyWarning || showSuccessMessage) {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setShowEmptyWarning(false);
        setShowSuccessMessage(false);
      }, 3000);
    }
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [showEmptyWarning, showSuccessMessage]);

  const handleEdit = () => {
    setIsEditing(true);
    setShowEmptyWarning(false);
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    if (editedTitle.trim() === "" || editedText.trim() === "") {
      setShowEmptyWarning(true);
      setShowSuccessMessage(false);
      return;
    }

    if (!prompt || !hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await api.patch(`${API_ROUTES.PROMPTS}/${prompt.id}`, {
        title: editedTitle,
        text: editedText,
        favorite: prompt.favorite,
      });
      console.log("API PATCH response object:", response);

      if (response.data && response.data.payload) {
        onUpdateSelectedPrompt(response.data.payload);
      }

      mutate();

      setIsEditing(false);
      setShowEmptyWarning(false);
      setShowSuccessMessage(true);
    } catch (error: any) {
      console.error("Error updating prompt:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      setShowEmptyWarning(true);
      setShowSuccessMessage(false);
    }
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  if (!prompt) {
    return null;
  }

  return (
    <div className={`detail-modal-overlay ${animationClass}`}>
      <div className={`detail-modal-content ${animationClass}`}>
        <div className="detail-modal-header"></div>

        <div
          className={`detail-main-content-area ${isEditing ? "is-editing" : ""}`}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                className="detail-title-input"
                placeholder="Enter title..."
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                className="detail-body-textarea"
                placeholder="Write your prompt here..."
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            </>
          ) : (
            <>
              <h3 className="detail-prompt-title">{prompt.title}</h3>
              <p className="detail-prompt-text">{prompt.text}</p>
            </>
          )}
          <div
            className={`detail-empty-warning-message ${showEmptyWarning ? "show-warning" : ""}`}
          >
            Title and prompt cannot be empty.
          </div>
          <div
            className={`detail-success-message ${showSuccessMessage ? "show-success" : ""}`}
          >
            Prompt updated successfully!
          </div>
        </div>

        <div className="detail-modal-footer">
          <button
            className={`detail-modal-cancel-button ${isEditing ? "" : "detail-modal-cancel-button-hidden"}`}
            onClick={handleCancelEdit}
          >
            Cancel
          </button>
          {isEditing ? (
            <button
              className={`detail-edit-save-button ${hasChanges ? "active-save" : ""}`}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save
            </button>
          ) : (
            <button className="detail-edit-save-button" onClick={handleEdit}>
              Edit
            </button>
          )}
          <button className="detail-modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailModal;

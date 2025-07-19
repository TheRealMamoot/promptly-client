import "@styles/ConfirmationModal.css";
import React, { useEffect, useRef, useState } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonType: "save" | "delete";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonType,
}) => {
  const [animationClass, setAnimationClass] = useState("");
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isAnimatingRef.current = true;
      setAnimationClass("confirm-modal-enter");
    } else {
      setAnimationClass("confirm-modal-exit");
      const timer = setTimeout(() => {
        isAnimatingRef.current = false;
        if (!isOpen && animationClass === "confirm-modal-exit") {
          onClose();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, animationClass]);

  if (!isOpen && !isAnimatingRef.current) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`confirm-modal-overlay ${animationClass}`}
      onClick={handleOverlayClick}
    >
      <div className={`confirm-modal-content ${animationClass}`}>
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`confirm-modal-confirm-button ${confirmButtonType}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

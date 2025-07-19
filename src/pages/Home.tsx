import "@/styles/Home.css";
import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useSWR, { mutate as globalMutate } from "swr";
import LibraryIcon from "../assets/lib.svg";
import SaveIcon from "../assets/save.svg";
import ConfirmationModal from "../components/ConfirmationModal";
import LogoTitle from "../components/LogoTitle";
import PromptLibraryModal from "../components/PromptLibraryModal";
import { api, API_ROUTES } from "../config/api";
import type { Prompt } from "../utils/api";
import { fetcher } from "../utils/api";

export default function Home() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEmptyPromptWarning, setShowEmptyPromptWarning] = useState(false);
  const [showCopyTick, setShowCopyTick] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [showSaveConfirmationModal, setShowSaveConfirmationModal] =
    useState(false);

  const {
    data: prompts,
    error: promptsError,
    isLoading: promptsLoading,
    isValidating: promptsValidating,
    mutate: promptsMutate,
  } = useSWR<Prompt[]>(userInfo ? API_ROUTES.PROMPTS : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get(API_ROUTES.ME);
        setUserInfo(response.data.user);
        setLoadingUser(false);
      } catch (error: any) {
        console.error(
          "Authentication check failed, redirecting to login:",
          error
        );
        setUserInfo(null);
        setLoadingUser(false);
        navigate("/login");
      }
    };
    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    if (showEmptyPromptWarning) {
      const timer = setTimeout(() => {
        setShowEmptyPromptWarning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showEmptyPromptWarning]);

  useEffect(() => {
    if (showCopyTick) {
      const timer = setTimeout(() => {
        setShowCopyTick(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCopyTick]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showSaveConfirmationModal) {
          setShowSaveConfirmationModal(false);
        } else if (isLibraryModalOpen) {
        } else {
          setTitle("");
          setMessage("");
          setIsFavorited(false);
          setShowEmptyPromptWarning(false);
          setShowSuccessMessage(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLibraryModalOpen, showSaveConfirmationModal]);

  const handleSignOut = async () => {
    try {
      await api.post(API_ROUTES.LOGOUT);
      setUserInfo(null);
      globalMutate(API_ROUTES.PROMPTS, null, false);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout API call:", error);
      setUserInfo(null);
      globalMutate(API_ROUTES.PROMPTS, null, false);
      navigate("/login");
    }
  };

  const handleSave = () => {
    if (title.trim() === "" || message.trim() === "") {
      setShowEmptyPromptWarning(true);
      return;
    }
    setShowSaveConfirmationModal(true);
    setActiveTooltip(null);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = `Title: ${title}\nPrompt: ${message}`;
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setShowCopyTick(true);
      setActiveTooltip(null);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      console.log("Failed to copy text to clipboard.");
    }
  };

  const handleFavorite = () => {
    setIsFavorited((prev) => !prev);
  };

  const handleLibrary = () => {
    setIsLibraryModalOpen(true);
    setActiveTooltip(null);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirmationModal(false);

    try {
      const response = await api.post(API_ROUTES.PROMPTS, {
        title: title,
        text: message,
        favorite: isFavorited,
      });

      console.log("Prompt saved successfully:", response.data);

      setTitle("");
      setMessage("");
      setIsFavorited(false);

      promptsMutate();

      setTimeout(() => {
        setShowSuccessMessage(true);
      }, 100);
    } catch (error: any) {
      console.error("Error saving prompt:", error);
      console.log("Failed to save prompt. Please try again.");
    }
  };

  const handleCancelSave = () => {
    setShowSaveConfirmationModal(false);
    console.log("Save cancelled by user.");
  };

  if (loadingUser) {
    return (
      <div className="app-container">
        <div className="user-info">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const renderTooltip = (id: string, text: string) => (
    <div className={`custom-tooltip ${activeTooltip === id ? "visible" : ""}`}>
      {text}
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <LogoTitle />
        <div className="user-info">
          {userInfo.email} <button onClick={handleSignOut}>Sign out</button>
        </div>
      </header>
      <div className="message-input-container">
        <div className="message-header">
          <input
            type="text"
            className="message-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title..."
          />
          <div className="message-input-icons">
            <div
              className="icon-wrapper"
              onMouseEnter={() => setActiveTooltip("copy")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {showCopyTick ? (
                <FiCheck
                  className="message-icon copy-tick-icon"
                  onClick={handleCopy}
                />
              ) : (
                <FiCopy
                  className="message-icon message-icon-copy"
                  onClick={handleCopy}
                />
              )}
              {renderTooltip(
                "copy",
                showCopyTick ? "Copied!" : "Copy to clipboard"
              )}
            </div>

            <div
              className="icon-wrapper"
              onMouseEnter={() => setActiveTooltip("favorite")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {isFavorited ? (
                <FaStar
                  className="message-icon message-icon-fav favorited"
                  onClick={handleFavorite}
                />
              ) : (
                <FaRegStar
                  className="message-icon message-icon-fav"
                  onClick={handleFavorite}
                />
              )}
              {renderTooltip(
                "favorite",
                isFavorited ? "Remove from Favorites" : "Add to Favorites"
              )}
            </div>

            <div
              className="icon-wrapper"
              onMouseEnter={() => setActiveTooltip("save")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <img
                src={SaveIcon}
                alt="Save"
                className="message-icon"
                onClick={handleSave}
              />
              {renderTooltip("save", "Save to Library")}
            </div>

            <div
              className="icon-wrapper"
              onMouseEnter={() => setActiveTooltip("library")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <img
                src={LibraryIcon}
                alt="Library"
                className="message-icon message-icon-lib"
                onClick={handleLibrary}
              />
              {renderTooltip("library", "Open Library")}
            </div>
          </div>
        </div>
        <div className="message-divider"></div>
        <textarea
          className="message-body-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind? Write your prompt here..."
        />
      </div>

      <ConfirmationModal
        isOpen={showSaveConfirmationModal}
        onClose={handleCancelSave}
        onConfirm={handleConfirmSave}
        title="Confirm Save"
        message="Save this prompt and add it to your library?"
        confirmButtonType="save"
      />

      {showSuccessMessage && (
        <div className="success-message">Prompt saved!</div>
      )}

      {showEmptyPromptWarning && (
        <div className="empty-prompt-warning-message">
          Please enter the title and the prompt before saving.
        </div>
      )}

      <PromptLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        prompts={prompts}
        error={promptsError}
        isLoading={promptsLoading}
        isValidating={promptsValidating}
        mutate={promptsMutate}
      />
    </div>
  );
}

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Plus,
  Trash2,
  Send,
  Sun,
  Moon,
  Copy,
  Paperclip,
  RefreshCcw,
  Search,
  Book,
  Edit2,
  Download,
  Pin,
  Star,
  Tag,
  FileText,
  File,
  Heart,
  ThumbsUp,
  Quote,
} from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import EmojiPicker from "emoji-picker-react";
import html2pdf from "html2pdf.js";
import "./Chat.css";

const API_BASE = "https://bgbot-er2w.onrender.com";

function parseInlineFormatting(text = "") {
  let s = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^# (.*?)$/gm, '<h1 class="markdown-header">$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2 class="markdown-subheader">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="markdown-subheader">$1</h3>')
    .replace(/^- (.*?)$/gm, '<li class="markdown-list">$1</li>')
    .replace(/^\* (.*?)$/gm, '<li class="markdown-list">$1</li>')
    .replace(/^\d+\. (.*?)$/gm, '<li class="markdown-ordered-list">$1</li>')
    .replace(/^\> (.*?)$/gm, '<blockquote class="markdown-blockquote">$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link">$1</a>')
    // Table parsing
    .replace(/^\|(.+?)\|$/gm, (match, content) => {
      const rows = content.split("\n").map(row => row.trim()).filter(row => row);
      const headers = rows[0].split("|").map(h => h.trim()).filter(h => h);
      const alignments = rows[1]?.split("|").map(cell => {
        cell = cell.trim();
        if (cell.startsWith(":") && cell.endsWith(":")) return "center";
        if (cell.startsWith(":")) return "left";
        if (cell.endsWith(":")) return "right";
        return "";
      }).filter(a => a !== undefined) || [];
      const bodyRows = rows.slice(2).map(row => row.split("|").map(cell => cell.trim()).filter(cell => cell));
      
      let tableHTML = '<table class="markdown-table">';
      // Headers
      tableHTML += '<thead><tr>';
      headers.forEach((header, i) => {
        tableHTML += `<th${alignments[i] ? ` style="text-align: ${alignments[i]}"` : ''}>${header}</th>`;
      });
      tableHTML += '</tr></thead>';
      // Body
      tableHTML += '<tbody>';
      bodyRows.forEach(row => {
        tableHTML += '<tr>';
        row.forEach((cell, i) => {
          tableHTML += `<td${alignments[i] ? ` style="text-align: ${alignments[i]}"` : ''}>${cell}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table>';
      return tableHTML;
    })
    // Wrap lists in ul/ol tags
    .replace(/(<li class="markdown-list">.*?(?:<\/li>\n?)+)/gs, '<ul class="markdown-ul">$1</ul>')
    .replace(/(<li class="markdown-ordered-list">.*?(?:<\/li>\n?)+)/gs, '<ol class="markdown-ol">$1</ol>');

  // Ensure blockquotes are grouped
  s = s.replace(/(<blockquote class="markdown-blockquote">.*?(?:<\/blockquote>\n?)+)/gs, '<div class="markdown-blockquote-group">$1</div>');

  return `<div class="markdown-content">${s}</div>`;
}

function renderMessageContent(raw = "", isCodeEditable = false, onCodeEdit) {
  if (!raw && raw !== "") return null;
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let i = 0;

  // Split content by code blocks
  while ((match = codeBlockRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textPart = raw.slice(lastIndex, match.index);
      parts.push(
        <div
          className="message-text markdown-section"
          key={`txt-${i++}`}
          dangerouslySetInnerHTML={{ __html: parseInlineFormatting(textPart) }}
        />
      );
    }
    const lang = match[1] || "text";
    const code = match[2];
    parts.push(
      <div className="code-block" key={`cb-${i++}`}>
        {isCodeEditable ? (
          <textarea
            className="code-editor"
            defaultValue={code}
            onChange={(e) => onCodeEdit && onCodeEdit(e.target.value)}
          />
        ) : (
          <SyntaxHighlighter
            language={lang}
            style={atomOneDark}
            customStyle={{
              background: "transparent",
              padding: "0.75rem",
              borderRadius: "0.6rem",
              margin: 0,
              fontSize: "0.95rem",
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
        <button
          className="code-copy-btn"
          onClick={() => navigator.clipboard.writeText(code)}
          title="Copy code"
          aria-label="Copy code"
        >
          <Copy size={14} />
        </button>
      </div>
    );
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < raw.length) {
    const tail = raw.slice(lastIndex);
    parts.push(
      <div
        className="message-text markdown-section"
        key={`txt-end-${i++}`}
        dangerouslySetInnerHTML={{ __html: parseInlineFormatting(tail) }}
      />
    );
  }
  return parts;
}

function TypingDots() {
  return (
    <div className="typing-indicator" aria-hidden="true">
      <span className="typing-bar" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="skeleton-message">
      <div className="skeleton-avatar" />
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

function getMessageType(reply) {
  try {
    const json = JSON.parse(reply);
    if (json.type === "ats") return "ATS Report";
    if (json.type === "ppt" || json.type === "pdf") return "Document";
    if (json.code) return "Code";
  } catch {
    return reply.includes("```") ? "Code" : "Answer";
  }
}

export default function ChatUI() {
  const [sessions, setSessions] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(16);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState({});
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [tags, setTags] = useState({});
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatAreaWidth, setChatAreaWidth] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [messageStatus, setMessageStatus] = useState({});

  const chatBodyRef = useRef(null);
  const textareaRef = useRef(null);
  const searchInputRef = useRef(null);
  const chatMainRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.classList.toggle("theme-light", theme === "light");
    document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
  }, [theme, fontSize]);

  useEffect(() => {
    fetchChats();
    const savedState = localStorage.getItem("chatState");
    if (savedState) {
      const { sessions, chatId, messages } = JSON.parse(savedState);
      setSessions(sessions);
      setChatId(chatId);
      setMessages(messages);
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(160, ta.scrollHeight)}px`;
  }, [input]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey && !showEmojiPicker) {
        handleSend(e);
      } else if (e.key === "Escape") {
        setEditingMessageId(null);
        setShowEmojiPicker(false);
      } else if (e.key === "ArrowUp" && sidebarOpen) {
        const currentIdx = sessions.findIndex((s) => s._id === chatId);
        if (currentIdx > 0) selectChat(sessions[currentIdx - 1]._id);
      } else if (e.key === "ArrowDown" && sidebarOpen) {
        const currentIdx = sessions.findIndex((s) => s._id === chatId);
        if (currentIdx < sessions.length - 1) selectChat(sessions[currentIdx + 1]._id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sessions, chatId, showEmojiPicker]);

  useEffect(() => {
    localStorage.setItem("chatState", JSON.stringify({ sessions, chatId, messages }));
  }, [sessions, chatId, messages]);

  const fetchChats = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/chats`);
      if (!res.ok) throw new Error(`Failed to fetch chats: ${res.statusText}`);
      const data = await res.json();
      const updatedSessions = (data.sessions || []).reverse().map((s) => ({
        ...s,
        lastMessage: s.messages?.[s.messages.length - 1]?.message || "",
      }));
      setSessions(updatedSessions);
    } catch (e) {
      setError("Failed to load chats. Please try again.");
      console.error("fetchChats error", e);
    }
  };

  const selectChat = async (_id) => {
    try {
      setError(null);
      setSidebarOpen(false);
      setChatId(_id);
      const res = await fetch(`${API_BASE}/chats/${_id}`);
      if (!res.ok) throw new Error(`Failed to fetch chat: ${res.statusText}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      setError("Failed to load chat. Please try again.");
      console.error("selectChat error", e);
    }
  };

  const handleNewChat = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "New chat", reply: "Started a new chat" }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to create new chat: ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      setChatId(data.chat_id);
      setMessages([]);
      await fetchChats();
      setSidebarOpen(false);
    } catch (e) {
      setError(e.message || "Failed to create new chat. Please try again.");
      console.error("newChat error", e);
    }
  };

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() && !selectedFiles.length) return;

    if (input.startsWith("/")) {
      handleSlashCommand(input);
      return;
    }

    setLoading(true);
    setError(null);
    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage = {
      id: cryptoRandomId(),
      message: input,
      reply: "",
      files: selectedFiles,
      time: userTime,
      role: "user",
      status: "sent",
      replyTo: replyTo?.id || null,
      date: new Date().toDateString(),
    };
    setMessages((cur) => [...cur, newMessage]);
    setMessageStatus((prev) => ({ ...prev, [newMessage.id]: "sent" }));

    try {
      let res;
      if (selectedFiles.length) {
        const formData = new FormData();
        formData.append("message", input);
        if (chatId) formData.append("chat_id", chatId);
        selectedFiles.forEach((file) => formData.append("files", file));
        res = await fetch(`${API_BASE}/chat`, { method: "POST", body: formData });
      } else {
        const body = { message: input, chat_id: chatId };
        if (replyTo) body.replyTo = replyTo.id;
        res = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.reply || `Failed to send message: ${res.statusText}`);
      }
      const data = await res.json();
      let replyText = data.reply || "⚠️ No reply.";
      const downloadUrl = data.download_url || null;

      try {
        const jsonReply = JSON.parse(replyText);
        if (jsonReply.type === "ats") {
          replyText = `ATS Score: ${jsonReply.score}/100\nFeedback: ${jsonReply.feedback}`;
        } else if (jsonReply.type === "ppt" || jsonReply.type === "pdf") {
          replyText = data.reply;
        }
      } catch (e) {}

      setMessageStatus((prev) => ({ ...prev, [newMessage.id]: "delivered" }));
      const assistantId = cryptoRandomId();
      setMessages((cur) => [
        ...cur,
        {
          id: assistantId,
          message: null,
          reply: "",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: "assistant",
          download_url: downloadUrl,
          date: new Date().toDateString(),
          type: getMessageType(replyText),
        },
      ]);

      let built = "";
      for (let i = 0; i < replyText.length; i++) {
        built += replyText[i];
        setMessages((cur) => {
          const copy = cur.slice();
          const idx = copy.findIndex((m) => m.id === assistantId);
          if (idx !== -1) copy[idx] = { ...copy[idx], reply: built };
          return copy;
        });
        await wait(5);
      }

      setMessageStatus((prev) => ({ ...prev, [newMessage.id]: "read" }));
      setChatId(data.chat_id || chatId);
      setInput("");
      setSelectedFiles([]);
      setReplyTo(null);
      addToast("Message sent successfully!");
      await fetchChats();
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
      console.error("chat error", err);
      setMessages((cur) => [
        ...cur,
        {
          id: cryptoRandomId(),
          message: null,
          reply: "⚠️ Error contacting server.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: "assistant",
          date: new Date().toDateString(),
        },
      ]);
      addToast("Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (index) => {
    if (!messages[index] || loading) return;
    const msg = messages[index];
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg.message, chat_id: chatId }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.reply || `Failed to regenerate response: ${res.statusText}`);
      }
      const data = await res.json();
      let reply = data.reply || "⚠️ No reply.";
      const downloadUrl = data.download_url || null;

      try {
        const jsonReply = JSON.parse(reply);
        if (jsonReply.type === "ats") {
          reply = `ATS Score: ${jsonReply.score}/100\nFeedback: ${jsonReply.feedback}`;
        } else if (jsonReply.type === "ppt" || jsonReply.type === "pdf") {
          reply = data.reply;
        }
      } catch (e) {}

      const assistantIdx = messages.findIndex((m, i) => i > index && m.role === "assistant");
      if (assistantIdx !== -1) {
        let built = "";
        for (let i = 0; i < reply.length; i++) {
          built += reply[i];
          setMessages((cur) => {
            const copy = cur.slice();
            copy[assistantIdx] = {
              ...copy[assistantIdx],
              reply: built,
              download_url: downloadUrl,
              type: getMessageType(built),
            };
            return copy;
          });
          await wait(5);
        }
      } else {
        setMessages((cur) => [
          ...cur,
          {
            id: cryptoRandomId(),
            message: null,
            reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            role: "assistant",
            download_url: downloadUrl,
            date: new Date().toDateString(),
            type: getMessageType(reply),
          },
        ]);
      }
      addToast("Response regenerated successfully!");
    } catch (e) {
      setError(e.message || "Failed to regenerate response. Please try again.");
      console.error("regenerate error", e);
      addToast("Failed to regenerate response.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (index) => {
    if (!messages[index] || loading) return;
    const msg = messages[index];
    setEditingMessageId(msg.id);
    setEditingMessageText(msg.message || "");
  };

  const handleSaveMessageEdit = async (index) => {
    if (!messages[index] || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editingMessageText, chat_id: chatId }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.reply || `Failed to update message: ${res.statusText}`);
      }
      const data = await res.json();
      let replyText = data.reply || "⚠️ No reply.";
      const downloadUrl = data.download_url || null;

      try {
        const jsonReply = JSON.parse(replyText);
        if (jsonReply.type === "ats") {
          replyText = `ATS Score: ${jsonReply.score}/100\nFeedback: ${jsonReply.feedback}`;
        } else if (jsonReply.type === "ppt" || jsonReply.type === "pdf") {
          replyText = data.reply;
        }
      } catch (e) {}

      setMessages((cur) => {
        const copy = cur.slice();
        copy[index] = { ...copy[index], message: editingMessageText };
        const assistantIdx = cur.findIndex((m, i) => i > index && m.role === "assistant");
        if (assistantIdx !== -1) {
          copy[assistantIdx] = {
            ...copy[assistantIdx],
            reply: replyText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            download_url: downloadUrl,
            type: getMessageType(replyText),
          };
        } else {
          copy.push({
            id: cryptoRandomId(),
            message: null,
            reply: replyText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            role: "assistant",
            download_url: downloadUrl,
            date: new Date().toDateString(),
            type: getMessageType(replyText),
          });
        }
        return copy;
      });
      setEditingMessageId(null);
      setEditingMessageText("");
      addToast("Message updated successfully!");
      await fetchChats();
    } catch (e) {
      setError(e.message || "Failed to update message. Please try again.");
      console.error("edit message error", e);
      addToast("Failed to update message.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (_id) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/chats/${_id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete session: ${res.statusText}`);
      }
      if (chatId === _id) {
        setChatId(null);
        setMessages([]);
      }
      await fetchChats();
      addToast("Chat session deleted successfully!");
    } catch (e) {
      setError(e.message || "Failed to delete session. Please try again.");
      console.error("delete session error", e);
      addToast("Failed to delete session.", "error");
    }
  };

  const handleDeleteAll = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/chats`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to clear all chats: ${res.statusText}`);
      }
      setChatId(null);
      setMessages([]);
      await fetchChats();
      addToast("All chats cleared successfully!");
    } catch (e) {
      setError(e.message || "Failed to clear all chats. Please try again.");
      console.error("delete all error", e);
      addToast("Failed to clear all chats.", "error");
    }
  };

  const handleRenameSession = async (_id, newTitle) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/chats/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to rename session: ${res.statusText}`);
      }
      await fetchChats();
      setEditingSessionId(null);
      setEditingSessionTitle("");
      addToast("Session renamed successfully!");
    } catch (e) {
      setError(e.message || "Failed to rename session. Please try again.");
      console.error("rename session error", e);
      addToast("Failed to rename session.", "error");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    addToast(`${files.length} file(s) selected.`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    addToast(`${files.length} file(s) dropped.`);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleReaction = (messageId, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji],
    }));
  };

  const handlePinMessage = (messageId) => {
    setPinnedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };

  const handleReplyTo = (message) => {
    setReplyTo(message);
    textareaRef.current.focus();
  };

  const handleFavoriteSession = (_id) => {
    setFavorites((prev) =>
      prev.includes(_id) ? prev.filter((id) => id !== _id) : [...prev, _id]
    );
  };

  const handleAddTag = (_id, tag) => {
    setTags((prev) => ({
      ...prev,
      [_id]: [...(prev[_id] || []), tag],
    }));
  };

  const handleRemoveTag = (_id, tag) => {
    setTags((prev) => ({
      ...prev,
      [_id]: prev[_id].filter((t) => t !== tag),
    }));
  };

  const handleExportSession = async (_id) => {
    try {
      const session = sessions.find((s) => s._id === _id);
      const res = await fetch(`${API_BASE}/chats/${_id}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      const messages = data.messages || [];

      // Export as JSON
      const jsonContent = JSON.stringify(messages, null, 2);
      const jsonBlob = new Blob([jsonContent], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `${session.title || "Untitled"}.json`;
      jsonLink.click();
      URL.revokeObjectURL(jsonUrl);

      // Export as PDF
      const element = document.createElement("div");
      element.innerHTML = messages
        .map((m) => `<p><strong>${m.role}:</strong> ${m.message || m.reply}</p>`)
        .join("");
      await html2pdf().from(element).save(`${session.title || "Untitled"}.pdf`);
      addToast("Session exported successfully!");
    } catch (e) {
      addToast("Failed to export session.", "error");
    }
  };

  const handleDownloadResponse = (message, format) => {
    const content = message.reply || message.message;
    let blob, filename;
    if (format === "txt") {
      blob = new Blob([content], { type: "text/plain" });
      filename = `response.txt`;
    } else if (format === "pdf") {
      const element = document.createElement("div");
      element.innerHTML = `<p>${content}</p>`;
      html2pdf().from(element).save(`response.pdf`);
      addToast("Response downloaded as PDF!");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Response downloaded as ${format.toUpperCase()}!`);
  };

  const handleSlashCommand = async (command) => {
    const [cmd, ...args] = command.slice(1).split(" ");
    switch (cmd.toLowerCase()) {
      case "reset":
        await handleDeleteAll();
        break;
      case "download":
        if (messages.length) handleDownloadResponse(messages[messages.length - 1], "txt");
        break;
      case "summary":
        setInput("Please summarize the conversation.");
        await handleSend();
        break;
      default:
        addToast("Unknown command.", "error");
    }
    setInput("");
  };

  const handleAutocomplete = (value) => {
    if (value.startsWith("/")) {
      const commands = ["/reset", "/download", "/summary"];
      setAutocompleteSuggestions(
        commands.filter((cmd) => cmd.startsWith(value.toLowerCase()))
      );
      setShowSuggestions(true);
    } else {
      const suggestions = messages
        .filter((m) => m.message && m.message.toLowerCase().includes(value.toLowerCase()))
        .map((m) => m.message)
        .slice(0, 5);
      setAutocompleteSuggestions(suggestions);
      setShowSuggestions(value.length > 1);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    textareaRef.current.focus();
  };

  const addToast = (message, type = "success") => {
    const id = cryptoRandomId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatMainRef.current.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setChatAreaWidth(newWidth);
      chatMainRef.current.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text || "");
    addToast("Text copied to clipboard!");
  };

  const filteredSessions = searchQuery
    ? sessions.filter((s) =>
        (s.title || "Untitled").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  const groupedMessages = messages.reduce((acc, msg, idx) => {
    if (!acc[msg.date]) acc[msg.date] = [];
    acc[msg.date].push({ ...msg, index: idx });
    return acc;
  }, {});

  const renderFilePreview = (file) => {
    const type = file.type.split("/")[0];
    if (type === "image") {
      return <img src={URL.createObjectURL(file)} alt={file.name} className="file-preview-image" />;
    } else if (file.type === "application/pdf") {
      return <FileText size={24} />;
    } else {
      return <File size={24} />;
    }
  };

  const getAvatar = (role, userName = "User") => {
    if (role === "user") {
      return (
        <div className="avatar user-avatar" style={{ backgroundColor: "#3b82f6" }}>
          {userName[0].toUpperCase()}
        </div>
      );
    }
    return (
      <div className="avatar bot-avatar">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          🤖
        </motion.div>
      </div>
    );
  };

  return (
    <div
      className={`chat-root ${theme === "dark" ? "theme-dark" : "theme-light"}`}
      style={{ fontSize: `${fontSize}px` }}
      role="application"
      aria-label="Chat Interface"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Toasts */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`toast ${toast.type}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {toast.message}
              <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top bar */}
      <header className="chat-topbar">
        <div className="left">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu size={20} />
          </button>
          <div className="brand">ChatBot</div>
        </div>
        <div className="right">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            aria-label="Select theme"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-label="Select font size"
          >
            <option value={14}>Small</option>
            <option value={16}>Medium</option>
            <option value={18}>Large</option>
          </select>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* FAB */}
      <div className="fab-container">
        <button className="fab" onClick={handleNewChat} aria-label="New chat">
          <Plus size={20} />
        </button>
        <button className="fab" onClick={() => document.querySelector(".file-input").click()} aria-label="Upload file">
          <Paperclip size={20} />
        </button>
      </div>

      {/* Layout */}
      <div className="chat-layout">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className={`chat-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
              initial={{ width: sidebarCollapsed ? 60 : 280 }}
              animate={{ width: sidebarCollapsed ? 60 : 280 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              role="navigation"
              aria-label="Chat sessions"
            >
              <div className="sidebar-header">
                <div className="logo" title="ChatBot">⚪</div>
                <button
                  className="icon-btn"
                  onClick={() => setSidebarCollapsed((s) => !s)}
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
                </button>
              </div>

              <div className="sidebar-actions">
                <button
                  className="sidebar-action"
                  onClick={handleNewChat}
                  aria-label="Start new chat"
                  title="New Chat"
                >
                  <Plus size={16} />
                  {!sidebarCollapsed && "New Chat"}
                </button>
                <button
                  className="sidebar-action"
                  onClick={() => setSearchOpen((s) => !s)}
                  aria-label={searchOpen ? "Close search" : "Open search"}
                  title="Search Chats"
                >
                  <Search size={16} />
                  {!sidebarCollapsed && "Search Chats"}
                </button>
                <button className="sidebar-action" aria-label="Open library" title="Library">
                  <Book size={16} />
                  {!sidebarCollapsed && "Library"}
                </button>
                <button className="sidebar-action" aria-label="Open Sora" title="Sora">
                  <span style={{ fontSize: "14px", marginRight: "6px" }}>▶</span>
                  {!sidebarCollapsed && "Sora"}
                </button>
                <button className="sidebar-action" aria-label="Open GPTs" title="GPTs">
                  <span style={{ fontSize: "14px", marginRight: "6px" }}>◎</span>
                  {!sidebarCollapsed && "GPTs"}
                </button>
              </div>

              {searchOpen && !sidebarCollapsed && (
                <div className="sidebar-search">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search chat sessions"
                  />
                </div>
              )}

              {!sidebarCollapsed && (
                <h3 className="sidebar-section-title">Chats</h3>
              )}
              <div className="sidebar-list" role="list">
                {filteredSessions.length === 0 && !sidebarCollapsed && (
                  <div className="no-sessions" role="status">
                    No chats found
                  </div>
                )}
                {filteredSessions
                  .sort((a, b) => (favorites.includes(b._id) ? 1 : -1))
                  .map((s) => (
                    <div
                      key={s._id}
                      className={`session-item ${s._id === chatId ? "active" : ""}`}
                      onClick={() => selectChat(s._id)}
                      role="listitem"
                      tabIndex={0}
                      title={sidebarCollapsed ? s.title || "Untitled" : ""}
                    >
                      {editingSessionId === s._id ? (
                        <input
                          className="session-edit"
                          value={editingSessionTitle}
                          onChange={(e) => setEditingSessionTitle(e.target.value)}
                          onBlur={() => handleRenameSession(s._id, editingSessionTitle)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameSession(s._id, editingSessionTitle);
                            }
                          }}
                          autoFocus
                          aria-label={`Edit title for chat ${s.title || "Untitled"}`}
                        />
                      ) : (
                        <div className="session-title">
                          {sidebarCollapsed ? (
                            <Star size={16} fill={favorites.includes(s._id) ? "#FFD700" : "none"} />
                          ) : (
                            <>
                              <Star
                                size={16}
                                fill={favorites.includes(s._id) ? "#FFD700" : "none"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteSession(s._id);
                                }}
                              />
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: searchQuery
                                    ? (s.title || "Untitled").replace(
                                        new RegExp(searchQuery, "gi"),
                                        (match) => `<mark>${match}</mark>`
                                      )
                                    : s.title || "Untitled",
                                }}
                              />
                              <div className="session-preview">
                                {s.lastMessage.slice(0, 50) + (s.lastMessage.length > 50 ? "..." : "")}
                              </div>
                              <div className="session-tags">
                                {(tags[s._id] || []).map((tag) => (
                                  <span key={tag} className="tag">
                                    {tag}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTag(s._id, tag);
                                      }}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                                <input
                                  type="text"
                                  placeholder="Add tag..."
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value) {
                                      handleAddTag(s._id, e.target.value);
                                      e.target.value = "";
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="tag-input"
                                />
                              </div>
                              <button
                                className="icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportSession(s._id);
                                }}
                                aria-label="Export session"
                              >
                                <Download size={14} />
                              </button>
                            </>
                          )}
                          <button
                            className="icon-btn session-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(s._id);
                              setEditingSessionTitle(s.title || "Untitled");
                            }}
                            aria-label={`Edit title for chat ${s.title || "Untitled"}`}
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                      <button
                        className="icon-btn session-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(s._id);
                        }}
                        aria-label={`Delete chat ${s.title || "Untitled"}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>

              {!sidebarCollapsed && (
                <div className="sidebar-footer">
                  <button
                    className="sidebar-action"
                    onClick={handleDeleteAll}
                    aria-label="Clear all chats"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="resize-handle" onMouseDown={handleResizeStart} ref={dragRef} />

        <main
          className="chat-main"
          ref={chatMainRef}
          style={chatAreaWidth ? { width: `${chatAreaWidth}px` } : {}}
          role="main"
        >
          {error && (
            <div className="error-message" role="alert" style={{ backgroundColor: "var(--bg-error)" }}>
              {error}
              <button
                className="icon-btn"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div ref={chatBodyRef} className="chat-body" role="log" aria-live="polite">
            {pinnedMessages.length > 0 && (
              <div className="pinned-messages">
                <h4>Pinned Messages</h4>
                {pinnedMessages.map((id) => {
                  const msg = messages.find((m) => m.id === id);
                  if (!msg) return null;
                  return (
                    <div key={id} className="pinned-message">
                      {renderMessageContent(msg.message || msg.reply)}
                      <button
                        onClick={() => handlePinMessage(id)}
                        aria-label="Unpin message"
                      >
                        <Pin size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>✨ Start a Conversation</h3>
                <p>Type a message or upload a file to begin.</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="message-group">
                  
                  {msgs.map((m) => (
                    <motion.div
                      key={m.id}
                      className={`message-row ${m.role === "user" ? "user" : "assistant"} ${
                        pinnedMessages.includes(m.id) ? "pinned" : ""
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getAvatar(m.role)}
                      <div
                        className={`message ${
                          m.role === "user" ? "message-user" : "message-bot"
                        } message-bubble`}
                        style={{
                          background: m.role === "user" ? "var(--bg-user)" : "var(--bg-bot)",
                        }}
                      >
                        {m.replyTo && (
                          <div className="quoted-message">
                            <Quote size={14} />
                            {renderMessageContent(
                              messages.find((msg) => msg.id === m.replyTo)?.message ||
                              messages.find((msg) => msg.id === m.replyTo)?.reply
                            )}
                          </div>
                        )}
                        {m.role === "user" && editingMessageId === m.id ? (
                          <div className="message-content">
                            <textarea
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              className="message-edit-textarea"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  handleSaveMessageEdit(m.index);
                                }
                              }}
                              aria-label="Edit message"
                            />
                            <div className="message-edit-actions">
                              <button
                                className="meta-btn"
                                onClick={() => handleSaveMessageEdit(m.index)}
                                disabled={loading}
                                aria-label="Save edited message"
                              >
                                Save
                              </button>
                              <button
                                className="meta-btn"
                                onClick={() => setEditingMessageId(null)}
                                aria-label="Cancel edit"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="message-content">
                            {m.role === "user" && renderMessageContent(m.message)}
                            {m.role === "assistant" && (
                              <>
                                {m.reply === "" && loading ? (
                                  <TypingDots />
                                ) : (
                                  <>
                                    {m.type && <span className="message-type">{m.type}</span>}
                                    {renderMessageContent(m.reply, true, (newCode) => {
                                      setMessages((cur) => {
                                        const copy = cur.slice();
                                        copy[m.index] = { ...copy[m.index], reply: newCode };
                                        return copy;
                                      });
                                    })}
                                    <div className="suggested-prompts">
                                      <button
                                        onClick={() =>
                                          setInput(`Explain more about: ${m.reply.slice(0, 20)}...`)
                                        }
                                      >
                                        Explain More
                                      </button>
                                      <button
                                        onClick={() =>
                                          setInput(`Simplify this: ${m.reply.slice(0, 20)}...`)
                                        }
                                      >
                                        Simplify
                                      </button>
                                      <button
                                        onClick={() =>
                                          setInput(`Generate code snippet for: ${m.reply.slice(0, 20)}...`)
                                        }
                                      >
                                        Generate Code
                                      </button>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {m.files && m.files.length > 0 && (
                          <div className="attached-files">
                            {m.files.map((file, idx) => (
                              <div key={idx} className="file-preview" aria-label={`Attached file: ${file.name}`}>
                                {renderFilePreview(file)}
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {m.download_url && (
                          <div className="attached-file">
                            <a href={`${API_BASE}${m.download_url}`} download>
                              <Download size={18} /> Download File
                            </a>
                          </div>
                        )}
                        <div className="message-meta">
                          <div className="meta-left">
                            <button
                              className="meta-btn"
                              onClick={() => copyText(m.role === "user" ? m.message : m.reply)}
                              title="Copy text"
                              aria-label="Copy message"
                            >
                              <Copy size={14} />
                            </button>
                            {m.role === "user" && (
                              <button
                                className="meta-btn"
                                onClick={() => handleEditMessage(m.index)}
                                disabled={loading}
                                title="Edit message"
                                aria-label="Edit message"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                            {m.role === "assistant" && (
                              <>
                                <button
                                  className="meta-btn"
                                  onClick={() => handleRegenerate(m.index)}
                                  disabled={loading}
                                  title="Regenerate response"
                                  aria-label="Regenerate response"
                                >
                                  <RefreshCcw size={14} />
                                </button>
                                <button
                                  className="meta-btn"
                                  onClick={() => handleDownloadResponse(m, "txt")}
                                  title="Download as TXT"
                                  aria-label="Download as TXT"
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  className="meta-btn"
                                  onClick={() => handleDownloadResponse(m, "pdf")}
                                  title="Download as PDF"
                                  aria-label="Download as PDF"
                                >
                                  <FileText size={14} />
                                </button>
                              </>
                            )}
                            <button
                              className="meta-btn"
                              onClick={() => handlePinMessage(m.id)}
                              title={pinnedMessages.includes(m.id) ? "Unpin message" : "Pin message"}
                              aria-label={pinnedMessages.includes(m.id) ? "Unpin message" : "Pin message"}
                            >
                              <Pin size={14} fill={pinnedMessages.includes(m.id) ? "#FFD700" : "none"} />
                            </button>
                            <button
                              className="meta-btn"
                              onClick={() => handleReplyTo(m)}
                              title="Reply to message"
                              aria-label="Reply to message"
                            >
                              <Quote size={14} />
                            </button>
                            <button
                              className="meta-btn"
                              onClick={() => handleReaction(m.id, "👍")}
                              title="React with thumbs up"
                              aria-label="React with thumbs up"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              className="meta-btn"
                              onClick={() => handleReaction(m.id, "❤️")}
                              title="React with heart"
                              aria-label="React with heart"
                            >
                              <Heart size={14} />
                            </button>
                          </div>
                          <div className="meta-right">
                            {m.time}
                            {m.role === "user" && (
                              <span className="status-indicator">
                                {messageStatus[m.id] === "sent" && "✓"}
                                {messageStatus[m.id] === "delivered" && "✓✓"}
                                {messageStatus[m.id] === "read" && <span style={{ color: "#3b82f6" }}>✓✓</span>}
                              </span>
                            )}
                          </div>
                        </div>
                        {reactions[m.id] && (
                          <div className="reactions">
                            {reactions[m.id].map((r, idx) => (
                              <span key={idx} className="reaction">{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))
            )}
            {loading && messages.length > 0 && <LoadingSkeleton />}
          </div>

          <form
            className="chat-input-area"
            id="grok-form"
            onSubmit={handleSend}
            role="form"
            aria-label="Message input form"
          >
            <button
              className="emoji-btn"
              type="button"
              onClick={() => setShowEmojiPicker((s) => !s)}
              aria-label="Open emoji picker"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <label className="file-label" title="Attach files">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="file-input"
                disabled={loading}
                aria-label="Upload files"
              />
              <Paperclip size={18} />
            </label>
            <div className="textarea-container">
              {replyTo && (
                <div className="reply-preview">
                  Replying to: {replyTo.message || replyTo.reply?.slice(0, 20)}...
                  <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                    <X size={12} />
                  </button>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleAutocomplete(e.target.value);
                }}
                disabled={loading}
                rows={1}
                aria-label="Message input"
              />
              {showSuggestions && autocompleteSuggestions.length > 0 && (
                <div className="autocomplete-suggestions">
                  {autocompleteSuggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className="suggestion"
                      onClick={() => handleSuggestionSelect(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedFiles.length > 0 && (
              <div className="file-chips">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="file-chip" aria-label={`Attached file: ${file.name}`}>
                    {file.name.length > 20 ? file.name.slice(0, 17) + "..." : file.name}
                    <button
                      className="file-chip-close"
                      onClick={() =>
                        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      type="button"
                      aria-label="Remove attached file"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              className="btn-send"
              type="submit"
              disabled={loading || (!input.trim() && !selectedFiles.length)}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cryptoRandomId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2);
}
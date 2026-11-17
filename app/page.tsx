"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Mode = "all" | "personal" | "business" | "coding" | "research" | "automation";
type Message = { role: "user" | "assistant"; content: string };

const modes: { id: Mode; label: string; icon: string; description: string }[] = [
  { id: "all", label: "Auto", icon: "✳", description: "Choose the best agent automatically" },
  { id: "personal", label: "Personal", icon: "◈", description: "Planning, notes and everyday help" },
  { id: "business", label: "Business", icon: "▦", description: "Sales, customers and operations" },
  { id: "coding", label: "Coding", icon: "⌘", description: "Build, explain and debug software" },
  { id: "research", label: "Research", icon: "⌕", description: "Analyze topics and organize findings" },
  { id: "automation", label: "Automation", icon: "⟳", description: "Design repeatable workflows" }
];

const starters = [
  "Plan my day and prioritize my tasks",
  "Create a simple lead follow-up system for my business",
  "Help me build a responsive website",
  "Design an automation workflow for customer support"
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed. Please try again.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Alice AI home">
          <span className="brand-mark">A</span>
          <span>ALICE<span className="brand-muted">.AI</span></span>
        </Link>
        <button className="new-chat" onClick={() => { setMessages([]); setError(""); }}>
          <span>＋</span> New conversation
        </button>
        <div className="side-label">WORKSPACE</div>
        <div className="side-item active"><span>◫</span> AI Assistant <span className="live-dot" /></div>
        <div className="side-item muted"><span>▦</span> Business hub <small>Next</small></div>
        <div className="side-item muted"><span>⌘</span> Coding studio <small>Next</small></div>
        <div className="side-item muted"><span>⟳</span> Automations <small>Next</small></div>
        <div className="sidebar-bottom">
          <div className="status-line"><span className="status-dot" /> Core interface ready</div>
          <div className="version">ALICE AI · FOUNDATION 0.1</div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>AI Assistant</strong></div>
          <div className="top-right"><span className="free-pill">FREE BUILD</span><span className="avatar">A</span></div>
        </header>

        <div className="content">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="eyebrow"><span className="spark">✳</span> YOUR AGENTIC WORKSPACE</div>
              <h1>Make it happen.<br /><span>One command at a time.</span></h1>
              <p className="intro">Your starting point for personal productivity, business operations and software creation.</p>
              <div className="mode-heading">CHOOSE A WORK MODE</div>
              <div className="mode-grid">
                {modes.map((item) => (
                  <button key={item.id} className={mode === item.id ? "mode-card selected" : "mode-card"} onClick={() => setMode(item.id)}>
                    <span className="mode-icon">{item.icon}</span>
                    <span className="mode-name">{item.label}</span>
                    <span className="mode-description">{item.description}</span>
                  </button>
                ))}
              </div>
              <div className="suggestion-heading">START WITH A TASK</div>
              <div className="suggestions">
                {starters.map((starter) => <button key={starter} onClick={() => void sendMessage(starter)}>{starter}<span>↗</span></button>)}
              </div>
            </div>
          ) : (
            <div className="conversation">
              <div className="conversation-title"><span className="spark">✳</span><div><strong>ALICE Assistant</strong><small>{modes.find((item) => item.id === mode)?.label} mode</small></div></div>
              {messages.map((message, index) => (
                <div className={message.role === "user" ? "message user-message" : "message assistant-message"} key={index}>
                  {message.role === "assistant" && <span className="message-mark">A</span>}
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
              {loading && <div className="thinking"><span className="loader" /> Alice is thinking…</div>}
              <div id="conversation-end" />
            </div>
          )}
          {error && <div className="error-banner">{error}</div>}
          <div className="composer-wrap">
            <form className="composer" onSubmit={onSubmit}>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Give Alice a task or ask a question…" rows={2} />
              <div className="composer-bottom">
                <span><span className="composer-spark">✳</span> {modes.find((item) => item.id === mode)?.label} mode</span>
                <button type="submit" disabled={!input.trim() || loading} aria-label="Send message">↑</button>
              </div>
            </form>
            <p className="disclaimer">AI can make mistakes. Review important information and approve real-world actions yourself.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

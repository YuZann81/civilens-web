"use client";

import React, { useState, useEffect } from "react";
import { getTopics } from "@/lib/api/client";
import { Topic } from "@/lib/api/types";
import { IconHashtag, IconClose } from "@/components/ui/icons";

interface TopicPickerProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
  disabled?: boolean;
}

export default function TopicPicker({
  selectedTopics,
  onChange,
  disabled = false,
}: TopicPickerProps) {
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getTopics({ limit: 30 })
      .then((data) => {
        if (mounted) setAvailableTopics(data);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const normalizeTopicTag = (tag: string): string => {
    return tag.replace(/^[#\s]+/, "").trim();
  };

  const handleAddTopic = (rawTag: string) => {
    setError("");
    const cleaned = normalizeTopicTag(rawTag);

    if (!cleaned) return;

    if (cleaned.length < 2) {
      setError("Topik minimal 2 karakter.");
      return;
    }

    if (cleaned.length > 40) {
      setError("Topik maksimal 40 karakter.");
      return;
    }

    // Check duplicate case-insensitively
    const isDuplicate = selectedTopics.some(
      (t) => t.toLowerCase() === cleaned.toLowerCase()
    );

    if (isDuplicate) {
      setError(`Topik #${cleaned} sudah dipilih.`);
      return;
    }

    if (selectedTopics.length >= 5) {
      setError("Maksimal 5 topik per laporan.");
      return;
    }

    onChange([...selectedTopics, cleaned]);
    setSearchInput("");
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setError("");
    onChange(selectedTopics.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (searchInput.trim()) {
        handleAddTopic(searchInput);
      }
    }
  };

  // Filter suggestion list
  const filteredSuggestions = availableTopics.filter((topic) => {
    const isAlreadySelected = selectedTopics.some(
      (s) => s.toLowerCase() === topic.name.toLowerCase()
    );
    if (isAlreadySelected) return false;

    if (!searchInput.trim()) return true;

    return (
      topic.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      topic.slug.includes(searchInput.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <IconHashtag className="h-4 w-4 text-[#1e4d2b]" />
            <span>Pilih & Tambah Topik Masalah</span>
            <span className="text-red-500">*</span>
          </span>
          <span className="text-[11px] font-normal text-[#7a9a80]">
            {selectedTopics.length}/5 topik
          </span>
        </label>
        <p className="text-[11px] text-[#7a9a80]">
          Gunakan tag hashtag untuk memudahkan warga, AI, dan pemerintah memprioritaskan masalah ini.
        </p>
      </div>

      {/* Selected Topics Chips Bar */}
      <div className="min-h-[44px] p-2.5 rounded-xl border border-[#c8dfc8] bg-[#fafaf5] flex flex-wrap items-center gap-2">
        {selectedTopics.length === 0 ? (
          <span className="text-xs text-[#8c857e] px-1">
            Belum ada topik dipilih. Pilih dari saran di bawah atau ketik topik baru.
          </span>
        ) : (
          selectedTopics.map((topic, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4d2b] px-3 py-1 text-xs font-semibold text-white shadow-xs animate-in fade-in zoom-in-95 duration-150"
            >
              <span>#{topic}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(index)}
                  className="rounded-full p-0.5 text-white/80 hover:text-white hover:bg-white/20 transition"
                  aria-label={`Hapus topik ${topic}`}
                >
                  <IconClose className="h-3 w-3" />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Topic Input Field for Creating/Filtering */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7a9a80]">
            #
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik topik baru atau cari (tekan Enter untuk menambah)..."
            disabled={disabled || selectedTopics.length >= 5}
            className="w-full rounded-xl border border-[#c8dfc8] bg-white pl-8 pr-4 py-2.5 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddTopic(searchInput)}
          disabled={disabled || !searchInput.trim() || selectedTopics.length >= 5}
          className="rounded-xl border border-[#cbe0ce] bg-[#f4f8f4] px-4 py-2.5 text-xs font-semibold text-[#1e4d2b] hover:bg-[#e5f0e6] transition disabled:opacity-40 shrink-0"
        >
          + Tambah Topik
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Topic Suggestions Cloud */}
      {filteredSuggestions.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-[#7a9a80] uppercase tracking-wider">
            Saran Topik Populer:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {filteredSuggestions.slice(0, 10).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAddTopic(t.name)}
                disabled={disabled || selectedTopics.length >= 5}
                className="inline-flex items-center gap-1 rounded-lg border border-[#cbe0ce] bg-white px-2.5 py-1 text-xs text-[#1e4d2b] hover:border-[#1e4d2b] hover:bg-[#f4f8f4] transition disabled:opacity-40"
              >
                <span>#{t.name}</span>
                {t.is_official && (
                  <span className="text-[10px] text-[#2d6a36]" title="Topik Resmi">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

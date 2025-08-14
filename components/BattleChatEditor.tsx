"use client";

import { useState } from "react";
import { Character } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

interface BattleChatEditorProps {
  character: Character;
  onUpdate: (updatedCharacter: Character) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export default function BattleChatEditor({ character, onUpdate, onCancel, showCancel }: BattleChatEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [battleChat, setBattleChat] = useState(character.battleChat || "");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (!battleChat.trim()) {
      toast.error("배틀 대사를 입력해주세요!");
      return;
    }

    if (battleChat.length > 100) {
      toast.error("배틀 대사는 100자 이내로 입력해주세요!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battleChat }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update battle chat");
      }

      const { data } = await response.json();
      onUpdate(data);
      setIsEditing(false);
      toast.success("배틀 대사가 업데이트되었습니다!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBattleChat(character.battleChat || "");
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="mt-2">
      <AnimatePresence mode="wait">
        {!isEditing && !showCancel ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2"
          >
            <p className="text-sm text-gray-400 italic flex-1">&quot;{character.battleChat}&quot;</p>
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="text-xs opacity-70 hover:opacity-100"
            >
              편집
            </Button>
          </motion.div>
        ) : (isEditing || showCancel) && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <textarea
              value={battleChat}
              onChange={(e) => setBattleChat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
              maxLength={100}
              placeholder="배틀 대사를 입력하세요..."
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {battleChat.length}/100
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  variant="default"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
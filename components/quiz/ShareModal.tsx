"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  quizId: string;
  quizTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ quizId, quizTitle, isOpen, onClose }: ShareModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/share`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate share link");
      }

      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
    } catch (error: any) {
      console.error("Error generating share link:", error);
      toast.error(error.message || "Failed to generate share link");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset state when closing
      setTimeout(() => {
        setShareUrl(null);
        setCopied(false);
      }, 200);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Share Quiz
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Share &quot;{quizTitle}&quot; with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-slate-300 mb-4">
                Generate a shareable link so anyone can take this quiz
              </p>
              <Button
                onClick={generateShareLink}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Generate Share Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="shareUrl" className="text-slate-300">
                  Share Link
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="shareUrl"
                    value={shareUrl}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 text-white text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">
                  Anyone with this link can:
                </p>
                <ul className="text-sm text-slate-300 mt-2 space-y-1">
                  <li>- Take the quiz without signing up</li>
                  <li>- See their results immediately</li>
                  <li>- Their attempts will be saved for you to view</li>
                </ul>
              </div>

              <Button
                onClick={copyToClipboard}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

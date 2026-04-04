import React, { useState, useEffect } from 'react';
import { Star, X, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from '../firebase';
import { toast } from 'sonner';

interface SentimentSurveyProps {
  deploymentId: string;
  projectId: string;
  onClose: () => void;
}

export default function SentimentSurvey({ deploymentId, projectId, onClose }: SentimentSurveyProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'surveys'), {
        deploymentId,
        projectId,
        rating,
        question: "On a scale of 1-10, how much time did Yacht Labs save you today?",
        createdAt: serverTimestamp()
      });

      // Mark deployment as surveyed to avoid re-triggering
      const depRef = doc(db, 'deployments', deploymentId);
      await updateDoc(depRef, { surveyCompleted: true });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      toast.error("Failed to save survey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <Zap className="text-zinc-100" size={20} />
              </div>
              <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Sentiment Check</h2>
                <p className="text-[10px] text-zinc-500 font-sans italic mt-1">Resonance is the key to growth.</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-950/20 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-sans font-medium text-zinc-100">Thank You</h3>
                <p className="text-sm text-zinc-500 max-w-xs">Your feedback directly influences the Yacht Labs engine.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <h3 className="text-xl font-sans font-medium text-zinc-100 leading-tight">
                  On a scale of 1-10, how much time did Yacht Labs save you today?
                </h3>
                <p className="text-xs text-zinc-500">1 = None, 10 = Hours of work saved.</p>
              </div>

              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(num)}
                    className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${
                      (hoverRating !== null ? num <= hoverRating : rating !== null && num <= rating)
                        ? 'bg-zinc-100 text-zinc-950 scale-110'
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === null}
                className="w-full py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-xs font-bold tracking-widest hover:bg-zinc-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

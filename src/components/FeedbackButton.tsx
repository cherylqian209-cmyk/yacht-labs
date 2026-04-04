import React, { useState } from 'react';
import { MessageSquare, Send, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, collection, addDoc, serverTimestamp, auth } from '../firebase';
import { toast } from 'sonner';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface FeedbackButtonProps {
  user: any;
}

export default function FeedbackButton({ user }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        content: feedback,
        createdAt: serverTimestamp(),
        status: 'new',
        type: 'bug_report', // Default to bug report as per "Safety Net"
        uid: user.uid,
        userEmail: user.email
      });
      setIsSuccess(true);
      setFeedback('');
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-zinc-100 text-zinc-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
      >
        <MessageSquare size={24} />
        <span className="absolute right-full mr-4 px-3 py-1 bg-zinc-900 text-zinc-100 text-[10px] font-mono uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-800">
          Safety Net: Feedback
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-100">The Safety Net</h2>
                    <p className="text-[10px] text-zinc-500 font-sans italic mt-1">Something broken? Tell us. We'll fix it.</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {isSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-950/20 text-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-medium text-zinc-100">Message Received</h3>
                      <p className="text-xs text-zinc-500 mt-1">We're on it. Expect a fix shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Describe the issue or share an idea..."
                      className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !feedback.trim()}
                      className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-xs font-bold tracking-widest hover:bg-zinc-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {isSubmitting ? 'Sending...' : 'Send to Yacht Labs'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

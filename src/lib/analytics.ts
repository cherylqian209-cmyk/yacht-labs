import { db, collection, addDoc, serverTimestamp, auth } from '../firebase';

export const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'events'), {
      eventName,
      properties,
      timestamp: serverTimestamp(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      uid: user?.uid || null
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

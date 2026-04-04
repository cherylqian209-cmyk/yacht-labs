import { db, collection, addDoc, serverTimestamp } from '../firebase';

export async function triggerSyntheticFeedback(projectId: string) {
  if (!projectId) return;

  const sentiments = ['Excitement', 'Curiosity', 'Skepticism', 'Confusion', 'Validation'];
  const sources = ['X', 'Reddit', 'LinkedIn', 'Direct', 'Email'];
  const authors = ['Alex Rivers', 'Jordan Smith', 'Casey Chen', 'Taylor Wong', 'Morgan Lee'];
  
  const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];

  const feedbackTemplates = [
    "This vision for the project is exactly what the market needs right now.",
    "I'm curious how the deployment strategy will scale for larger teams.",
    "The latest build shows a lot of promise, especially the new UI components.",
    "Just saw the new deployment. The performance is impressive.",
    "Is there a plan to integrate with existing CI/CD pipelines?",
    "The feedback loop here is incredibly tight. Love the progress.",
    "Wait, how does this compare to the current industry standards?",
    "This is a game changer for my workflow. When can I get full access?",
    "The sentiment on X is overwhelmingly positive today.",
    "Reddit users are asking for more documentation on the synthesis engine.",
    "LinkedIn reach is peaking after the latest ship.",
    "Detected a signal: potential enterprise lead from a Fortune 500 company.",
    "Vibe check: The community loves the new dark mode aesthetics.",
    "Echo from the edge: 'The latency on the new build is near zero.'",
  ];

  const randomContent = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];

  try {
    // Add to feedback collection
    await addDoc(collection(db, 'feedback'), {
      projectId,
      content: randomContent,
      sentiment: randomSentiment,
      source: randomSource,
      author: randomAuthor,
      createdAt: serverTimestamp(),
      isPinned: false,
      type: 'echo',
      action: `Monitor ${randomSource} for more ${randomSentiment.toLowerCase()} signals.`
    });

    // Also add an acoustics log entry
    await addDoc(collection(db, 'acoustics_logs'), {
      projectId,
      event: 'signal_detected',
      details: `Generated ${randomSentiment} signal from ${randomSource}`,
      location: ['San Francisco', 'London', 'Tokyo', 'Berlin', 'New York'][Math.floor(Math.random() * 5)],
      timestamp: new Date().toISOString()
    });

    console.log('Synthetic feedback triggered successfully');
  } catch (error) {
    console.error('Failed to trigger synthetic feedback:', error);
  }
}

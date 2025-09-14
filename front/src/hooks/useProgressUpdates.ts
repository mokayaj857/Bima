import { useEffect, useCallback } from 'react';
import { webSocketService } from '@/src/services/websocket';

interface ProgressUpdateData {
  userCourseId: string | number;
  userId?: number;
  courseId?: number;
  progress: number;
  lastCompletedLesson: string | number | null;
  completed: boolean;
  timestamp: string;
}

export const useProgressUpdates = ({
  userId,
  courseId,
  onProgressUpdate,
}: {
  userId?: number;
  courseId?: number;
  onProgressUpdate: (data: ProgressUpdateData) => void;
}) => {
  // Join user and course rooms when component mounts
  useEffect(() => {
    if (userId) {
      webSocketService.joinRoom(`user:${userId}`);
    }
    
    if (courseId) {
      webSocketService.joinRoom(`course:${courseId}`);
    }
    
    // Cleanup function to leave rooms when component unmounts
    return () => {
      if (userId) {
        webSocketService.leaveRoom(`user:${userId}`);
      }
      
      if (courseId) {
        webSocketService.leaveRoom(`course:${courseId}`);
      }
    };
  }, [userId, courseId]);
  
  // Subscribe to progress updates
  useEffect(() => {
    const unsubscribe = webSocketService.subscribe('progress:updated', (data: ProgressUpdateData) => {
      // Only call the callback if the update is relevant to this component
      if (
        (userId && data.userId === userId) || 
        (courseId && data.courseId === courseId) ||
        (!userId && !courseId)
      ) {
        onProgressUpdate(data);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [userId, courseId, onProgressUpdate]);
  
  // Function to manually update progress (if needed)
  const updateProgress = useCallback((userCourseId: string | number, progress: number, lastCompletedLesson: string | number | null) => {
    // This would typically be called via your API, not directly through WebSocket
    // The backend will emit the progress update to all connected clients
    console.log('Progress update should be handled via API, not WebSocket');
  }, []);
  
  return { updateProgress };
};

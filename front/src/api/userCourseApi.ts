import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface UpdateProgressData {
  progress: number;
  lastCompletedLesson: string | number | null;
  completed?: boolean;
}

export const userCourseApi = {
  // Update user course progress
  async updateProgress(userCourseId: string | number, data: UpdateProgressData) {
    try {
      const response = await axios.put(
        `${API_URL}/api/user-courses/${userCourseId}`,
        { data },
        {
          headers: {
            'Content-Type': 'application/json',
            // Make sure to include authentication token if needed
            // 'Authorization': `Bearer ${token}`
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Get user course by ID
  async getUserCourse(userCourseId: string | number) {
    try {
      const response = await axios.get(
        `${API_URL}/api/user-courses/${userCourseId}?populate=*`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user course:', error);
      throw error;
    }
  },
};

export default userCourseApi;

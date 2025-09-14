"use client"

import React, { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Search } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from "axios";

interface Category {
  category: string;
}

interface CourseData {
  id: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
  author: any;
  shareText: string;
  articleSections: string[];
  relatedArticles: any[];
}

const DiscoverPage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [openCourse, setOpenCourse] = useState<CourseData | null>(null);

  // Enroll user in course when opening dialog (if authenticated)
  useEffect(() => {
    const enroll = async () => {
      if (openCourse && user && token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/user-courses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: {
                user: user.id,
                course: openCourse.id,
                enrolledAt: new Date().toISOString(),
              }
            })
          });
        } catch (err) {
          // Optionally handle error
        }
      }
    };
    enroll();
    // Only run when openCourse changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCourse]);

  useEffect(() => {
    axios
      .get("/api/discover")
      .then((res) => {
        setCategories(res.data?.categories || []);
        setAllCourses(res.data?.courses || []);
      })
      .catch(() => {
        fetch("/data/discoverCourses.json")
          .then((res) => res.json())
          .then((data) => setCategories(data));
        fetch("/data/courseData.json")
          .then((res) => res.json())
          .then((data) => setAllCourses(data.courses || []));
      });
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // When a category is selected, show courses from courseData.json that match the category
  const selectedCourses = selectedCategory
    ? allCourses.filter(
        (course) =>
          course.category.toLowerCase().replace(/ /g, "") ===
          selectedCategory.toLowerCase().replace(/ /g, "")
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e]">
      {/* Top Bar */}
      

      {/* Category Cards or All Courses fallback */}
      {!selectedCategory ? (
        <main className="flex flex-col px-4 lg:px-8 py-10 flex-1 overflow-auto">
          {categories.length > 0 ? (
            <>
              <h2 className="text-white text-2xl font-bold mb-8">Discover Courses by Category</h2>
              <div className="flex items-center justify-between px-6 py-6 mb-2">
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="text"
                      placeholder="Search categories"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#353535] border border-transparent rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {filteredCategories.map((cat) => {
                  const count = allCourses.filter(
                    (course) =>
                      course.category.toLowerCase().replace(/ /g, "") ===
                      cat.category.toLowerCase().replace(/ /g, "")
                  ).length;
                  return (
                    <button
                      key={cat.category}
                      className="bg-[#232323] hover:bg-[#353535] rounded-2xl p-8 flex flex-col items-center shadow-lg transition-all duration-200 border border-transparent hover:border-blue-500"
                      onClick={() => setSelectedCategory(cat.category)}
                    >
                      <span className="text-3xl mb-4">{cat.category}</span>
                      <span className="text-white/70 text-sm">{count} Courses</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-white text-2xl font-bold mb-8">All Courses</h2>
              <div className="flex flex-col space-y-4 lg:space-y-6 max-w-4xl mx-auto w-full">
                {allCourses.length > 0 ? (
                  allCourses.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/course/${item.id}`}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl px-4 lg:px-6 py-4 lg:py-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
                    >
                      <div className="flex items-start sm:items-center space-x-4 mb-4 sm:mb-0">
                        <img
                          src={item.image && item.image.trim() !== "" ? item.image : "/file.svg"}
                          alt="avatar"
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white/40 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                            {item.title}
                          </div>
                          <div className="text-gray-700 text-sm mb-2 line-clamp-2 sm:line-clamp-1">
                            {item.author?.name}
                          </div>
                          {item.readTime && (
                            <div className="text-gray-600 text-xs">{item.readTime}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center text-white/80 py-10">No courses available.</div>
                )}
              </div>
            </>
          )}
        </main>
      ) : (
        <main className="flex flex-col px-4 lg:px-8 py-10 flex-1 overflow-auto">
          <button
            className="mb-6 text-blue-400 hover:underline text-left"
            onClick={() => setSelectedCategory(null)}
          >
            ← Back to Categories
          </button>
          <h2 className="text-white text-2xl font-bold mb-8">{selectedCategory} Courses</h2>
          <div className="flex flex-col space-y-4 lg:space-y-6 max-w-4xl mx-auto w-full">
            {selectedCourses.length > 0 ? (
              <>
                {selectedCourses.map((item) => (
                  <button
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl px-4 lg:px-6 py-4 lg:py-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 text-left w-full"
                    onClick={() => setOpenCourse(item)}
                  >
                    <div className="flex items-start sm:items-center space-x-4 mb-4 sm:mb-0">
                      <img
                        src={item.image && item.image.trim() !== "" ? item.image : "/file.svg"}
                        alt="avatar"
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white/40 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                          {item.title}
                        </div>
                        <div className="text-gray-700 text-sm mb-2 line-clamp-2 sm:line-clamp-1">
                          {item.author?.name}
                        </div>
                        {item.readTime && (
                          <div className="text-gray-600 text-xs">{item.readTime}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {/* Dialog for course content */}
                <Dialog open={!!openCourse} onOpenChange={(open) => !open && setOpenCourse(null)}>
                  <DialogContent>
                    {openCourse && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{openCourse.title}</DialogTitle>
                          <DialogDescription>
                            {openCourse.category} &middot; {openCourse.readTime}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 text-gray-900 whitespace-pre-line max-h-60 overflow-y-auto">
                          {openCourse.content ? openCourse.content.slice(0, 400) + (openCourse.content.length > 400 ? '...' : '') : 'No content available.'}
                        </div>
                        <div className="mt-6 flex justify-end">
                          <Link
                            href={`/dashboard/course/${openCourse.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            Read More
                          </Link>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="text-center text-white/80 py-10">
                No courses found in this category.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default DiscoverPage;

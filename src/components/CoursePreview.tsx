"use client";
import { Course } from "@/types";
import Header from "./Header";

interface CoursePreviewProps {
  course: Course;
  onStartRound: () => void;
  onAddLocation: () => void;
}

export default function CoursePreview({
  course,
  onStartRound,
  onAddLocation,
}: CoursePreviewProps) {
  const totalPar = course.holePars?.reduce((sum, hole) => sum + hole.par, 0) || course.holes * 3;
  const estimatedLength = course.estimatedLengthMeters 
    ? `${(course.estimatedLengthMeters / 1000).toFixed(1)}km`
    : 'Unknown';

  return (
    <div className="space-y-4">
      <Header 
        title="Course Preview"
      />
      
      <div className="card">
        <h2 className="text-xl font-bold dark:text-white text-[var(--header-color)]">{course.name}</h2>
        
        {course.description && (
          <p className="text-sm dark:text-white text-gray-60 mt-2">
            {course.description}
          </p>
        )}

        <div className="flex gap-4 text-sm dark:text-white text-gray-700 mt-3">
          <span>{course.holes} holes</span>
          <span>Par {totalPar}</span>
          <span>{estimatedLength}</span>
        </div>

        {course.addressUrl && (
          <a 
            href={course.addressUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline text-sm mt-2 block"
          >
            Veibeskrivelse
          </a>
        )}

        {/* Course holes table */}
        {course.holePars && course.holePars.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-[var(--header-color)] mb-2">Hole Details</h3>
            <div className="space-y-4">
              {/* Holes 1-9 */}
              <div className="flex">
                {/* Labels column */}
                <div className="flex flex-col justify-center mr-2 text-xs font-semibold dark:text-white text-[var(--header-color)]">
                  <div className="h-8 flex items-center">Hole</div>
                  <div className="h-8 flex items-center">Dist</div>
                  <div className="h-8 flex items-center">Par</div>
                </div>
                
                {/* Holes data */}
                <div className="flex-1 grid grid-cols-9 gap-1">
                  {course.holePars.slice(0, 9).map((hole) => (
                    <div key={hole.hole} className="text-center">
                      <div className="h-8 flex items-center justify-center p-1 dark:bg-[#1f2937] bg-white font-semibold">
                        {hole.hole}
                      </div>
                      <div className="h-8 flex items-center justify-center p-1 dark:bg-[#1f2937] bg-white rounded">
                        {hole.distanceMeters ? `${hole.distanceMeters}` : '-'}
                      </div>
                      <div className="h-8 flex items-center justify-center p-1 dark:bg-[#1f2937] bg-white rounded font-bold">
                        {hole.par}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Holes 10-18 */}
              {course.holePars.length > 9 && (
                <div className="flex">
                  {/* Labels column */}
                  <div className="flex flex-col justify-center mr-2 text-xs font-semibold dark:text-white text-[var(--header-color)]">
                    <div className="h-8 flex items-center">Hole</div>
                    <div className="h-8 flex items-center">Dist</div>
                    <div className="h-8 flex items-center">Par</div>
                  </div>
                  
                  {/* Holes data */}
                  <div className="flex-1 grid grid-cols-9 gap-1">
                    {course.holePars.slice(9, 18).map((hole) => (
                      <div key={hole.hole} className="text-center">
                        <div className="h-8 flex items-center justify-center p-1 dark:bg-[#1f2937] bg-white rounded font-semibold">
                          {hole.hole}
                        </div>
                        <div className="h-8 flex items-center justify-center p-1 dark:bg-[#1f2937] bg-white rounded">
                          {hole.distanceMeters ? `${hole.distanceMeters}` : '-'}
                        </div>
                        <div className="h-8 flex items-center justify-center p-1 dark:bg-[#1f2937] bg-white rounded font-bold">
                          {hole.par}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onStartRound}
            className="btn btn-primary flex-1"
          >
            Start Round
          </button>
          
          {!course.latitude && (
            <button
              onClick={onAddLocation}
              className="btn btn-outline"
            >
              📍 Add Location Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

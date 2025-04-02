import React from 'react';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  availableSkills: string[];
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  radius: number;
  setRadius: (radius: number) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  availableSkills,
  selectedSkills,
  onSkillToggle,
  radius,
  setRadius,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Jobs
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Electrician, Plumbing, etc."
          />
        </div>

        {/* Radius Filter */}
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Radius: {radius}km
          </label>
          <input
            type="range"
            id="radius"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Skills Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map(skill => (
              <button
                key={skill}
                onClick={() => onSkillToggle(skill)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedSkills.includes(skill)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
"use client";

import { useEffect, useState } from "react";

interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterByDegree, setFilterByDegree] = useState<string>("");
  const [filterByExperience, setFilterByExperience] = useState<string>("");

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/advocates");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch advocates");
        console.error("Error fetching advocates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const applyFilters = () => {
    let filtered = [...advocates];

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((advocate) => {
        return (
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          advocate.city.toLowerCase().includes(searchLower) ||
          advocate.degree.toLowerCase().includes(searchLower) ||
          advocate.specialties.some(specialty => specialty.toLowerCase().includes(searchLower)) ||
          advocate.yearsOfExperience.toString().includes(searchLower)
        );
      });
    }

    // Apply degree filter
    if (filterByDegree) {
      filtered = filtered.filter(advocate => advocate.degree === filterByDegree);
    }

    // Apply experience filter
    if (filterByExperience) {
      switch (filterByExperience) {
        case "0-5":
          filtered = filtered.filter(advocate => advocate.yearsOfExperience <= 5);
          break;
        case "6-10":
          filtered = filtered.filter(advocate => advocate.yearsOfExperience >= 6 && advocate.yearsOfExperience <= 10);
          break;
        case "11+":
          filtered = filtered.filter(advocate => advocate.yearsOfExperience >= 11);
          break;
      }
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Advocate];
        let bValue: any = b[sortBy as keyof Advocate];

        if (sortBy === "yearsOfExperience") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    setFilteredAdvocates(filtered);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onDegreeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterByDegree(e.target.value);
  };

  const onExperienceFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterByExperience(e.target.value);
  };

  const onSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Apply filters whenever any filter value changes
  useEffect(() => {
    applyFilters();
  }, [advocates, debouncedSearchTerm, filterByDegree, filterByExperience, sortBy, sortOrder]);

  const onReset = () => {
    setSearchTerm("");
    setFilterByDegree("");
    setFilterByExperience("");
    setSortBy("");
    setSortOrder("asc");
  };

  const uniqueDegrees = Array.from(new Set(advocates.map(advocate => advocate.degree))).sort();
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Solace Advocates</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">Loading advocates...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Solace Advocates</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Advocates
          </label>
          <div className="flex gap-2">
            <input 
              id="search"
              type="text"
              value={searchTerm}
              onChange={onChange}
              placeholder="Search by name, city, degree, or specialties..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={onReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="degreeFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Degree
            </label>
            <select 
              id="degreeFilter"
              value={filterByDegree}
              onChange={onDegreeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Degrees</option>
              {uniqueDegrees.map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="experienceFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Experience
            </label>
            <select 
              id="experienceFilter"
              value={filterByExperience}
              onChange={onExperienceFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Experience Levels</option>
              <option value="0-5">0-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="11+">11+ years</option>
            </select>
          </div>
        </div>
        
        {(debouncedSearchTerm || filterByDegree || filterByExperience) && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            {debouncedSearchTerm && <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Search: {debouncedSearchTerm}</span>}
            {filterByDegree && <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Degree: {filterByDegree}</span>}
            {filterByExperience && <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Experience: {filterByExperience}</span>}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredAdvocates.length} of {advocates.length} advocates
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100" onClick={() => onSort("firstName")}>First Name {getSortIcon("firstName")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100" onClick={() => onSort("lastName")}>Last Name {getSortIcon("lastName")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100" onClick={() => onSort("city")}>City {getSortIcon("city")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100" onClick={() => onSort("degree")}>Degree {getSortIcon("degree")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Specialties</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100" onClick={() => onSort("yearsOfExperience")}>Experience {getSortIcon("yearsOfExperience")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Contact</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdvocates.map((advocate, index) => {
              return (
                <tr key={advocate.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{advocate.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium">
                      {advocate.degree}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {advocate.specialties.slice(0, 3).map((specialty, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                      {advocate.specialties.length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{advocate.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{advocate.yearsOfExperience}</span> years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <a href={`tel:${advocate.phoneNumber}`} className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors">
                      <span className="mr-1">📞</span>
                      {advocate.phoneNumber.toString().replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredAdvocates.length === 0 && advocates.length > 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advocates found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}

"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Menu } from "lucide-react";

const categories = {
  Tours: {
    filters: {
      location: "text",
      theme: ["Adventure", "Cultural", "Luxury"],
      activity: ["Swimming", "Running", "Elephant care", "Snorkeling"],
      price: { type: "range", min: 0, max: 25000 },
      startTime: { type: "timeRange", min: "00:00", max: "23:59" },
      groupSize: { type: "range", min: 0, max: 100 },
      vehicle: ["Yacht", "Speedboat", "Safari", "Catamaran", "Speedcatamaran"],
      features: ["Transfer", "Halal Food", "Vegetarian food"],
    }
  },
  Tickets: {
    filters: {
      theme: ["Music", "Theater", "Festival"],
      activity: ["Concert", "Play", "Dance"],
      price: "number",
      startTime: ["Morning", "Afternoon", "Evening"],
      seating: ["VIP", "Standard", "Economy"],
      venue: ["Indoor", "Outdoor"],
    }
  },
  Rent: {
    filters: {
      theme: ["Luxury", "Adventure", "Family"],
      activity: ["Party", "Sightseeing", "Sports"],
      price: "number",
      duration: ["Half Day", "Full Day", "Weekly"],
      capacity: ["2-4", "4-8", "8+"],
      features: ["With Captain", "Self-Drive", "All Inclusive"],
    }
  },
  Transfer: {
    filters: {
      vehicle: ["Sedan", "Van", "Bus"],
      price: "number",
      capacity: ["1-4", "5-8", "9+"],
      service: ["One-way", "Round-trip", "Hourly"],
      features: ["Meet & Greet", "Luggage Help", "WiFi"],
    }
  },
};

const fakeData = [
  {
    id: 1,
    category: "Tours",
    type: "Island Tour",
    theme: "Adventure",
    activity: "Snorkeling",
    price: 150,
    startTime: "09:00 AM",
    groupSize: "10-20 people",
    vehicle: "Boat",
    features: ["Scenic Views", "Private Tour"],
  },
  {
    id: 2,
    category: "Tours",
    type: "Land Tour",
    theme: "Cultural",
    activity: "City Sightseeing",
    price: 120,
    startTime: "10:00 AM",
    groupSize: "5-15 people",
    vehicle: "Bus",
    features: ["Historical Sites", "Guided Tour"],
  },
  {
    id: 3,
    category: "Rent",
    type: "Yacht",
    theme: "Luxury",
    activity: "Private Party",
    price: 500,
    startTime: "01:00 PM",
    groupSize: "20-40 people",
    vehicle: "Yacht",
    features: ["Open Bar", "Music System"],
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tours");
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState(fakeData);
  const [timeRange, setTimeRange] = useState({ min: "00:00", max: "23:59" });

  const handleFilterChange = (filterKey, filterValue) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterKey]: filterValue };
      
      // Filter the data based on all active filters
      const newFilteredData = fakeData.filter(item => {
        return Object.entries(newFilters).every(([key, value]) => {
          // Skip empty filter values
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return true;
          }

          switch (key) {
            case 'price':
              return item.price <= Number(value);
            
            case 'startTime':
              // Convert time strings to comparable values
              const itemTime = new Date(`1970/01/01 ${item.startTime}`).getTime();
              const filterTime = new Date(`1970/01/01 ${value}`).getTime();
              return itemTime <= filterTime;
            
            case 'groupSize':
              // Extract the maximum number from ranges like "10-20 people"
              const maxSize = parseInt(item.groupSize.split('-')[1]);
              return maxSize <= Number(value);
            
            case 'features':
              // Check if item has all selected features
              return value.every(feature => 
                item.features.includes(feature)
              );
            
            case 'location':
              return item.location?.toLowerCase()
                .includes(value.toLowerCase());
            
            // For other filters (theme, activity, vehicle)
            default:
              return item[key] === value;
          }
        });
      });

      setFilteredData(newFilteredData);
      return newFilters;
    });
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => {
      const features = prev.features || [];
      const newFeatures = features.includes(feature)
        ? features.filter(f => f !== feature)
        : [...features, feature];
      
      // Update filtered data with new features
      const newFilteredData = fakeData.filter(item => {
        return newFeatures.length === 0 || 
          newFeatures.every(f => item.features.includes(f));
      });

      setFilteredData(newFilteredData);
      return { ...prev, features: newFeatures };
    });
  };

  const handleTimeRangeChange = (minutes) => {
    const time = new Date();
    time.setHours(Math.floor(minutes / 60));
    time.setMinutes(minutes % 60);
    const timeString = time.toTimeString().substring(0, 5);
    handleFilterChange('startTime', timeString);
  };

  // Add this function to get the count of items for each filter value
  const getFilterCount = (filterKey, filterValue) => {
    return fakeData.filter(item => {
      if (filterKey === 'features') {
        return item.features.includes(filterValue);
      }
      if (filterKey === 'price' || filterKey === 'startTime' || filterKey === 'groupSize') {
        return true; // For range filters, show all items
      }
      return item[filterKey] === filterValue;
    }).length;
  };

  const renderFilterInputs = () => {
    const categoryFilters = categories[selectedCategory].filters;
    
    return Object.entries(categoryFilters).map(([filterKey, filterConfig]) => (
      <div key={filterKey} className="mb-6">
        <h3 className="text-gray-800 font-medium mb-2 capitalize">{filterKey}</h3>
        
        {filterKey === "location" && (
          <div className="relative">
            <input
              type="text"
              className="border p-2 w-full rounded-lg text-sm pr-8"
              placeholder="Where you wanna visit? (Phi Phi island, Chalong temple...)"
            />
            <span className="absolute right-2 top-2">🔍</span>
          </div>
        )}

        {Array.isArray(filterConfig) && filterKey !== "features" && (
          <div className="flex flex-wrap gap-2">
            {filterConfig.map((value) => (
              <button
                key={value}
                className={`px-3 py-1 rounded-full text-sm border
                  ${filters[filterKey] === value 
                    ? 'bg-[#F78410] text-white' 
                    : 'bg-white text-gray-700'}`}
                onClick={() => handleFilterChange(filterKey, value)}
              >
                {value} ({getFilterCount(filterKey, value)})
              </button>
            ))}
          </div>
        )}

        {filterKey === "features" && (
          <div className="flex flex-wrap gap-2">
            {filterConfig.map((value) => (
              <button
                key={value}
                className={`px-3 py-1 rounded-full text-sm border
                  ${filters[filterKey]?.includes(value)
                    ? 'bg-[#F78410] text-white'
                    : 'bg-white text-gray-700'}`}
                onClick={() => handleFeatureToggle(value)}
              >
                {value} (43)
              </button>
            ))}
          </div>
        )}

        {filterConfig.type === "range" && (
          <div>
            <input
              type="range"
              min={filterConfig.min}
              max={filterConfig.max}
              className="w-full"
              onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            />
            <input
              type="number"
              value={filters[filterKey] || ""}
              className="border p-1 rounded-md w-20 text-sm mt-2"
              onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            />
          </div>
        )}

        {filterConfig.type === "timeRange" && (
          <div>
            <input
              type="range"
              min={0}
              max={1440}
              className="w-full"
              onChange={(e) => handleTimeRangeChange(e.target.value)}
            />
            <input
              type="time"
              value={filters[filterKey] || ""}
              className="border p-1 rounded-md w-24 text-sm mt-2"
              onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-[#F78410] p-4 flex justify-between items-center shadow-md">
        <h1 className="text-white text-lg font-bold">Traveller's Local Market</h1>
        {/* Filter Button for Mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="text-white p-2 rounded-md focus:outline-none sm:hidden"
        >
          <Menu size={24} />
        </button>
        {/* Filter Button for Desktop */}
        <div className="hidden sm:flex space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className="text-white p-1 sm:p-2 rounded-md hover:bg-[#E07516] focus:outline-none"
          >
            Filter
          </button>
        </div>
      </nav>

      {/* Sidebar for Filters (Mobile version) */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
        <div className="fixed inset-y-0 right-0 flex">
          <div className="bg-white w-[400px] h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">{selectedCategory}</h2>
                <button className="text-gray-600">Filter</button>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400">
                ✕
              </button>
            </div>
            
            {renderFilterInputs()}

            <div className="fixed bottom-0 right-0 w-[400px] p-4 bg-white border-t flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg text-gray-700 border"
                onClick={() => {
                  setFilters({});
                  setFilteredData(fakeData);
                }}
              >
                RESET
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-[#F78410] text-white"
                onClick={() => setIsOpen(false)}
              >
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Main Content - Filtered Results */}
      <div className="p-4 w-full">
        <h2 className="text-lg font-semibold mb-4">Filtered Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                <h3 className="font-medium text-[#F78410] text-xl">{item.type}</h3>
                <p className="text-gray-700 mt-2">Theme: <span className="font-semibold">{item.theme}</span></p>
                <p className="text-gray-700 mt-1">Activity: <span className="font-semibold">{item.activity}</span></p>
                <p className="text-gray-700 mt-1">Price: <span className="font-semibold">${item.price}</span></p>
                <p className="text-gray-700 mt-1">Start Time: <span className="font-semibold">{item.startTime}</span></p>
                <p className="text-gray-700 mt-1">Group Size: <span className="font-semibold">{item.groupSize}</span></p>
                <p className="text-gray-700 mt-1">Vehicle: <span className="font-semibold">{item.vehicle}</span></p>
                <p className="text-gray-700 mt-1">Features: <span className="font-semibold">{item.features.join(", ")}</span></p>
                <div className="mt-4 space-x-2">
                  {/* Butonlar mobilde daha küçük */}
                  <button className="bg-[#F78410] text-white p-1 sm:p-2 rounded-md text-sm w-auto hover:bg-[#F2A945]">
                    Book Now
                  </button>
                  <button className="bg-[#E07516] text-white p-1 sm:p-2 rounded-md text-sm w-auto hover:bg-[#F78410]">
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No results found based on selected filters.</p>
          )}
        </div>
      </div>
    </>
  );
}

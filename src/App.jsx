import React, {useState, useEffect} from "react";
import axios from "axios";

const App = () => {
    const [categories, setCategories] = useState([]);
    const [features, setFeatures] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [error, setError] = useState("");
    const [costDetails, setCostDetails] = useState(null); // Holds the cost details after submission

    const PER_HOUR_COST = 10; // Cost per hour

    // Fetch categories when the component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://app-cost-calculator-api-backend.vercel.app/categories/");
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Failed to fetch categories.");
            }
        };

        fetchCategories();
    }, []);

    // Fetch features based on selected category
    useEffect(() => {
        const fetchFeatures = async () => {
            if (selectedCategory) {
                try {
                    const response = await axios.get("https://app-cost-calculator-api-backend.vercel.app/features/");
                    const filteredFeatures = response.data.filter(
                        (feature) => feature.category === parseInt(selectedCategory)
                    );
                    setFeatures(filteredFeatures);
                } catch (err) {
                    console.error("Error fetching features:", err);
                    setError("Failed to fetch features.");
                }
            } else {
                setFeatures([]);
            }
        };

        fetchFeatures();
    }, [selectedCategory]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedFeatures([]);
        setError("");
        setCostDetails(null);
    };

    const handleFeatureToggle = (feature) => {
        setSelectedFeatures((prevFeatures) =>
            prevFeatures.includes(feature)
                ? prevFeatures.filter((f) => f !== feature)
                : [...prevFeatures, feature]
        );
    };

    const handleSubmit = () => {
        if (!selectedCategory) {
            setError("Please select a category");
        } else if (selectedFeatures.length === 0) {
            setError("Please select at least one feature");
        } else {
            setError("");

            // Calculate total hours and cost
            const selectedFeatureDetails = features.filter((feature) =>
                selectedFeatures.includes(feature.name)
            );
            const totalHours = selectedFeatureDetails.reduce(
                (total, feature) => total + parseFloat(feature.hours),
                0
            );
            const totalCost = totalHours * PER_HOUR_COST;

            setCostDetails({
                selectedFeatureDetails,
                totalHours,
                totalCost,
            });
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 py-5">App Cost Calculator</h2>

            {/* Category Dropdown */}
            <div className="mb-6 relative">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Select App Category
                </label>
                <div className="relative">
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        aria-label="Select app category"
                    >
                        <option value="">Choose a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Feature Selection */}
            {selectedCategory && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select App Features
                    </label>
                    <div className="space-y-2">
                        {features.map((feature) => (
                            <div key={feature.id} className="flex items-center">
                                <input
                                    id={feature.name}
                                    type="checkbox"
                                    checked={selectedFeatures.includes(feature.name)}
                                    onChange={() => handleFeatureToggle(feature.name)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={feature.name} className="ml-2 block text-sm text-gray-900">
                                    {feature.name} (Estimated hours: {feature.hours})
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
                Submit
            </button>

            {/* Display Cost Details in Table */}
            {costDetails && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800">Cost Breakdown</h3>
                    <table className="min-w-full mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Category</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700"
                                colSpan={3}>
                                {categories.find((cat) => cat.id === parseInt(selectedCategory))?.name}
                            </th>

                        </tr>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Feature</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Hours</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Cost</th>
                        </tr>
                        </thead>
                        <tbody>
                        {costDetails.selectedFeatureDetails.map((feature) => (
                            <tr key={feature.id}>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{feature.name}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{feature.hours}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">${(parseFloat(feature.hours) * PER_HOUR_COST).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="py-2 px-4 text-sm font-semibold text-gray-700">Total</td>
                            <td className="py-2 px-4 text-sm font-semibold text-gray-700">{costDetails.totalHours.toFixed(2)} hours</td>
                            <td className="py-2 px-4 text-sm font-semibold text-gray-700">${costDetails.totalCost.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default App;

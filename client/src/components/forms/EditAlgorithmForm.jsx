import { useState } from "react";
import { Trash2, Plus, ChevronDown } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import AlgorithmPreview from "../../pages/AlgorithmPreview";

const EditAlgorithmForm = ({ algorithm = {}, onSave, onCancel, categories }) => {
  const [editedData, setEditedData] = useState({
    title: algorithm.title || "",
    problemStatement: algorithm.problemStatement || "",
    intuition: algorithm.intuition || "",
    explanation: algorithm.explanation || "",
    complexity: algorithm.complexity || { time: "", space: "" },
    difficulty: algorithm.difficulty || "Easy",
    category: algorithm.category || [],
    tags: algorithm.tags || [],
    links: algorithm.links || [],
    codes: algorithm.codes?.length ? algorithm.codes : [{ language: "", code: "" }],
  });

  const [preview, setPreview] = useState(false);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (field, index, value) => {
    const updated = [...editedData[field]];
    updated[index] = value;
    handleChange(field, updated);
  };

  const addArrayItem = (field, defaultValue = "") => {
    const updated = [...editedData[field], defaultValue];
    handleChange(field, updated);
    if (field === "codes") setSelectedCodeIndex(updated.length - 1);
  };

  const removeArrayItem = (field, index) => {
    if (field === "codes" && editedData.codes.length === 1) return;
    const updated = editedData[field].filter((_, i) => i !== index);
    handleChange(field, updated);
    if (field === "codes") {
      if (index === selectedCodeIndex && index > 0) setSelectedCodeIndex(index - 1);
      else if (selectedCodeIndex >= updated.length) setSelectedCodeIndex(Math.max(updated.length - 1, 0));
    }
  };

  const calculateEditorHeight = (code) => code.split("\n").length * 20 + 40;

  const renderInput = (label, value, onChange, multiline = false) => (
    <div className="space-y-2 w-full">
      <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full p-4 text-base border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          type="text"
          className="w-full p-4 text-base border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  const renderDropdown = (label, options, selected, setSelected, isOpen, setOpen) => (
    <div className="space-y-2 w-full max-w-md">
      <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpen(!isOpen)}
          className="w-full px-4 py-3 text-base text-left rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {selected || `Select ${label.toLowerCase()}`}
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700 max-h-48 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-base hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selected === opt ? "font-bold" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl space-y-10">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700 pb-4">
        {["Edit", "Preview"].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setPreview(i === 1)}
            className={`text-base font-medium px-5 py-2 rounded-xl transition-all ${
              (i === 1 ? preview : !preview)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {preview ? (
        <AlgorithmPreview algorithm={editedData} />
      ) : (
        <div className="space-y-8">
          {renderInput("Title", editedData.title, (val) => handleChange("title", val))}
          {renderInput("Problem Statement", editedData.problemStatement, (val) => handleChange("problemStatement", val), true)}
          {renderInput("Intuition", editedData.intuition, (val) => handleChange("intuition", val), true)}
          {renderInput("Explanation", editedData.explanation, (val) => handleChange("explanation", val), true)}

          {/* Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["time", "space"].map((key) => (
              <div className="space-y-2" key={key}>
                <label className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                  {key} Complexity
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-base border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  value={editedData.complexity[key]}
                  onChange={(e) =>
                    setEditedData((prev) => ({
                      ...prev,
                      complexity: { ...prev.complexity, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {renderDropdown(
            "Difficulty",
            ["Easy", "Medium", "Hard"],
            editedData.difficulty,
            (val) => handleChange("difficulty", val),
            showDifficultyDropdown,
            setShowDifficultyDropdown
          )}

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = editedData.category.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? editedData.category.filter((c) => c !== cat)
                        : [...editedData.category, cat];
                      handleChange("category", updated);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags & Links */}
          {["tags", "links"].map((field) => (
            <div key={field} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                  {field}
                </label>
                <button
                  onClick={() => addArrayItem(field)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {editedData[field].map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={(e) => updateArrayItem(field, i, e.target.value)}
                      className="flex-1 px-4 py-3 text-base border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeArrayItem(field, i)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Remove ${field.slice(0, -1)}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Code Snippets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Code Snippets</label>
              <button
                onClick={() => addArrayItem("codes", { language: "", code: "" })}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedData.codes.map((code, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCodeIndex(index)}
                  className={`px-4 py-2 font-mono text-sm rounded-xl ${
                    selectedCodeIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {code.language || `Lang ${index + 1}`}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Language (e.g., JavaScript)"
                  value={editedData.codes[selectedCodeIndex].language}
                  onChange={(e) => {
                    const updated = [...editedData.codes];
                    updated[selectedCodeIndex].language = e.target.value;
                    handleChange("codes", updated);
                  }}
                  className="flex-grow px-4 py-3 text-base border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                />
                {editedData.codes.length > 1 && (
                  <button
                    onClick={() => removeArrayItem("codes", selectedCodeIndex)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Remove code snippet"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <MonacoEditor
                height={calculateEditorHeight(editedData.codes[selectedCodeIndex].code || "")}
                language={editedData.codes[selectedCodeIndex].language}
                value={editedData.codes[selectedCodeIndex].code}
                onChange={(code) => {
                  const updated = [...editedData.codes];
                  updated[selectedCodeIndex].code = code;
                  handleChange("codes", updated);
                }}
                theme="vs-dark"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-end pt-6">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-base rounded-xl border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedData)}
              className="px-6 py-3 text-base rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAlgorithmForm;

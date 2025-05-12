import { useState } from "react";
import { X, Plus } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import AlgorithmPreview from "./AlgorithmPreview";

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
      if (index === selectedCodeIndex && index > 0)
        setSelectedCodeIndex(index - 1);
      else if (selectedCodeIndex >= updated.length)
        setSelectedCodeIndex(Math.max(updated.length - 1, 0));
    }
  };

  const calculateEditorHeight = (code) => code.split("\n").length * 20 + 40;

  const renderInput = (label, value, onChange, multiline = false) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {multiline ? (
        <textarea
          className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          type="text"
          className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  const renderCodeEditor = () => {
    const codeObj = editedData.codes[selectedCodeIndex];
    if (!codeObj) return null;

    const editorHeight = calculateEditorHeight(codeObj.code || "");

    return (
      <div className="relative space-y-3">
        <input
          type="text"
          placeholder="Language (e.g., JavaScript)"
          value={codeObj.language}
          onChange={(e) => {
            const updated = [...editedData.codes];
            updated[selectedCodeIndex].language = e.target.value;
            handleChange("codes", updated);
          }}
          className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
        />
        <MonacoEditor
          height={editorHeight}
          language={codeObj.language}
          value={codeObj.code}
          onChange={(code) => {
            const updated = [...editedData.codes];
            updated[selectedCodeIndex].code = code;
            handleChange("codes", updated);
          }}
          theme="vs-dark"
        />
        {editedData.codes.length > 1 && (
          <button
            onClick={() => removeArrayItem("codes", selectedCodeIndex)}
            className="text-red-500 hover:text-red-700 absolute top-0 right-0 p-2"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-8xl mx-auto px-6 py-10 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl space-y-10">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700 pb-4">
        {["Edit", "Preview"].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setPreview(i === 1)}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
              (i === 1 ? preview : !preview)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
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
          {/* Text fields */}
          {renderInput("Title", editedData.title, (val) => handleChange("title", val))}
          {renderInput("Problem Statement", editedData.problemStatement, (val) => handleChange("problemStatement", val), true)}
          {renderInput("Intuition", editedData.intuition, (val) => handleChange("intuition", val), true)}
          {renderInput("Explanation", editedData.explanation, (val) => handleChange("explanation", val), true)}

          {/* Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["time", "space"].map((key) => (
              <div className="space-y-2" key={key}>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{key} Complexity</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
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

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Difficulty</label>
            <div className="relative w-full md:w-[12rem]">
              <select
                value={editedData.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
                className="w-full appearance-none px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white pr-10 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white">▼</div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categories</label>
            <div className="relative w-full md:w-[16rem]">
              <button
                onClick={() => setShowCategoryDropdown((prev) => !prev)}
                className="w-full px-4 py-2 text-left rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editedData.category.length > 0
                  ? editedData.category.join(", ")
                  : "Select categories"}
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">▼</span>
              </button>
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-2 w-full max-h-48 overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editedData.category.includes(cat)}
                        onChange={() => {
                          const updated = editedData.category.includes(cat)
                            ? editedData.category.filter((c) => c !== cat)
                            : [...editedData.category, cat];
                          handleChange("category", updated);
                        }}
                        className="mr-2 accent-blue-600"
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags & Links */}
          {["tags", "links"].map((field) => (
            <div key={field} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{field}</label>
              <div className="space-y-3">
                {editedData[field].map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={(e) => updateArrayItem(field, i, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeArrayItem(field, i)} className="text-red-500 hover:text-red-700">
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addArrayItem(field)} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={16} /> Add {field}
                </button>
              </div>
            </div>
          ))}

          {/* Code Snippets */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Code Snippets</label>
            <div className="flex flex-wrap gap-2">
              {editedData.codes.map((code, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCodeIndex(index)}
                  className={`px-4 py-2 font-mono text-sm rounded-md transition-all ${
                    selectedCodeIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {code.language || `Lang ${index + 1}`}
                </button>
              ))}
            </div>
            {renderCodeEditor()}
            <button
              onClick={() => addArrayItem("codes", { language: "", code: "" })}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus size={16} /> Add Code Snippet
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button onClick={onCancel} className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600">Cancel</button>
            <button onClick={() => onSave(editedData)} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAlgorithmForm;

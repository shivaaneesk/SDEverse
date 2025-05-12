import { useState } from "react";
import { X, Plus } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import AlgorithmPreview from "./AlgorithmPreview";

const EditAlgorithmForm = ({ algorithm, onSave, onCancel }) => {
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
    codes: algorithm.codes || [],
  });

  const [preview, setPreview] = useState(false);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);

  const calculateEditorHeight = (code) => {
    const lines = code.split("\n").length;
    const lineHeight = 20;
    return lines * lineHeight + 40;
  };

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
    if (field === "codes") {
      setSelectedCodeIndex(updated.length - 1); // Set the selected code to the new one
    }
  };

  const removeArrayItem = (field, index) => {
    const updated = [...editedData[field]];
    updated.splice(index, 1);
    handleChange(field, updated);
    if (field === "codes" && index === selectedCodeIndex && index > 0) {
      setSelectedCodeIndex(index - 1);
    }
  };

  const handleSubmit = () => {
    onSave(editedData);
  };

  const renderInput = (label, value, onChange, multiline = false) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
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
    const currentCode = editedData.codes[selectedCodeIndex]?.code || "";
    const editorHeight = calculateEditorHeight(currentCode);

    return (
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Language (e.g., JavaScript)"
          value={editedData.codes[selectedCodeIndex].language}
          onChange={(e) => {
            const updated = [...editedData.codes];
            updated[selectedCodeIndex].language = e.target.value;
            handleChange("codes", updated);
          }}
          className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
        />

        <MonacoEditor
          height={editorHeight}
          language={editedData.codes[selectedCodeIndex].language}
          value={currentCode}
          onChange={(code) => {
            const updatedCodes = [...editedData.codes];
            updatedCodes[selectedCodeIndex] = {
              ...updatedCodes[selectedCodeIndex],
              code: code,
            };
            handleChange("codes", updatedCodes);
          }}
          theme="vs-dark"
        />

        <button
          onClick={() => removeArrayItem("codes", selectedCodeIndex)}
          className="text-red-500 hover:text-red-700 absolute top-0 right-0 p-2"
        >
          <X size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-8xl mx-auto px-6 py-10 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl space-y-10">
      <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700 pb-4">
        <button
          onClick={() => setPreview(false)}
          className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
            !preview
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
            preview
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          Preview
        </button>
      </div>

      {preview ? (
        <AlgorithmPreview algorithm={editedData} />
      ) : (
        <div className="space-y-8">
          {renderInput("Title", editedData.title, (val) =>
            handleChange("title", val)
          )}
          {renderInput(
            "Problem Statement",
            editedData.problemStatement,
            (val) => handleChange("problemStatement", val),
            true
          )}
          {renderInput(
            "Intuition",
            editedData.intuition,
            (val) => handleChange("intuition", val),
            true
          )}
          {renderInput(
            "Explanation",
            editedData.explanation,
            (val) => handleChange("explanation", val),
            true
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["time", "space"].map((key) => (
              <div className="space-y-2" key={key}>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                  {key} Complexity
                </label>
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Difficulty
            </label>
            <select
              value={editedData.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {["category", "tags", "links"].map((field) => (
            <div key={field} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {field}
              </label>
              <div className="space-y-3">
                {editedData[field].map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={(e) =>
                        updateArrayItem(field, i, e.target.value)
                      }
                      className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeArrayItem(field, i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem(field)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Add {field}
                </button>
              </div>
            </div>
          ))}

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Code Snippets
            </label>
            <div className="flex flex-wrap gap-2">
              {editedData.codes.map((code, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCodeIndex(index)}
                    className={`px-4 py-2 font-mono text-sm rounded-md transition-all ${
                      selectedCodeIndex === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {code.language || `Lang ${index + 1}`}
                  </button>
                  <button
                    onClick={() => removeArrayItem("codes", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
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

          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
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

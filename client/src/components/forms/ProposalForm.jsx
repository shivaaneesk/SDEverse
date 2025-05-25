import { useState, useEffect } from "react";
import { Trash2, Plus, ChevronDown } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import AlgorithmPreview from "../../pages/AlgorithmPreview";

const ProposalForm = ({ proposal = {}, onSave, categories }) => {
  const [editedData, setEditedData] = useState({
    title: proposal.title || "",
    problemStatement: proposal.problemStatement || "",
    intuition: proposal.intuition || "",
    explanation: proposal.explanation || "",
    complexity: proposal.complexity || { time: "", space: "" },
    difficulty: proposal.difficulty || "Easy",
    category: proposal.category || [],
    tags: proposal.tags || [],
    links: proposal.links || [],
    codes: proposal.codes?.length ? proposal.codes : [{ language: "", code: "" }],
  });

  useEffect(() => {
    onSave(editedData);
  }, [editedData,onSave]);

  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [mode, setMode] = useState("edit");

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
    <div className="space-y-2">
      <label className="block font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {multiline ? (
        <textarea
          className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          type="text"
          className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  const renderDropdown = (label, options, selected, setSelected, isOpen, setOpen) => (
    <div className="space-y-2">
      <label className="block font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative w-full md:w-[16rem]">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-4 py-2 text-left rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          {selected || `Select ${label.toLowerCase()}`}
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 max-h-48 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${selected === opt ? "font-semibold" : ""}`}
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
    <div className="max-w-7xl mx-auto px-6 py-10 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl space-y-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Proposal Form</h2>

      {/* Toggle Tabs */}
      <div className="flex justify-center mb-6 gap-4">
        {["edit", "preview"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMode(tab)}
            className={`px-6 py-2 rounded-t-xl border-b-2 ${
              mode === tab
                ? "border-blue-600 bg-white dark:bg-gray-800 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {mode === "edit" ? (
        <>
          {renderInput("Title", editedData.title, (val) => handleChange("title", val))}
          {renderInput("Problem Statement", editedData.problemStatement, (val) => handleChange("problemStatement", val), true)}
          {renderInput("Intuition", editedData.intuition, (val) => handleChange("intuition", val), true)}
          {renderInput("Explanation", editedData.explanation, (val) => handleChange("explanation", val), true)}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["time", "space"].map((key) => (
              <div key={key}>
                <label className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{key} Complexity</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
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

          {renderDropdown("Difficulty", ["Easy", "Medium", "Hard"], editedData.difficulty, (val) => handleChange("difficulty", val), showDifficultyDropdown, setShowDifficultyDropdown)}

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = editedData.category.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      handleChange("category", isSelected ? editedData.category.filter((c) => c !== cat) : [...editedData.category, cat])
                    }
                    className={`px-3 py-1 rounded-full border text-sm ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {["tags", "links"].map((field) => (
            <div key={field}>
              <div className="flex justify-between items-center">
                <label className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{field}</label>
                <button onClick={() => addArrayItem(field)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {editedData[field].map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={(e) => updateArrayItem(field, i, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                    />
                    <button onClick={() => removeArrayItem(field, i)} className="text-red-600 hover:text-red-800 p-2 rounded-full">
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
              <label className="font-semibold text-gray-700 dark:text-gray-300">Code Snippets</label>
              <button
                onClick={() => addArrayItem("codes", { language: "", code: "" })}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedData.codes.map((code, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCodeIndex(index)}
                  className={`px-4 py-2 font-mono rounded-xl ${
                    selectedCodeIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {code.language || `Lang ${index + 1}`}
                </button>
              ))}
            </div>

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
                className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
              />
              <MonacoEditor
                height={calculateEditorHeight(editedData.codes[selectedCodeIndex].code || "")}
                language={editedData.codes[selectedCodeIndex].language || "javascript"}
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
        </>
      ) : (
        <AlgorithmPreview algorithm={editedData} />
      )}
    </div>
  );
};

export default ProposalForm;

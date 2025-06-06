import { useState, useEffect } from "react";
import { Trash2, Plus, ChevronDown, Info } from "lucide-react";
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
  }, [editedData, onSave]);

  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [mode, setMode] = useState("edit");
  const [showInfo, setShowInfo] = useState(true);

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

  const calculateEditorHeight = (code) => Math.max(300, code.split("\n").length * 20 + 40);

  const renderInput = (label, value, onChange, multiline = false, placeholder = "") => (
    <div className="space-y-3 w-full">
      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="w-full p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const renderDropdown = (label, options, selected, setSelected, isOpen, setOpen) => (
    <div className="space-y-3 w-full">
      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpen(!isOpen)}
          className="w-full px-4 py-3 text-base text-left rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 flex items-center justify-between shadow-sm"
        >
          <span className="truncate">{selected || `Select ${label.toLowerCase()}`}</span>
          <ChevronDown className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} size={18} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-base hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selected === opt ? "bg-blue-50 dark:bg-blue-900/30 font-medium" : ""
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Algorithm Proposal</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">Submit a new algorithm to our platform</p>
            </div>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
            >
              <Info size={24} />
            </button>
          </div>
          
          {showInfo && (
            <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Info size={18} /> How to submit a great algorithm
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>Ensure your algorithm solves a common problem in computer science</li>
                <li>Provide clear explanations with step-by-step reasoning</li>
                <li>Include multiple implementations in different programming languages</li>
                <li>Add relevant complexity analysis and real-world applications</li>
                <li>Tag your algorithm with appropriate categories and difficulty level</li>
                <li>All submissions will be reviewed by our team before publishing</li>
              </ul>
            </div>
          )}
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          {["edit", "preview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-5 font-medium text-base ${
                mode === tab
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {mode === "edit" ? (
            <div className="space-y-8">
              {renderInput("Algorithm Title", editedData.title, 
                (val) => handleChange("title", val), 
                false,
                "e.g., Dijkstra's Shortest Path Algorithm"
              )}
              
              {renderInput("Problem Statement", editedData.problemStatement, 
                (val) => handleChange("problemStatement", val), 
                true,
                "Describe the problem this algorithm solves..."
              )}
              
              {renderInput("Intuition", editedData.intuition, 
                (val) => handleChange("intuition", val), 
                true,
                "Explain the core idea behind the solution..."
              )}
              
              {renderInput("Detailed Explanation", editedData.explanation, 
                (val) => handleChange("explanation", val), 
                true,
                "Provide step-by-step explanation with examples..."
              )}

              {/* Complexity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["time", "space"].map((key) => (
                  <div className="space-y-3" key={key}>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key} Complexity
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      value={editedData.complexity[key]}
                      placeholder={`O(...)`}
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
                "Difficulty Level",
                ["Easy", "Medium", "Hard"],
                editedData.difficulty,
                (val) => handleChange("difficulty", val),
                showDifficultyDropdown,
                setShowDifficultyDropdown
              )}

              {/* Categories */}
              <div className="space-y-3">
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Categories</label>
                <div className="flex flex-wrap gap-3">
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
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                <div key={field} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {field === "tags" ? "Related Tags" : "Reference Links"}
                    </label>
                    <button
                      onClick={() => addArrayItem(field)}
                      className="text-sm px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editedData[field].map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input
                          value={item}
                          onChange={(e) => updateArrayItem(field, i, e.target.value)}
                          className="flex-1 p-3 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          placeholder={
                            field === "tags" 
                              ? "e.g., graph, sorting, dynamic programming" 
                              : "https://..."
                          }
                        />
                        <button
                          onClick={() => removeArrayItem(field, i)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-full transition-colors"
                          aria-label={`Remove ${field.slice(0, -1)}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Code Snippets */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Code Implementations</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Add implementations in different programming languages
                    </p>
                  </div>
                  <button
                    onClick={() => addArrayItem("codes", { language: "", code: "" })}
                    className="text-sm px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <Plus size={16} /> Add Implementation
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {editedData.codes.map((code, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCodeIndex(index)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        selectedCodeIndex === index
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {code.language || `Implementation ${index + 1}`}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Programming Language (e.g., JavaScript, Python, C++)"
                      value={editedData.codes[selectedCodeIndex].language}
                      onChange={(e) => {
                        const updated = [...editedData.codes];
                        updated[selectedCodeIndex].language = e.target.value;
                        handleChange("codes", updated);
                      }}
                      className="flex-grow p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                    {editedData.codes.length > 1 && (
                      <button
                        onClick={() => removeArrayItem("codes", selectedCodeIndex)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-3 rounded-xl transition-colors bg-red-50 dark:bg-red-900/20"
                        aria-label="Remove code snippet"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                  
                  <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg">
                    <MonacoEditor
                      height={calculateEditorHeight(editedData.codes[selectedCodeIndex].code || "")}
                      language={editedData.codes[selectedCodeIndex].language.toLowerCase() || "javascript"}
                      value={editedData.codes[selectedCodeIndex].code}
                      onChange={(code) => {
                        const updated = [...editedData.codes];
                        updated[selectedCodeIndex].code = code;
                        handleChange("codes", updated);
                      }}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        wordWrap: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 20 },
                        suggestOnTriggerCharacters: true,
                        tabSize: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <AlgorithmPreview algorithm={editedData} />
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex justify-between">
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Auto-save enabled</span> - Drafts are saved automatically
            </div>
            <button 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-colors"
              onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            >
              {mode === "edit" ? "Preview Proposal" : "Continue Editing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalForm;
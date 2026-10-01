'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Question, Difficulty, GameMode, QuestionType } from '@/types/game';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Upload,
  FileSpreadsheet,
  BarChart3,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const {
    allQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestionsFromCsv,
    profile,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'questions' | 'new' | 'csv' | 'analytics'>('questions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formQuestion, setFormQuestion] = useState<Partial<Question>>({
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'Creation',
    level: 1,
    stage: 1,
    timeLimit: 15,
    xpReward: 120,
    points: 120,
    options: ['', '', '', ''],
  });

  // CSV Import State
  const [csvText, setCsvText] = useState<string>('');
  const [csvResult, setCsvResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  // Filter questions
  const filteredQuestions = allQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(allQuestions.map((q) => q.category)));

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.question || !formQuestion.correctAnswer || !formQuestion.reference) {
      alert('Please fill in required fields: Question text, Correct Answer, and Scripture Reference.');
      return;
    }

    if (editingQuestion) {
      updateQuestion({ ...editingQuestion, ...formQuestion } as Question);
      setEditingQuestion(null);
    } else {
      const newQ: Question = {
        id: `custom-${Date.now()}`,
        question: formQuestion.question!,
        type: formQuestion.type || 'multiple_choice',
        options: formQuestion.options?.filter(Boolean),
        correctAnswer: formQuestion.correctAnswer!,
        explanation: formQuestion.explanation || 'Scripture truth.',
        reference: formQuestion.reference!,
        translation: formQuestion.translation || 'NIV',
        difficulty: formQuestion.difficulty || 'medium',
        category: formQuestion.category || 'General',
        level: formQuestion.level || 1,
        stage: formQuestion.stage || 1,
        timeLimit: formQuestion.timeLimit || 15,
        xpReward: formQuestion.xpReward || 120,
        points: formQuestion.points || 120,
      };
      addQuestion(newQ);
    }

    setFormQuestion({
      type: 'multiple_choice',
      difficulty: 'medium',
      category: 'Creation',
      level: 1,
      stage: 1,
      timeLimit: 15,
      xpReward: 120,
      points: 120,
      options: ['', '', '', ''],
    });
    setActiveTab('questions');
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestion(q);
    setFormQuestion(q);
    setActiveTab('new');
  };

  const handleCsvImport = () => {
    const res = importQuestionsFromCsv(csvText);
    setCsvResult(res);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* ADMIN HEADER */}
      <div className="game-panel rounded-3xl p-6 relative overflow-hidden border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Return to Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-black text-white">Teacher & Admin Portal</h1>
            </div>
            <p className="text-xs text-slate-300">
              Manage question database, assign level stages, import CSV question batches, and analyze gameplay.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-1.5 bg-[#0e172a] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('questions');
              setEditingQuestion(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'questions' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Bank ({allQuestions.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('new');
              setEditingQuestion(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'new' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'csv' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV Import
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>
      </div>

      {/* TAB 1: QUESTION BANK LIST */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by question text, reference (e.g. Genesis 1:1), or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* QUESTIONS TABLE */}
          <div className="space-y-2.5">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-[#121c32] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Lvl {q.level} • Stg {q.stage}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      {q.reference}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                  <p className="text-xs text-slate-400">
                    Correct: <strong className="text-emerald-400">{String(q.correctAnswer)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleEditClick(q)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this question?')) deleteQuestion(q.id);
                    }}
                    className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white transition border border-red-500/30"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADD / EDIT QUESTION FORM */}
      {activeTab === 'new' && (
        <form onSubmit={handleSaveQuestion} className="game-panel rounded-3xl p-6 sm:p-8 space-y-5 text-left border border-slate-800">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            {editingQuestion ? 'Edit Question' : 'Create New Scripture Question'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Level Assignment</label>
              <select
                value={formQuestion.level}
                onChange={(e) => setFormQuestion({ ...formQuestion, level: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                  <option key={l} value={l}>
                    Level {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Stage (1-9)</label>
              <input
                type="number"
                min="1"
                max="9"
                value={formQuestion.stage}
                onChange={(e) => setFormQuestion({ ...formQuestion, stage: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Difficulty</label>
              <select
                value={formQuestion.difficulty}
                onChange={(e) => setFormQuestion({ ...formQuestion, difficulty: e.target.value as Difficulty })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Question / Prompt Text *</label>
            <textarea
              rows={3}
              required
              value={formQuestion.question || ''}
              onChange={(e) => setFormQuestion({ ...formQuestion, question: e.target.value })}
              placeholder="e.g. Which king built the first temple in Jerusalem?"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* OPTIONS */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-300 block">Multiple Choice Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((optIdx) => (
                <input
                  key={optIdx}
                  type="text"
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                  value={formQuestion.options?.[optIdx] || ''}
                  onChange={(e) => {
                    const opts = [...(formQuestion.options || ['', '', '', ''])];
                    opts[optIdx] = e.target.value;
                    setFormQuestion({ ...formQuestion, options: opts });
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Exact Correct Answer *</label>
              <input
                type="text"
                required
                placeholder="Must match correct option text exactly"
                value={String(formQuestion.correctAnswer || '')}
                onChange={(e) => setFormQuestion({ ...formQuestion, correctAnswer: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-xs font-bold text-emerald-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Scripture Reference *</label>
              <input
                type="text"
                required
                placeholder="e.g. 1 Kings 6:1"
                value={formQuestion.reference || ''}
                onChange={(e) => setFormQuestion({ ...formQuestion, reference: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Historical & Scripture Context / Explanation</label>
            <textarea
              rows={2}
              value={formQuestion.explanation || ''}
              onChange={(e) => setFormQuestion({ ...formQuestion, explanation: e.target.value })}
              placeholder="Provide historical details, cross-references, or theological context..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              {editingQuestion ? 'Update Question' : 'Save Question to Bank'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CSV IMPORT */}
      {activeTab === 'csv' && (
        <div className="game-panel rounded-3xl p-6 sm:p-8 space-y-5 text-left border border-slate-800">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              Batch CSV Question Importer
            </h3>
            <p className="text-xs text-slate-300">
              Paste standard CSV rows. Format: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">question, optionA, optionB, optionC, optionD, correctAnswer, explanation, reference, category, difficulty, level, stage</code>
            </p>
          </div>

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`question,optionA,optionB,optionC,optionD,correctAnswer,explanation,reference,category,difficulty,level,stage
"Who was swallowed by a great fish?","Daniel","Jonah","Moses","Elijah","Jonah","Jonah prayed from the fish","Jonah 1:17","Prophets","easy",4,3`}
            className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none"
          />

          <button
            onClick={handleCsvImport}
            disabled={!csvText.trim()}
            className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary flex items-center gap-2 disabled:opacity-40"
          >
            <Upload className="w-4 h-4" />
            Validate & Import CSV
          </button>

          {csvResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Import Report: {csvResult.successCount} Questions Successfully Imported
              </h4>
              {csvResult.errors.length > 0 && (
                <ul className="text-[11px] text-red-400 space-y-0.5 list-disc pl-4">
                  {csvResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Questions</span>
              <span className="text-2xl font-black text-white">{allQuestions.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Categories</span>
              <span className="text-2xl font-black text-amber-400">{categories.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Lifetime Answers</span>
              <span className="text-2xl font-black text-blue-400">{profile.stats.totalQuestionsAnswered}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Accuracy</span>
              <span className="text-2xl font-black text-emerald-400">
                {profile.stats.totalQuestionsAnswered > 0
                  ? Math.round((profile.stats.correctAnswers / profile.stats.totalQuestionsAnswered) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

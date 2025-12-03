import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, Topic, ContentData, AppState, QuizQuestion } from './types';
import * as GeminiService from './services/geminiService';
import { useSoundEffects } from './components/SoundManager';
import { 
    BookOpen, 
    Video, 
    Award, 
    ArrowRight, 
    Search, 
    Atom, 
    Microscope, 
    ArrowLeft,
    CheckCircle,
    XCircle,
    RotateCcw,
    Moon,
    Sun,
    Share2,
    FlaskConical,
    Copy,
    Check,
    Key,
    Download
} from 'lucide-react';

// --- Constants & Data ---

const GRADES: GradeLevel[] = [
    { 
        id: '3', 
        label: "כיתה ג'", 
        color: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-200',
        cardTheme: 'bg-green-50 border-green-200 hover:border-green-400 dark:bg-green-900/20 dark:border-green-800 dark:hover:border-green-600'
    },
    { 
        id: '4', 
        label: "כיתה ד'", 
        color: 'bg-lime-100 border-lime-300 text-lime-800 dark:bg-lime-900/40 dark:border-lime-800 dark:text-lime-200',
        cardTheme: 'bg-lime-50 border-lime-200 hover:border-lime-400 dark:bg-lime-900/20 dark:border-lime-800 dark:hover:border-lime-600'
    },
    { 
        id: '5', 
        label: "כיתה ה'", 
        color: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-200',
        cardTheme: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800 dark:hover:border-emerald-600'
    },
    { 
        id: '6', 
        label: "כיתה ו'", 
        color: 'bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900/40 dark:border-teal-800 dark:text-teal-200',
        cardTheme: 'bg-teal-50 border-teal-200 hover:border-teal-400 dark:bg-teal-900/20 dark:border-teal-800 dark:hover:border-teal-600'
    },
    { 
        id: '7', 
        label: "כיתה ז'", 
        color: 'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900/40 dark:border-cyan-800 dark:text-cyan-200',
        cardTheme: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400 dark:bg-cyan-900/20 dark:border-cyan-800 dark:hover:border-cyan-600'
    },
    { 
        id: '8', 
        label: "כיתה ח'", 
        color: 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/40 dark:border-sky-800 dark:text-sky-200',
        cardTheme: 'bg-sky-50 border-sky-200 hover:border-sky-400 dark:bg-sky-900/20 dark:border-sky-800 dark:hover:border-sky-600'
    },
    { 
        id: '9', 
        label: "כיתה ט'", 
        color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-200',
        cardTheme: 'bg-blue-50 border-blue-200 hover:border-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:border-blue-600'
    },
    { 
        id: '10', 
        label: "כיתה י'", 
        color: 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-200',
        cardTheme: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800 dark:hover:border-indigo-600'
    },
    { 
        id: '11', 
        label: "כיתה יא'", 
        color: 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/40 dark:border-violet-800 dark:text-violet-200',
        cardTheme: 'bg-violet-50 border-violet-200 hover:border-violet-400 dark:bg-violet-900/20 dark:border-violet-800 dark:hover:border-violet-600'
    },
    { 
        id: '12', 
        label: "כיתה יב'", 
        color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:border-fuchsia-800 dark:text-fuchsia-200',
        cardTheme: 'bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-400 dark:bg-fuchsia-900/20 dark:border-fuchsia-800 dark:hover:border-fuchsia-600'
    },
];

// --- Sub-Components ---

const ShareButton = ({ 
    title, 
    text, 
    className = "", 
    iconSize = 20, 
    showLabel = false,
    label = "שתף"
}: { 
    title: string, 
    text: string, 
    className?: string, 
    iconSize?: number,
    showLabel?: boolean,
    label?: string
}) => {
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
    const { playSuccess } = useSoundEffects();

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling if inside a card
        
        const shareData = {
            title: title,
            text: text,
            url: window.location.href, 
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
             try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                playSuccess();
                setShareStatus('copied');
                setTimeout(() => setShareStatus('idle'), 2000);
             } catch (err) {
                alert('שגיאה בהעתקה ללוח');
             }
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 transition-colors relative focus:outline-none ${className}`}
            title="שתף"
        >
            {shareStatus === 'copied' ? <Check size={iconSize} /> : <Share2 size={iconSize} />}
            {showLabel && (
                <span>
                    {shareStatus === 'copied' ? 'הועתק ללוח!' : label}
                </span>
            )}
            {shareStatus === 'copied' && !showLabel && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs bg-gray-800 text-white px-2 py-1 rounded shadow whitespace-nowrap z-10">
                    הועתק!
                </div>
            )}
        </button>
    );
};

const Header = ({ 
    currentGrade, 
    onHome, 
    points,
    isDarkMode,
    onToggleDarkMode
}: { 
    currentGrade: GradeLevel | null, 
    onHome: () => void, 
    points: number,
    isDarkMode: boolean,
    onToggleDarkMode: () => void
}) => (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={onHome}>
                <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg text-white group-hover:rotate-12 transition-transform duration-300">
                    <Atom size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-cartoon animate-fade-in-up">
                        SciTech IL - מדעים וטכנולוגיה
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <button
                    onClick={onToggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={isDarkMode ? "מצב יום" : "מצב לילה"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <ShareButton 
                    title="SciTech IL" 
                    text="פלטפורמת לימוד אינטראקטיבית למדעים וטכנולוגיה"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                />

                {currentGrade && (
                    <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-sm font-medium ${currentGrade.color}`}>
                        {currentGrade.label}
                    </span>
                )}
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-700">
                    <Award size={16} />
                    <span className="font-bold">{points}</span>
                </div>
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 py-8 mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Microscope className="text-blue-400" />
                <span className="text-lg font-semibold text-white">SciTech IL</span>
            </div>
            <p className="text-sm mb-2">(C) Noam Gold AI 2025 (v2.0 Static)</p>
            <p className="text-sm">
                Send Feedback: <a href="mailto:gold.noam@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">gold.noam@gmail.com</a>
            </p>
        </div>
    </footer>
);

const GradeSelector = ({ onSelect }: { onSelect: (grade: GradeLevel) => void }) => (
    <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100 transition-colors duration-300 animate-fade-in-up">בחר את הכיתה שלך</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {GRADES.map((grade) => (
                <button
                    key={grade.id}
                    onClick={() => onSelect(grade)}
                    className={`${grade.color} h-32 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-white/50 dark:hover:border-gray-400/50`}
                >
                    <span className="text-2xl font-bold">{grade.label}</span>
                    <ArrowLeft size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
        </div>
    </div>
);

const TopicExplorer = ({ 
    topics, 
    loading, 
    onSelect,
    currentGrade
}: { 
    topics: Topic[], 
    loading: boolean, 
    onSelect: (topic: Topic) => void,
    currentGrade: GradeLevel
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { playSuccess } = useSoundEffects();

    const filteredTopics = topics.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownloadPdf = (e: React.MouseEvent, topicTitle: string) => {
        e.stopPropagation();
        playSuccess();
        // Simulate PDF download
        alert(`מוריד קובץ PDF עבור הנושא: ${topicTitle} (הדמיה)`);
    };

    return (
        <div className="animate-fade-in-up">
            <div className="max-w-xl mx-auto mb-8 relative">
                <input
                    type="text"
                    placeholder="חפש נושא..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <Search className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map((topic) => (
                        <div 
                            key={topic.id} 
                            onClick={() => onSelect(topic)}
                            className={`${currentGrade.cardTheme} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col`}
                        >
                            {/* AI Generated Image Placeholder via Pollinations */}
                            <div className="h-40 w-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                                <img 
                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(topic.visualPrompt || topic.title)}?width=400&height=200&nologo=true&seed=${topic.id}`}
                                    alt={topic.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-2xl">
                                    {topic.icon || '🧪'}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:opacity-80 transition-opacity animate-fade-in-up">
                                        {topic.title}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleDownloadPdf(e, topic.title)}
                                            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors shrink-0 mt-1"
                                            title="הורד PDF"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <ShareButton 
                                            title={topic.title} 
                                            text={topic.description} 
                                            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shrink-0 mt-1" 
                                            iconSize={18} 
                                        />
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed opacity-90 line-clamp-3">
                                    {topic.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && filteredTopics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 animate-fade-in text-gray-500 dark:text-gray-400">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                        <Search size={32} />
                    </div>
                    <p className="text-lg font-medium">לא נמצאו נושאים התואמים את החיפוש "{searchTerm}"</p>
                    <p className="text-sm opacity-75">נסה לחפש מילות מפתח אחרות</p>
                </div>
            )}
        </div>
    );
};

const QuizComponent = ({ 
    questions, 
    onComplete 
}: { 
    questions: QuizQuestion[], 
    onComplete: (score: number) => void 
}) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const { playCorrect, playIncorrect } = useSoundEffects();

    const handleOptionSelect = (index: number) => {
        if (showExplanation) return;
        setSelectedOption(index);
        setShowExplanation(true);
        
        if (index === questions[currentQIndex].correctIndex) {
            playCorrect();
            setScore(prev => prev + 10);
        } else {
            playIncorrect();
        }
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setFinished(true);
            onComplete(score);
        }
    };

    if (finished) {
        return (
            <div className="text-center py-10 animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">🏆</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100 animate-fade-in-up">כל הכבוד!</h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">צברת {score} נקודות בחידון זה.</p>
                <button 
                    onClick={() => {
                        setFinished(false);
                        setCurrentQIndex(0);
                        setScore(0);
                        setSelectedOption(null);
                        setShowExplanation(false);
                    }}
                    className="flex items-center gap-2 mx-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                    <RotateCcw size={20} />
                    נסה שוב
                </button>
            </div>
        );
    }

    const question = questions[currentQIndex];

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">שאלה {currentQIndex + 1} מתוך {questions.length}</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{score} נקודות</span>
            </div>
            
            <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-100 animate-fade-in-up">{question.question}</h3>

            <div className="space-y-3">
                {question.options.map((option, idx) => {
                    let className = "w-full p-4 text-right rounded-xl border-2 transition-all ";
                    if (showExplanation) {
                        if (idx === question.correctIndex) {
                            className += "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200";
                        } else if (idx === selectedOption) {
                            className += "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-200";
                        } else {
                            className += "border-gray-100 dark:border-gray-700 opacity-50 dark:text-gray-400";
                        }
                    } else {
                        className += "border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={showExplanation}
                            className={className}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showExplanation && idx === question.correctIndex && <CheckCircle size={20} className="text-green-600 dark:text-green-400" />}
                                {showExplanation && idx === selectedOption && idx !== question.correctIndex && <XCircle size={20} className="text-red-600 dark:text-red-400" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showExplanation && (
                <div className="mt-6 animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200 mb-4">
                        <strong>הסבר: </strong> {question.explanation}
                    </div>
                    <button
                        onClick={handleNext}
                        className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {currentQIndex < questions.length - 1 ? 'השאלה הבאה' : 'סיים חידון'}
                        <ArrowLeft size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

const ContentViewer = ({ 
    topic, 
    grade, 
    onBack,
    onQuizComplete
}: { 
    topic: Topic, 
    grade: GradeLevel, 
    onBack: () => void,
    onQuizComplete: (points: number) => void
}) => {
    const [content, setContent] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'learn' | 'demo' | 'quiz'>('learn');

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            const data = await GeminiService.fetchContentForTopic(topic.title, grade.label);
            setContent(data);
            setLoading(false);
        };
        loadContent();
    }, [topic, grade]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 min-h-[500px]">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                </div>

                {/* Intro Card Skeleton */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-r-4 border-gray-200 dark:border-gray-700">
                     <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                     <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                     </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-3">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-36"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-36"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-36"></div>
                </div>

                {/* Tab Content Skeleton */}
                <div className="bg-white dark:bg-gray-800 h-64 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"></div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 dark:text-red-400">לא נמצא תוכן לנושא זה.</p>
                <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">חזור לרשימה</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <ArrowRight size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in-up">{topic.title}</h2>
                </div>
                
                <ShareButton 
                    title={`SciTech IL - ${topic.title}`}
                    text={`אני לומד על ${topic.title} (${grade.label}) באתר SciTech IL!`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    showLabel={true}
                    label="שתף נושא"
                />
            </div>

            {/* Introduction Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-8 border-r-4 border-blue-500 transition-colors duration-300">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 animate-fade-in-up">מבט מדעי</h3>
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {content.introduction}
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { id: 'learn', label: 'העשרה וסרטונים', icon: <Video size={18} /> },
                    { id: 'demo', label: 'הדגמה', icon: <FlaskConical size={18} /> },
                    { id: 'quiz', label: 'חידון', icon: <BookOpen size={18} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'learn' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white animate-fade-in-up">
                            <Video className="text-red-500" />
                            סרטונים מומלצים
                        </h3>
                        <div className="grid gap-4">
                            {content.youtubeQueries.map((query, idx) => (
                                <a 
                                    key={idx}
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                                >
                                    <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                        <Video size={24} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-red-700 dark:group-hover:text-red-400">חפש ביוטיוב:</div>
                                        <div className="text-gray-600 dark:text-gray-400">{query}</div>
                                    </div>
                                    <ArrowLeft className="mr-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'demo' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-up">{content.demonstration.title}</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed mb-6">
                                    {content.demonstration.description}
                                </p>
                            </div>
                            <div className="w-full md:w-1/3">
                                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                     {/* Use pollinations for demo image as well */}
                                     <img 
                                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(content.demonstration.visualPrompt)}?width=400&height=400&nologo=true`}
                                        alt={content.demonstration.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <QuizComponent 
                        questions={content.quiz} 
                        onComplete={onQuizComplete}
                    />
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    const [appState, setAppState] = useState<AppState>(AppState.SELECT_GRADE);
    const [currentGrade, setCurrentGrade] = useState<GradeLevel | null>(null);
    const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);
    
    // Dark mode state with persistence
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('darkMode');
            if (savedMode !== null) {
                return savedMode === 'true';
            }
            if (window.matchMedia) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(isDarkMode));
    }, [isDarkMode]);

    const handleGradeSelect = async (grade: GradeLevel) => {
        setCurrentGrade(grade);
        setAppState(AppState.SELECT_TOPIC);
        setLoadingTopics(true);
        const fetchedTopics = await GeminiService.fetchTopicsForGrade(grade.label);
        setTopics(fetchedTopics);
        setLoadingTopics(false);
    };

    const handleTopicSelect = (topic: Topic) => {
        setCurrentTopic(topic);
        setAppState(AppState.VIEW_CONTENT);
    };

    const handleHome = () => {
        setAppState(AppState.SELECT_GRADE);
        setCurrentGrade(null);
        setCurrentTopic(null);
        setTopics([]);
    };

    const handleBackToTopics = () => {
        setAppState(AppState.SELECT_TOPIC);
        setCurrentTopic(null);
    };

    const handleQuizPoints = (points: number) => {
        setTotalPoints(prev => prev + points);
    };

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header 
                currentGrade={currentGrade} 
                onHome={handleHome} 
                points={totalPoints}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {appState === AppState.SELECT_GRADE && (
                    <GradeSelector onSelect={handleGradeSelect} />
                )}

                {appState === AppState.SELECT_TOPIC && currentGrade && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <button 
                                onClick={handleHome}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <ArrowRight size={24} />
                            </button>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white animate-fade-in-up">נושאי לימוד - {currentGrade.label}</h2>
                        </div>
                        <TopicExplorer 
                            topics={topics} 
                            loading={loadingTopics} 
                            onSelect={handleTopicSelect}
                            currentGrade={currentGrade}
                        />
                    </>
                )}

                {appState === AppState.VIEW_CONTENT && currentGrade && currentTopic && (
                    <ContentViewer 
                        topic={currentTopic} 
                        grade={currentGrade} 
                        onBack={handleBackToTopics}
                        onQuizComplete={handleQuizPoints}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}
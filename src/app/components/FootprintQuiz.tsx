import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateQuizScore, calculateLiteracyScore, LiteracyResponse, DimensionScore } from '../utils/literacyScorer';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { LiteracyRadarChart } from './LiteracyRadarChart'; // New Import
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { quizQuestions } from "../data/quizQuestions";

interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
}

interface QuizResults {
  grade: string;
  percentage: number;
  feedback: string;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  answers: QuizAnswer[];
  dimensionScores: DimensionScore[]; // Added to store radar data
  gaps: string[];
  recommendations: string[];
}

export function FootprintQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useLocalStorage<QuizResults | null>('footprint_quiz_results', null);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const existingAnswerIndex = quizAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (existingAnswerIndex > -1) {
      const updatedAnswers = [...quizAnswers];
      updatedAnswers[existingAnswerIndex] = {
        questionId: currentQuestion.id,
        selectedAnswer,
        correct: isCorrect
      };
      setQuizAnswers(updatedAnswers);
    } else {
      setQuizAnswers([...quizAnswers, {
        questionId: currentQuestion.id,
        selectedAnswer,
        correct: isCorrect
      }]);
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Logic Fix: Calculate literacy dimensions based on final answers
      const literacyResponses: LiteracyResponse[] = quizAnswers.map(a => ({
        id: a.questionId,
        value: a.correct ? 1 : 0 // Quiz uses binary 0/1 logic
      }));

      const literacyData = calculateLiteracyScore(literacyResponses, quizQuestions);
      const totalCorrect = quizAnswers.filter(a => a.correct).length;
      const performance = calculateQuizScore(totalCorrect, quizQuestions.length);
      
      setQuizResults({
        ...performance,
        ...literacyData,
        correctAnswers: totalCorrect,
        totalQuestions: quizQuestions.length,
        completedAt: new Date().toISOString(),
        answers: quizAnswers
      });
      
      setQuizComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevAnswer = quizAnswers.find(a => a.questionId === quizQuestions[currentQuestionIndex - 1].id);
      if (prevAnswer) {
        setSelectedAnswer(prevAnswer.selectedAnswer);
        setShowExplanation(true);
      } else {
        setSelectedAnswer(null);
        setShowExplanation(false);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizAnswers([]);
    setQuizComplete(false);
  };

  // Results View
  if (quizComplete && quizResults) {
    const gradeColors: Record<string, string> = {
      'A': 'text-green-600', 'B': 'text-blue-600', 'C': 'text-yellow-600',
      'D': 'text-orange-600', 'F': 'text-red-600'
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Brain className="mr-2 h-8 w-8 text-blue-600" />
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-7xl font-bold mb-2 ${gradeColors[quizResults.grade] || 'text-gray-600'}`}>
                {quizResults.grade}
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-2">
                {quizResults.percentage}%
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto italic">
                "{quizResults.feedback}"
              </p>
            </div>

            {/* Radar Chart & Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <LiteracyRadarChart data={quizResults.dimensionScores} />
              
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">Strengths & Gaps</h3>
                <div className="space-y-2">
                  {quizResults.gaps.length > 0 ? quizResults.gaps.map((gap, i) => (
                    <div key={i} className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {gap}
                    </div>
                  )) : (
                    <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                      Excellent coverage across all privacy dimensions!
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Proficiency</span>
                    <span>UK Avg: 58%</span>
                  </div>
                  <Progress value={quizResults.percentage} className="h-3" />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-blue-900 font-bold mb-3 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" /> Personalized Next Steps
              </h3>
              <ul className="space-y-2">
                {quizResults.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start">
                    <span className="mr-2">•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={restartQuiz} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/education'}>
                Explore Education Center
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Review Section */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizQuestions.map((question, index) => {
              const answer = quizResults.answers.find(a => a.questionId === question.id);
              const isCorrect = answer?.correct;

              return (
                <div key={question.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start mb-2">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 mr-2" /> : <XCircle className="h-5 w-5 text-red-600 mr-2" />}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{index + 1}. {question.question}</p>
                      <p className="text-sm mt-1 italic text-gray-600">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz In-Progress View (Remaining the same)
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Literacy Quiz</h1>
        <p className="text-gray-600">Test your knowledge of UK GDPR, digital footprints, and data rights.</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span className="font-medium">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200">
        <CardHeader>
          <div className="text-sm text-blue-600 font-medium mb-1">{currentQuestion.category}</div>
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => !showExplanation && handleAnswerSelect(parseInt(v))}>
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => !showExplanation && handleAnswerSelect(index)}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                } ${showExplanation && index === currentQuestion.correctAnswer ? 'border-green-500 bg-green-50' : ''}`}
              >
                <RadioGroupItem value={index.toString()} id={`opt-${index}`} disabled={showExplanation} />
                <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          {showExplanation && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <p className="text-sm text-blue-800 leading-relaxed"><span className="font-bold">Explanation:</span> {currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="ghost" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>

            {!showExplanation ? (
              <Button onClick={handleCheckAnswer} disabled={selectedAnswer === null}>Check Answer</Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "See Results"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
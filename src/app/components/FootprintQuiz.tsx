import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateQuizScore } from '../utils/literacyScorer';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import quizQuestions from '../data/quizQuestions.json';

interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
}

export function FootprintQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useLocalStorage('footprint_quiz_results', null);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(false);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setQuizAnswers([...quizAnswers, {
      questionId: currentQuestion.id,
      selectedAnswer,
      correct: isCorrect
    }]);
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      const correctAnswers = quizAnswers.filter(a => a.correct).length + 
        (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
      
      const results = calculateQuizScore(correctAnswers, quizQuestions.length);
      setQuizResults({
        ...results,
        correctAnswers,
        totalQuestions: quizQuestions.length,
        completedAt: new Date().toISOString(),
        answers: [...quizAnswers, {
          questionId: currentQuestion.id,
          selectedAnswer,
          correct: selectedAnswer === currentQuestion.correctAnswer
        }]
      });
      
      setQuizComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Remove the last answer
      setQuizAnswers(quizAnswers.slice(0, -1));
      setSelectedAnswer(null);
      setShowExplanation(false);
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
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
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
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-7xl font-bold mb-2 ${gradeColors[quizResults.grade]}`}>
                {quizResults.grade}
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-2">
                {quizResults.percentage}%
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto">
                {quizResults.feedback}
              </p>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Your Score</span>
                <span>UK Average: 58%</span>
              </div>
              <Progress value={quizResults.percentage} className="h-3" />
            </div>

            {/* Category Breakdown */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Factual Knowledge', 'Data Protection Skills', 'Reflection Abilities', 'Critical Literacy'].map(category => {
                    const categoryQuestions = quizQuestions.filter(q => q.category === category);
                    const categoryAnswers = quizResults.answers.filter((a: any) => {
                      const question = quizQuestions.find(q => q.id === a.questionId);
                      return question?.category === category;
                    });
                    const categoryCorrect = categoryAnswers.filter((a: any) => a.correct).length;
                    const categoryPercent = categoryQuestions.length > 0 
                      ? Math.round((categoryCorrect / categoryQuestions.length) * 100)
                      : 0;

                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900">{category}</span>
                          <span className="text-gray-600">
                            {categoryCorrect}/{categoryQuestions.length} ({categoryPercent}%)
                          </span>
                        </div>
                        <Progress value={categoryPercent} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={restartQuiz} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/education'}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Improve with Education
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Review your answers and learn from mistakes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizQuestions.map((question, index) => {
              const answer = quizResults.answers.find((a: any) => a.questionId === question.id);
              const isCorrect = answer?.correct;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {index + 1}. {question.question}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Your answer:</strong> {question.options[answer?.selectedAnswer]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mt-1">
                          <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-7 text-sm text-gray-600 italic">
                    {question.explanation}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz In Progress
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Literacy Quiz</h1>
        <p className="text-gray-600">
          Test your knowledge of privacy concepts, UK GDPR, and digital security.
        </p>
      </div>

      {/* Progress */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span className="font-medium">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <div className="text-sm text-blue-600 font-medium mb-2">
            {currentQuestion.category}
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                } ${
                  showExplanation && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer
                    ? 'border-red-500 bg-red-50'
                    : ''
                }`}
                onClick={() => !showExplanation && handleAnswerSelect(index)}
              >
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                  disabled={showExplanation}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
                {showExplanation && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </RadioGroup>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <p className="text-sm font-medium text-blue-900 mb-1">Explanation</p>
              <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || showExplanation}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {!showExplanation ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    See Results
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import {
  ArrowLeft,
  Check,
  X,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const QuizReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const quiz = location.state;

  const questions = [
    {
      id: 1,
      question: "Qual estrutura bombeia sangue para o corpo?",
      selected: "Ventrículo esquerdo",
      correct: "Ventrículo esquerdo",
      explanation:
        "O ventrículo esquerdo é responsável por bombear sangue oxigenado para todo o corpo.",
      isCorrect: true,
    },
    {
      id: 2,
      question: "Qual vaso leva sangue ao pulmão?",
      selected: "Aorta",
      correct: "Artéria pulmonar",
      explanation:
        "A artéria pulmonar transporta sangue venoso do coração aos pulmões.",
      isCorrect: false,
    },
    {
      id: 3,
      question: "Qual vaso leva sangue ao pulmão?",
      selected: "Aorta",
      correct: "Artéria pulmonar",
      explanation:
        "A artéria pulmonar transporta sangue venoso do coração aos pulmões.",
      isCorrect: false,
    },
    {
      id: 4,
      question: "Qual vaso leva sangue ao pulmão?",
      selected: "Aorta",
      correct: "Artéria pulmonar",
      explanation:
        "A artéria pulmonar transporta sangue venoso do coração aos pulmões.",
      isCorrect: false,
    },
    {
      id: 5,
      question: "Qual vaso leva sangue ao pulmão?",
      selected: "Aorta",
      correct: "Artéria pulmonar",
      explanation:
        "A artéria pulmonar transporta sangue venoso do coração aos pulmões.",
      isCorrect: false,
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-[#FFFFFE] px-4 py-5 md:px-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 flex h-10 w-10 items-center justify-center text-[#00214D] transition hover:opacity-70 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-[#00214D] md:text-2xl">
              {quiz.title}
            </h1>

            <p className="text-sm text-[#1B2D45]/60">
              {quiz.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center justify-between gap-3 p-3 md:gap-16 md:p-5">
        {/* Data */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#00EBC7]/10 p-2 md:p-3">
            <CalendarDays className="h-4 w-4 text-[#00A991] md:h-6 md:w-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#00214D]">
              {quiz.date}
            </p>

            <p className="text-xs text-[#1B2D45]/60">
              {quiz.hour}
            </p>
          </div>
        </div>

        {/* Aproveitamento */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00EBC7]/10 text-sm font-bold text-[#00A991]">
            {quiz.accuracy}%
          </div>

          <div>
            <p className="text-sm text-[#1B2D45]/60">
              Desempenho
            </p>

            <p className="text-2xl font-bold text-[#00A991]">
              {quiz.accuracy}%
            </p>
          </div>
        </div>

        {/* Acertos */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#00EBC7]/10 p-2 md:p-3">
            <Check className="h-4 w-4 text-[#00A991] md:h-6 md:w-6" />
          </div>

          <div>
            <p className="text-sm text-[#1B2D45]/60">
              Acertos
            </p>

            <p className="font-bold text-[#00214D]">
              10 de 12
            </p>
          </div>
        </div>

        {/* Erros */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#FF5470]/10 p-2 md:p-3">
            <X className="h-4 w-4 text-[#FF5470] md:h-6 md:w-6" />
          </div>

          <div>
            <p className="text-sm text-[#1B2D45]/60">
              Erros
            </p>

            <p className="font-bold text-[#00214D]">
              2 de 12
            </p>
          </div>
        </div>
      </div>
      {/* Questions */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm max-h-[550px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="rounded-2xl border border-[#E5E7EB] p-4 transition-all duration-200 hover:border-[#C9D2FF] hover:shadow-sm md:p-5">
              <div className="flex items-start justify-between">
                {/* Left */}
                <div className="flex flex-1 gap-3 md:gap-4">
                  {/* Number */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${question.isCorrect
                      ? "bg-[#00A991]"
                      : "bg-[#FF5470]"
                      }`}
                  >
                    {question.id}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#00214D] md:text-base">
                      {question.question}
                    </h3>

                    <p className="text-xs text-[#1B2D45]/70 md:text-sm">
                      Sua resposta:{" "}
                      <span
                        className={
                          question.isCorrect
                            ? "font-medium text-[#00A991]"
                            : "font-medium text-[#FF5470]"
                        }
                      >
                        {question.selected}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-[#1B2D45]/70">
                      Resposta correta:{" "}
                      <span className="font-medium text-[#00A991]">
                        {question.correct}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-2xl px-3 py-2 text-xs font-medium md:px-4 md:text-sm ${question.isCorrect
                      ? "bg-[#00EBC7]/10 text-[#00A991]"
                      : "bg-[#FF5470]/10 text-[#FF5470]"
                      }`}
                  >
                    {question.isCorrect ? "Acertou" : "Errou"}
                  </div>

                  <button
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === question.id
                          ? null
                          : question.id
                      )
                    }
                    className="cursor-pointer text-[#00214D] transition-transform duration-200"
                  >
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {expandedQuestion === question.id && (
                <div className="mt-5 border-t border-[#E5E7EB] pt-4 transition-all duration-200">
                  <p className="mb-2 text-sm font-semibold text-[#00214D]">
                    Explicação
                  </p>

                  <p className="text-sm leading-5 text-[#1B2D45]/70">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center md:justify-end">
        <button
          onClick={() => navigate(-1)}
          className="rounded-2xl bg-[#00EBC7] px-8 py-4 font-semibold text-[#00214D] transition hover:brightness-95 cursor-pointer hover:scale-[1.02]
active:scale-[0.98]"
        >
          Retornar
        </button>
      </div>
    </main>
  );
};
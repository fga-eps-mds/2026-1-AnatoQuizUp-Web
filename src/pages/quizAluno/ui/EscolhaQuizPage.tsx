import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, HeartPulse, Bone, ArrowLeft, Shuffle, ChevronRight, CheckCircle2 } from 'lucide-react';

const DIFICULDADES = [
  { id: 'FACIL', titulo: 'Fácil', desc: 'Questões diretas para fixar o conteúdo.', tag: 'Iniciantes', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'MEDIO', titulo: 'Médio', desc: 'Questões intermediárias para reforçar.', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'DIFICIL', titulo: 'Difícil', desc: 'Questões desafiadoras para avançar.', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
];

const TEMAS = [
  { id: 'neuro', titulo: 'Neuroanatomia', desc: 'Sistema nervoso e estruturas relacionadas.', icon: <Brain className="w-10 h-10 text-[#00E5FF]" />, qtd: 100 },
  { id: 'torax', titulo: 'Tórax', desc: 'Coração, pulmão, grandes vasos.', icon: <HeartPulse className="w-10 h-10 text-[#00E5FF]" />, qtd: 240 },
  { id: 'esqueleto', titulo: 'Esqueleto', desc: 'Membros, cinturas e articulações.', icon: <Bone className="w-10 h-10 text-[#00E5FF]" />, qtd: 60 },
];

export const EscolhaQuizPage = () => {
  const navigate = useNavigate();
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState<string | null>('FACIL');
  const [temaSelecionado, setTemaSelecionado] = useState<string | null>('neuro');

  const handleComecarQuiz = () => {
    if (!temaSelecionado || !dificuldadeSelecionada) return;
    navigate(`/aluno/quiz/responder?tema=${temaSelecionado}&dificuldade=${dificuldadeSelecionada}`);
  };

  const handleQuizAleatorio = () => {
    const temasIds = TEMAS.map(t => t.id);
    const difsIds = DIFICULDADES.map(d => d.id);
    const temaSorteado = temasIds[Math.floor(Math.random() * temasIds.length)];
    const difSorteada = difsIds[Math.floor(Math.random() * difsIds.length)];
    navigate(`/aluno/quiz/responder?tema=${temaSorteado}&dificuldade=${difSorteada}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/aluno/home')}
          className="flex items-center gap-1.5 text-[10px] text-[#0A1128]/50 hover:text-[#0A1128] font-bold uppercase tracking-wide mb-6 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar ao painel
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-[#0A1128]">Escolha seu Quiz</h1>
          <p className="text-[#0A1128]/60 text-sm mt-1 font-medium">Selecione o tema e a dificuldade para começar a praticar.</p>
        </div>

        {/* 1. Escolha a Dificuldade */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-[#0A1128] mb-4 flex items-center gap-2">
            <span className="bg-[#14D5C2] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Escolha a dificuldade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIFICULDADES.map((dif) => {
              const isSelected = dificuldadeSelecionada === dif.id;
              return (
                <div 
                  key={dif.id}
                  onClick={() => setDificuldadeSelecionada(dif.id)}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? `${dif.border} ${dif.bg} shadow-sm scale-[1.01]` : 'border-transparent bg-white hover:border-gray-200 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xl font-black ${dif.color}`}>{dif.titulo}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? dif.border : 'border-gray-200'}`}>
                      {isSelected && <div className={`w-2.5 h-2.5 rounded-full bg-current ${dif.color}`} />}
                    </div>
                  </div>
                  <p className="text-[#0A1128]/70 font-medium text-xs mb-3">{dif.desc}</p>
                  {dif.tag && (
                    <span className="inline-block px-2 py-0.5 bg-white/60 rounded-md text-[10px] font-bold text-emerald-600">
                      {dif.tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Escolha o Tema */}
        <section>
          <h2 className="text-lg font-black text-[#0A1128] mb-4 flex items-center gap-2">
            <span className="bg-[#14D5C2] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Escolha o tema do quiz
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {TEMAS.map((tema) => {
              const isSelected = temaSelecionado === tema.id;
              return (
                <div 
                  key={tema.id}
                  onClick={() => setTemaSelecionado(tema.id)}
                  className={`min-w-[220px] relative p-5 rounded-2xl cursor-pointer transition-all border-2 snap-center ${isSelected ? 'border-[#14D5C2] bg-[#E6FCFA] shadow-sm scale-[1.01]' : 'border-transparent bg-white hover:border-gray-200 shadow-sm'}`}
                >
                  {isSelected && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-[#14D5C2]" />}
                  <div className="mb-3 flex justify-center">{tema.icon}</div>
                  <h3 className="text-base font-black text-[#0A1128] text-center mb-1">{tema.titulo}</h3>
                  <p className="text-[#0A1128]/70 text-center text-xs font-medium h-8">{tema.desc}</p>
                  <div className="mt-4 text-center">
                    <span className="text-[#14D5C2] font-bold text-[10px] uppercase tracking-wider">{tema.qtd} Questões</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Barra flutuante inferior */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-100 p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-2">
          <button onClick={handleQuizAleatorio} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="bg-gray-100 p-1.5 rounded-md"><Shuffle className="w-4 h-4 text-[#0A1128]" /></div>
            <div className="text-left hidden sm:block">
              <p className="font-bold text-sm text-[#0A1128]">Quiz aleatório</p>
            </div>
          </button>
          
          <button 
            onClick={handleComecarQuiz}
            disabled={!temaSelecionado || !dificuldadeSelecionada}
            className="flex items-center gap-1.5 bg-[#14D5C2] text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Começar quiz <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
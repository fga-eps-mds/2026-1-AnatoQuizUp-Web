import { useState } from 'react';
import { Mail, Search, ShieldCheck, UserRoundPlus, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type AbaAmigos = 'buscar' | 'convites' | 'amigos';

type CardResumoProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  tone: 'teal' | 'rose' | 'blue';
};

const TABS: Array<{ key: AbaAmigos; label: string }> = [
  { key: 'buscar', label: 'Buscar colegas' },
  { key: 'convites', label: 'Convites' },
  { key: 'amigos', label: 'Meus amigos' },
];

const toneClasses = {
  teal: 'bg-[#71edc8]/20 text-[#00A88F]',
  rose: 'bg-rose-100 text-rose-500',
  blue: 'bg-blue-100 text-blue-600',
};

const CardResumo = ({ icon: Icon, label, value, description, tone }: CardResumoProps) => (
  <article className="flex min-h-[116px] items-center gap-5 rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
    <span
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
        toneClasses[tone]
      }`}
    >
      <Icon size={28} />
    </span>
    <div className="min-w-0">
      <p className="text-3xl font-black leading-none text-[#0A1128]">{value}</p>
      <h2 className="mt-2 text-base font-black text-[#0A1128]">{label}</h2>
      <p className="mt-1 text-sm font-medium text-[#0A1128]/55">{description}</p>
    </div>
  </article>
);

const PainelPlaceholder = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => (
  <section className="rounded-2xl border border-[#0A1128]/10 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
        <Icon size={22} />
      </span>
      <div>
        <h2 className="text-lg font-black text-[#0A1128]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#0A1128]/60">
          {description}
        </p>
      </div>
    </div>
  </section>
);

export const AmigosPage = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaAmigos>('buscar');

  return (
    <main className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[#0A1128]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
              <Users size={24} />
            </span>
            <h1 className="text-3xl font-black">Minha Rede</h1>
          </div>
          <p className="max-w-2xl text-sm font-medium text-[#0A1128]/60">
            Busque colegas, gerencie convites e acompanhe seus amigos no AnatoQuizUp.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <CardResumo
            icon={Users}
            label="amigos"
            value="0"
            description="Conexoes confirmadas"
            tone="teal"
          />
          <CardResumo
            icon={Mail}
            label="convites pendentes"
            value="0"
            description="Aguardando sua resposta"
            tone="rose"
          />
          <CardResumo
            icon={ShieldCheck}
            label="Perfil visivel"
            value="Ativo"
            description="Outros alunos podem encontrar voce"
            tone="blue"
          />
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-[#0A1128]/10 bg-white shadow-sm">
          <div className="grid grid-cols-3">
            {TABS.map((tab) => {
              const isActive = abaAtiva === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setAbaAtiva(tab.key)}
                  aria-pressed={isActive}
                  className={`min-h-12 border-r border-[#0A1128]/10 px-3 text-sm font-black transition-colors last:border-r-0 ${
                    isActive
                      ? 'bg-[#71edc8]/15 text-[#0A1128]'
                      : 'bg-white text-[#0A1128]/60 hover:bg-[#F8FAFC] hover:text-[#0A1128]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {abaAtiva === 'buscar' && (
          <PainelPlaceholder
            icon={Search}
            title="Buscar colegas"
            description="Encontre alunos cadastrados pelo nome ou nickname e envie convites de amizade."
          />
        )}

        {abaAtiva === 'convites' && (
          <PainelPlaceholder
            icon={Mail}
            title="Convites recebidos"
            description="Aceite ou recuse solicitacoes pendentes enviadas por outros alunos."
          />
        )}

        {abaAtiva === 'amigos' && (
          <PainelPlaceholder
            icon={UserRoundPlus}
            title="Meus amigos"
            description="Acompanhe suas conexoes confirmadas e remova amizades quando necessario."
          />
        )}
      </section>
    </main>
  );
};

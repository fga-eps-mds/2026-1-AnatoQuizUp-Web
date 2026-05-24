import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockHistory = [
    {
        id: 1,
        date: "25/04/2026",
        hour: "14:32",
        title: "Tórax",
        subtitle: "Coração e grandes vasos",
        accuracy: 85,
    },
    {
        id: 2,
        date: "25/04/2026",
        hour: "14:32",
        title: "Tórax",
        subtitle: "Coração e grandes vasos",
        accuracy: 60,
    },
    {
        id: 3,
        date: "25/04/2026",
        hour: "14:32",
        title: "Tórax",
        subtitle: "Coração e grandes vasos",
        accuracy: 40,
    },
    {
        id: 4,
        date: "25/04/2026",
        hour: "14:32",
        title: "Tórax",
        subtitle: "Coração e grandes vasos",
        accuracy: 85,
    },
    {
        id: 5,
        date: "25/04/2026",
        hour: "14:32",
        title: "Tórax",
        subtitle: "Coração e grandes vasos",
        accuracy: 85,
    },
];

export const HistoryPage = () => {
    return (
        <main className="flex-1 overflow-y-auto bg-[#FFFFFE] px-6 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#00214D] md:text-[32px]">
                    Histórico
                </h1>

                <p className="text-xs font-semibold text-[#6B7280] md:text-sm">
                    Acompanhe seu desempenho nos quizzes respondidos
                </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm md:p-6">
                {/* Filters */}
                <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
                    <button className="rounded-full bg-[#E8EEFF] px-3 py-1.5 text-xs font-medium text-[#304CDC] md:px-4 md:py-2 md:text-sm">
                        Todos
                    </button>

                    <button className="rounded-full px-4 py-2 text-sm text-[#6B7280] transition hover:bg-gray-100">
                        Órgãos
                    </button>

                    <button className="rounded-full px-4 py-2 text-sm text-[#6B7280] transition hover:bg-gray-100">
                        Sistemas
                    </button>

                    <button className="rounded-full px-4 py-2 text-sm text-[#6B7280] transition hover:bg-gray-100">
                        Outros
                    </button>
                </div>

                {/* Table Header */}
                <div className="mb-4 hidden grid-cols-[1.2fr_1fr_160px_60px] px-4 text-xs font-medium text-[#6B7280] md:grid">
                    <span className="text-[#00214D]">Data</span>
                    <span className="text-[#00214D]">Tema</span>
                    <span className="text-center text-[#00214D]">Taxa de acerto</span>
                    <span className="text-center text-[#00214D]">Ações</span>
                </div>

                {/* List */}
                <div className="flex flex-col gap-3">
                    {mockHistory.map((item) => (
                        <HistoryCard key={item.id} item={item} />
                    ))}
                </div>

                {/* CONFIGURAR PAGINATOR */}
                {/* <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
                Mostrando 1 a 5 de 30 quizes
            </p>

            <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280]">
                {"<"}
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#304CDC] text-sm text-white">
                1
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280]">
                2
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280]">
                3
                </button>

                <span className="px-1 text-[#6B7280]">...</span>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280]">
                6
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280]">
                {">"}
                </button>
            </div>
            </div> */}
            </div>
        </main>
    );
};

interface HistoryCardProps {
    item: {
        id: number;
        date: string;
        hour: string;
        title: string;
        subtitle: string;
        accuracy: number;
    };
}

const HistoryCard = ({ item }: HistoryCardProps) => {
    const navigate = useNavigate();

    const getAccuracyStyles = () => {
        if (item.accuracy >= 75) {
            return {
                bg: "bg-[#E6FFFA]",
                text: "text-[#00BFA5]",
                icon: "text-[#00BFA5]",
            };
        }

        if (item.accuracy >= 50) {
            return {
                bg: "bg-[#FEF3C7]",
                text: "text-[#F59E0B]",
                icon: "text-[#F59E0B]",
            };
        }

        return {
            bg: "bg-[#FFE4E6]",
            text: "text-[#FF5470]",
            icon: "text-[#FF5470]",
        };
    };

    const styles = getAccuracyStyles();

    return (
        <button
            onClick={() =>
                navigate(`/historico/${item.id}`, {
                    state: item,
                })
            }
            className="
                grid grid-cols-[1fr_1fr_56px_16px]
                items-center
                rounded-2xl
                border border-[#E5E7EB]
                bg-white
                px-2 py-3
                text-left
                transition
                hover:shadow-sm

                sm:grid-cols-[1fr_1fr_70px_20px]
                sm:px-3 sm:py-4

                md:grid-cols-[1.2fr_1fr_160px_60px]
                md:px-4 md:py-5
            "
        >
            {/* Date */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
                <div
                    className={`
                        flex items-center justify-center
                        rounded-xl border-2
                        h-8 w-8
                        sm:h-10 sm:w-10
                        md:h-12 md:w-12
                        ${styles.icon}
                    `}
                >
                    📅
                </div>

                <div>
                    <p className="text-xs font-medium text-[#00214D] sm:text-sm md:text-base">
                        {item.date}
                    </p>

                    <p className="text-[10px] text-[#6B7280] sm:text-xs md:text-sm">
                        {item.hour}
                    </p>
                </div>
            </div>

            {/* Theme */}
            <div className="pl-1 sm:pl-2 md:pl-0">
                <p className="text-xs font-medium text-[#00214D] sm:text-sm md:text-base">
                    {item.title}
                </p>

                <p className="text-[10px] text-[#9CA3AF] sm:text-xs md:text-sm">
                    {item.subtitle}
                </p>
            </div>

            {/* Accuracy */}
            <div className="flex justify-center">
                <div
                    className={`
                        flex items-center justify-center rounded-full
                        h-8 w-8
                        sm:h-10 sm:w-10
                        md:h-14 md:w-14
                        ${styles.bg}
                    `}
                >
                    <span
                        className={`
                            text-[10px] font-semibold
                            sm:text-xs
                            md:text-sm
                            ${styles.text}
                        `}
                    >
                        {item.accuracy}%
                    </span>
                </div>
            </div>

            {/* Action */}
            <div className="flex justify-end md:justify-center">
                <ChevronRight className="h-3.5 w-3.5 text-[#00214D] sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
        </button>
    );
};
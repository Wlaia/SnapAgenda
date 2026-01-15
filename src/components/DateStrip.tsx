import { useRef, useEffect } from "react";
import { format, addDays, subDays, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate a range of dates. Let's say +/- 30 days from selected. 
    // Ideally this would be dynamic or infinite scroll, but for now a static range 
    // re-generated when selectedDate changes significantly, or just a fixed window is fine.
    // Let's do a window around the selected date, e.g., current week view, but we want 
    // to allow scrolling. 

    // Better approach: Show 2 weeks? Or just generate dates dynamically?
    // Let's stick to a simpler "Strip" that shows ~14 days centered on "today" or "selected" 
    // but allow navigating weeks. 

    // Let's implement a "Week View" style where you can go Prev/Next Week, 
    // but seeing individual days.

    // Actually, user wants a "strip". Let's generate a 30-day window centered on selected date.
    // This allows some scrolling without complex pagination for now.

    const startDate = subDays(selectedDate, 15);
    const dates = Array.from({ length: 30 }, (_, i) => addDays(startDate, i));

    useEffect(() => {
        // Scroll selected date into view on mount or change
        if (scrollContainerRef.current) {
            const selectedEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedDate]);

    return (
        <div className="relative bg-background border-b shadow-sm py-2">
            <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-lg font-semibold capitalize text-primary">
                    {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSelectDate(subDays(selectedDate, 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSelectDate(addDays(selectedDate, 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-2 px-4 gap-2 no-scrollbar snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toISOString()}
                            data-selected={isSelected}
                            onClick={() => onSelectDate(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[60px] h-[70px] rounded-xl border transition-all snap-center",
                                isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                    : "bg-card hover:bg-muted border-border text-muted-foreground hover:text-foreground",
                                isToday && !isSelected && "border-primary/50 bg-primary/5"
                            )}
                        >
                            <span className="text-xs uppercase font-medium mb-1">
                                {format(date, "EEE", { locale: ptBR }).replace('.', '')}
                            </span>
                            <span className={cn(
                                "text-xl font-bold",
                            )}>
                                {format(date, "d")}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

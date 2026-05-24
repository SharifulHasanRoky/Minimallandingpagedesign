import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { WidgetConfig, AppSettings } from '../../App';
import { ClockWidget } from '../widgets/ClockWidget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { TodoWidget } from '../widgets/TodoWidget';
import { CalculatorWidget } from '../widgets/CalculatorWidget';
import { NotesWidget } from '../widgets/NotesWidget';
import { BookmarksWidget } from '../widgets/BookmarksWidget';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { TimerWidget } from '../widgets/TimerWidget';
import { HabitsWidget } from '../widgets/HabitsWidget';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';

interface HomeProps {
  widgets: WidgetConfig[];
  settings: AppSettings;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  removeWidget: (id: string) => void;
  resizeWidget: (id: string, size: 'small' | 'medium' | 'large') => void;
}

function getWidgetComponent(type: string, id: string) {
  switch (type) {
    case 'clock': return <ClockWidget />;
    case 'calendar': return <CalendarWidget />;
    case 'todo': return <TodoWidget id={id} />;
    case 'calculator': return <CalculatorWidget />;
    case 'notes': return <NotesWidget id={id} />;
    case 'bookmarks': return <BookmarksWidget id={id} />;
    case 'weather': return <WeatherWidget />;
    case 'timer': return <TimerWidget />;
    case 'habits': return <HabitsWidget id={id} />;
    default: return <div>Unknown widget</div>;
  }
}

function getSizeClass(size: string) {
  switch (size) {
    case 'small': return 'col-span-1';
    case 'medium': return 'col-span-1 md:col-span-2';
    case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
    default: return 'col-span-1 md:col-span-2';
  }
}

interface DraggableWidgetProps {
  widget: WidgetConfig;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  removeWidget: (id: string) => void;
  resizeWidget: (id: string, size: 'small' | 'medium' | 'large') => void;
  theme: string;
}

function DraggableWidget({ widget, index, moveWidget, removeWidget, resizeWidget, theme }: DraggableWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'WIDGET',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover(item: { index: number }) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveWidget(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  const nextSize = (current: string): 'small' | 'medium' | 'large' => {
    if (current === 'small') return 'medium';
    if (current === 'medium') return 'large';
    return 'small';
  };

  return (
    <div
      ref={ref}
      className={`${getSizeClass(widget.size)} transition-all duration-200 ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      }`}
    >
      <div className={`h-full rounded-2xl border backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all ${
        theme === 'dark'
          ? 'bg-gray-800/90 border-gray-700/50 hover:border-gray-600/50'
          : 'bg-white/90 border-gray-200/50 hover:border-gray-300/50'
      }`}>
        {/* Widget Header */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${
          theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            <div ref={(node) => { drag(node); }} className="cursor-grab active:cursor-grabbing">
              <GripVertical className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {widget.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => resizeWidget(widget.id, nextSize(widget.size))}
              className={`p-1 rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={`Size: ${widget.size}`}
            >
              {widget.size === 'large' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className={`p-1 rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
              }`}
              title="Remove widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-4">
          {getWidgetComponent(widget.type, widget.id)}
        </div>
      </div>
    </div>
  );
}

export function Home({ widgets, settings, moveWidget, removeWidget, resizeWidget }: HomeProps) {
  const visibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.position - b.position);

  if (visibleWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className={`text-6xl mb-4 ${settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>
          🏠
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Your Home is Empty
        </h2>
        <p className={`${settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Click the + button to add widgets
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-min">
      {visibleWidgets.map((widget, index) => (
        <DraggableWidget
          key={widget.id}
          widget={widget}
          index={index}
          moveWidget={moveWidget}
          removeWidget={removeWidget}
          resizeWidget={resizeWidget}
          theme={settings.theme}
        />
      ))}
    </div>
  );
}

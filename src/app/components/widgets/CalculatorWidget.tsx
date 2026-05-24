import { useState } from 'react';

export function CalculatorWidget() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNumber = (num: string) => {
    if (resetNext) {
      setDisplay(num);
      setResetNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    if (previousValue && operation && !resetNext) {
      calculate();
    }
    setPreviousValue(display);
    setOperation(op);
    setResetNext(true);
  };

  const calculate = () => {
    if (!previousValue || !operation) return;
    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': result = current !== 0 ? prev / current : 0; break;
    }

    setDisplay(String(parseFloat(result.toFixed(8))));
    setPreviousValue(null);
    setOperation(null);
    setResetNext(true);
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setResetNext(false);
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100));
    setResetNext(true);
  };

  const handleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const buttons = [
    { label: 'C', action: clear, style: 'function' },
    { label: '+/-', action: handleSign, style: 'function' },
    { label: '%', action: handlePercent, style: 'function' },
    { label: '÷', action: () => handleOperation('/'), style: 'operator' },
    { label: '7', action: () => handleNumber('7'), style: 'number' },
    { label: '8', action: () => handleNumber('8'), style: 'number' },
    { label: '9', action: () => handleNumber('9'), style: 'number' },
    { label: '×', action: () => handleOperation('*'), style: 'operator' },
    { label: '4', action: () => handleNumber('4'), style: 'number' },
    { label: '5', action: () => handleNumber('5'), style: 'number' },
    { label: '6', action: () => handleNumber('6'), style: 'number' },
    { label: '-', action: () => handleOperation('-'), style: 'operator' },
    { label: '1', action: () => handleNumber('1'), style: 'number' },
    { label: '2', action: () => handleNumber('2'), style: 'number' },
    { label: '3', action: () => handleNumber('3'), style: 'number' },
    { label: '+', action: () => handleOperation('+'), style: 'operator' },
    { label: '0', action: () => handleNumber('0'), style: 'number' },
    { label: '.', action: handleDecimal, style: 'number' },
    { label: '⌫', action: () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), style: 'number' },
    { label: '=', action: calculate, style: 'equals' },
  ];

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'function':
        return 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500';
      case 'operator':
        return 'bg-orange-400 dark:bg-orange-500 text-white hover:bg-orange-500 dark:hover:bg-orange-600';
      case 'equals':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  };

  return (
    <div>
      {/* Display */}
      <div className="mb-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/50 text-right">
        {previousValue && operation && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {previousValue} {operation === '*' ? '×' : operation === '/' ? '÷' : operation}
          </div>
        )}
        <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white truncate">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`h-10 rounded-lg font-medium text-sm transition-all active:scale-95 ${getButtonStyle(btn.style)}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

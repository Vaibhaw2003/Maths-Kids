import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AnswerOptionsProps {
  choices: Array<string | number>;
  selectedValue?: string | number | null;
  correctValue?: string | number;
  disabledValues?: Set<string>;
  locked?: boolean;
  onSelect: (choice: string | number) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  choices,
  selectedValue,
  correctValue,
  disabledValues,
  locked = false,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {choices.map((choice) => {
        const key = String(choice);
        const isCorrect =
          selectedValue !== undefined &&
          selectedValue !== null &&
          String(selectedValue) === key &&
          String(correctValue) === key;
        const isWrong = disabledValues?.has(key);

        return (
          <button
            key={key}
            type="button"
            disabled={locked || isWrong}
            onClick={() => onSelect(choice)}
            className={`glossy-btn h-16 sm:h-20 rounded-2xl text-2xl sm:text-3xl font-display font-bold tabular-nums border-b-4 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCorrect
                ? 'bg-[#35D982] border-[#1C9856] text-[#08291A] scale-105'
                : isWrong
                ? 'bg-[#192344] border-[#10152E] text-[#AEBBD9]/35 opacity-60 cursor-not-allowed'
                : 'bg-[#222E52] hover:bg-[#2A3966] border-[#131B36] text-white hover:border-[#22D3EE]'
            }`}
          >
            <span>{choice}</span>
            {isCorrect && <CheckCircle2 className="w-6 h-6" />}
          </button>
        );
      })}
    </div>
  );
};

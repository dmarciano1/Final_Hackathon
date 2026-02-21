
interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${checked ? 'bg-blue-500' : 'bg-gray-700'
                }`}
        >
            <span className="sr-only">Toggle switch</span>
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    className?: string;
}

export function Slider({ min, max, step, value, onChange, className }: SliderProps) {
    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-current ${className || 'text-blue-500'}`}
        />
    );
}

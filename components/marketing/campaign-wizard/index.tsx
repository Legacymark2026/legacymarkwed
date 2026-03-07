'use client';

import { useCampaignWizard } from './wizard-store';
import { StepPlatform } from './step-platform';
import { StepBudget } from './step-budget';
import { StepTargeting } from './step-targeting';
import { StepCreative } from './step-creative';
import { StepPreflight } from './step-preflight';
import { StepLaunch } from './step-launch';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS = [
    { number: 1, label: 'Plataforma' },
    { number: 2, label: 'Presupuesto' },
    { number: 3, label: 'Audiencia' },
    { number: 4, label: 'Creativos' },
    { number: 5, label: 'Validación' },
    { number: 6, label: 'Lanzar' },
];

export function CampaignWizard() {
    const { step } = useCampaignWizard();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-1">Torre de Control — Nueva Campaña</h1>
                    <p className="text-gray-500 text-sm">
                        Configura y lanza anuncios en múltiples plataformas desde una sola interfaz.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="relative flex items-center justify-between mb-10">
                    {/* Progress line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 z-0" />
                    <div
                        className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-500 z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map(({ number, label }) => {
                        const done = number < step;
                        const current = number === step;

                        return (
                            <div key={number} className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300',
                                        done
                                            ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                                            : current
                                                ? 'bg-gray-800 border-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                                                : 'bg-gray-900 border-white/10 text-gray-500'
                                    )}
                                >
                                    {done ? <Check className="w-4 h-4" /> : number}
                                </div>
                                <span
                                    className={cn(
                                        'text-xs font-medium whitespace-nowrap',
                                        current ? 'text-violet-300' : done ? 'text-gray-400' : 'text-gray-600'
                                    )}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="bg-gray-900/60 border border-white/8 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-white">
                            Paso {step}: {STEPS[step - 1]?.label}
                        </h2>
                        <div className="h-0.5 w-16 bg-violet-500 mt-2 rounded-full" />
                    </div>

                    {step === 1 && <StepPlatform />}
                    {step === 2 && <StepBudget />}
                    {step === 3 && <StepTargeting />}
                    {step === 4 && <StepCreative />}
                    {step === 5 && <StepPreflight />}
                    {step === 6 && <StepLaunch />}
                </div>
            </div>
        </div>
    );
}

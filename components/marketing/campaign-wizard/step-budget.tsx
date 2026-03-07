'use client';

import { useCampaignWizard } from './wizard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Info } from 'lucide-react';

const BID_STRATEGIES = [
    { value: 'LOWEST_COST', label: 'Costo más bajo (recomendado)' },
    { value: 'COST_CAP', label: 'Límite de costo (CBO)' },
    { value: 'TARGET_COST', label: 'Costo objetivo' },
    { value: 'TCPA', label: 'tCPA — Costo por adquisición objetivo (Google)' },
    { value: 'TROAS', label: 'tROAS — Retorno objetivo (Google)' },
    { value: 'MANUAL', label: 'Puja manual' },
];

export function StepBudget() {
    const { budget, startDate, endDate, setBudget, setDates, nextStep, prevStep } =
        useCampaignWizard();

    const canContinue = budget.amount > 0;

    return (
        <div className="space-y-8">
            {/* Budget Type */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300">Tipo de Presupuesto</Label>
                <div className="grid grid-cols-2 gap-3">
                    {(['DAILY', 'LIFETIME'] as const).map((type) => (
                        <button
                            key={type}
                            id={`budget-type-${type.toLowerCase()}`}
                            type="button"
                            onClick={() => setBudget({ type })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${budget.type === type
                                    ? 'border-violet-500 bg-violet-500/10'
                                    : 'border-white/10 bg-white/3 hover:border-white/20'
                                }`}
                        >
                            <p className="font-semibold text-white text-sm">
                                {type === 'DAILY' ? 'Diario (ABO)' : 'Total (CBO)'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {type === 'DAILY'
                                    ? 'Controla el gasto por día por conjunto de anuncios'
                                    : 'El algoritmo optimiza el gasto total de la campaña'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget Amount */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="budget-amount" className="text-sm font-semibold text-gray-300">
                        Monto ({budget.type === 'DAILY' ? 'por día' : 'total'})
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                        <Input
                            id="budget-amount"
                            type="number"
                            min={1}
                            value={budget.amount}
                            onChange={(e) => setBudget({ amount: parseFloat(e.target.value) || 0 })}
                            className="bg-white/5 border-white/10 text-white pl-8 h-11"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-300">Moneda</Label>
                    <Select value={budget.currency} onValueChange={(v) => setBudget({ currency: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10">
                            {['USD', 'EUR', 'MXN', 'COP', 'ARS', 'BRL'].map((c) => (
                                <SelectItem key={c} value={c} className="text-white hover:bg-white/10">
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bid Strategy */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Estrategia de Puja</Label>
                <Select
                    value={budget.bidStrategy}
                    onValueChange={(v) => setBudget({ bidStrategy: v as typeof budget.bidStrategy })}
                >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                        {BID_STRATEGIES.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="text-white hover:bg-white/10">
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bid Amount (conditional) */}
            {(budget.bidStrategy === 'COST_CAP' ||
                budget.bidStrategy === 'MANUAL' ||
                budget.bidStrategy === 'TCPA') && (
                    <div className="space-y-2">
                        <Label htmlFor="bid-amount" className="text-sm font-semibold text-gray-300">
                            Monto de Puja ($)
                        </Label>
                        <div className="flex items-start gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                                <Input
                                    id="bid-amount"
                                    type="number"
                                    min={0.01}
                                    step={0.01}
                                    value={budget.bidAmount ?? ''}
                                    onChange={(e) => setBudget({ bidAmount: parseFloat(e.target.value) || 0 })}
                                    className="bg-white/5 border-white/10 text-white pl-8 h-11"
                                />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 pt-3">
                                <Info className="w-3 h-3" />
                                <span>CPC / CPA objetivo</span>
                            </div>
                        </div>
                    </div>
                )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-sm font-semibold text-gray-300">Fecha de Inicio</Label>
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate ?? ''}
                        onChange={(e) => setDates(e.target.value, endDate)}
                        className="bg-white/5 border-white/10 text-white h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-sm font-semibold text-gray-300">Fecha de Fin (opcional)</Label>
                    <Input
                        id="end-date"
                        type="date"
                        value={endDate ?? ''}
                        onChange={(e) => setDates(startDate, e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-11"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="text-gray-400 hover:text-white">
                    ← Atrás
                </Button>
                <Button
                    id="wizard-next-step-2"
                    onClick={nextStep}
                    disabled={!canContinue}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-8 h-11 disabled:opacity-40"
                >
                    Continuar →
                </Button>
            </div>
        </div>
    );
}

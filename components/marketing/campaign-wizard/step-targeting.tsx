'use client';

import { useCampaignWizard } from './wizard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

const COMMON_LOCATIONS = ['US', 'MX', 'CO', 'AR', 'BR', 'ES', 'UK', 'CA'];
const COMMON_INTERESTS = [
    'Tecnología', 'Emprendimiento', 'Marketing Digital', 'Pequeñas Empresas',
    'CRM / Software', 'Finanzas', 'E-commerce', 'Real Estate',
];

export function StepTargeting() {
    const { targeting, setTargeting, nextStep, prevStep } = useCampaignWizard();
    const [interestInput, setInterestInput] = useState('');

    function addInterest(interest: string) {
        if (!interest.trim() || targeting.interests.includes(interest)) return;
        setTargeting({ interests: [...targeting.interests, interest] });
        setInterestInput('');
    }

    function removeInterest(interest: string) {
        setTargeting({ interests: targeting.interests.filter((i) => i !== interest) });
    }

    function toggleLocation(loc: string) {
        if (targeting.locations.includes(loc)) {
            setTargeting({ locations: targeting.locations.filter((l) => l !== loc) });
        } else {
            setTargeting({ locations: [...targeting.locations, loc] });
        }
    }

    return (
        <div className="space-y-8">
            {/* Age Range */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300">Rango de Edad</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="age-min" className="text-xs text-gray-500">Mínima</Label>
                        <Input
                            id="age-min"
                            type="number"
                            min={13}
                            max={65}
                            value={targeting.ageMin}
                            onChange={(e) => setTargeting({ ageMin: parseInt(e.target.value) || 18 })}
                            className="bg-white/5 border-white/10 text-white h-11"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="age-max" className="text-xs text-gray-500">Máxima</Label>
                        <Input
                            id="age-max"
                            type="number"
                            min={13}
                            max={65}
                            value={targeting.ageMax}
                            onChange={(e) => setTargeting({ ageMax: parseInt(e.target.value) || 65 })}
                            className="bg-white/5 border-white/10 text-white h-11"
                        />
                    </div>
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300">Género</Label>
                <div className="flex gap-2">
                    {(['ALL', 'MALE', 'FEMALE'] as const).map((g) => (
                        <button
                            key={g}
                            id={`gender-${g.toLowerCase()}`}
                            type="button"
                            onClick={() => setTargeting({ genders: [g] })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${targeting.genders.includes(g)
                                    ? 'border-teal-500 bg-violet-500/20 text-teal-300'
                                    : 'border-white/10 text-gray-400 hover:border-white/20'
                                }`}
                        >
                            {g === 'ALL' ? 'Todos' : g === 'MALE' ? 'Hombres' : 'Mujeres'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300">Ubicaciones</Label>
                <div className="flex flex-wrap gap-2">
                    {COMMON_LOCATIONS.map((loc) => (
                        <button
                            key={loc}
                            type="button"
                            id={`location-${loc.toLowerCase()}`}
                            onClick={() => toggleLocation(loc)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${targeting.locations.includes(loc)
                                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                                    : 'border-white/10 text-gray-400 hover:border-white/20'
                                }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300">Intereses y Audiencias</Label>
                <div className="flex gap-2">
                    <Input
                        id="interest-input"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest(interestInput))}
                        placeholder="Escribe un interés y presiona Enter..."
                        className="bg-white/5 border-white/10 text-white h-11 flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addInterest(interestInput)}
                        className="h-11 w-11 border-white/10 text-gray-300 hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Quick Add */}
                <div className="flex flex-wrap gap-1.5">
                    {COMMON_INTERESTS.filter(i => !targeting.interests.includes(i)).map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => addInterest(interest)}
                            className="px-2 py-1 rounded text-xs text-gray-400 border border-dashed border-white/10 hover:border-teal-500/50 hover:text-teal-400 transition-colors"
                        >
                            + {interest}
                        </button>
                    ))}
                </div>

                {/* Selected Interests */}
                {targeting.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl">
                        {targeting.interests.map((interest) => (
                            <Badge
                                key={interest}
                                className="bg-violet-500/20 text-teal-300 border-teal-500/30 gap-1.5"
                            >
                                {interest}
                                <button type="button" onClick={() => removeInterest(interest)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Audiences */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="custom-audiences" className="text-sm font-semibold text-gray-300">
                        Audiencias Custom (IDs)
                    </Label>
                    <Input
                        id="custom-audiences"
                        value={targeting.customAudiences ?? ''}
                        onChange={(e) => setTargeting({ customAudiences: e.target.value })}
                        placeholder="act_123, 456, ..."
                        className="bg-white/5 border-white/10 text-white h-11"
                    />
                    <p className="text-xs text-gray-600">IDs separados por coma. Aplica a Meta y TikTok.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="excluded-audiences" className="text-sm font-semibold text-gray-300">
                        Audiencias Excluidas (IDs)
                    </Label>
                    <Input
                        id="excluded-audiences"
                        value={targeting.excludedAudiences ?? ''}
                        onChange={(e) => setTargeting({ excludedAudiences: e.target.value })}
                        placeholder="789, 012, ..."
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
                    id="wizard-next-step-3"
                    onClick={nextStep}
                    className="bg-teal-700 hover:bg-teal-600 text-white px-8 h-11"
                >
                    Continuar →
                </Button>
            </div>
        </div>
    );
}

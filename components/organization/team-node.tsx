import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, MoreVertical, Shield } from 'lucide-react';

const TeamNode = ({ data }: { data: any }) => {
    return (
        <div className="relative min-w-[200px] rounded-xl border border-teal-500/30 bg-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.15)] backdrop-blur-md overflow-hidden transition-all hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
            {/* Input handle from parent */}
            <Handle type="target" position={Position.Top} className="w-16 h-1 !bg-teal-500 rounded-none border-none top-0 translate-y-0" />
            
            <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-teal-50">{data.name}</h3>
                        {data.level === 0 && (
                            <span className="inline-flex items-center text-[10px] uppercase font-mono tracking-wider text-teal-400 bg-teal-950/50 px-1.5 py-0.5 rounded mt-1">
                                <Shield className="w-3 h-3 mr-1" /> HQ / Root
                            </span>
                        )}
                    </div>
                    
                    <button 
                        className="text-slate-400 hover:text-teal-300 transition-colors p-1 -mr-1 rounded-md hover:bg-slate-800"
                        onClick={(e) => { e.stopPropagation(); data.onTriggerConfig(data.id); }}
                    >
                        <MoreVertical size={14} />
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                        <Users size={12} className={data.memberCount > 0 ? "text-teal-400" : ""} />
                        <span className={data.memberCount > 0 ? "text-teal-100 font-medium" : ""}>
                            {data.memberCount} {data.memberCount === 1 ? 'Miembro' : 'Miembros'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Output handle for children */}
            <Handle type="source" position={Position.Bottom} className="w-16 h-1 !bg-teal-500 rounded-none border-none bottom-0 translate-y-0" />
            
        </div>
    );
};

export default memo(TeamNode);

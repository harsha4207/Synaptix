import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  TrendingUp,
  FlaskConical,
  Activity,
  GraduationCap,
  Briefcase,
  FolderPlus,
  ChevronDown,
} from 'lucide-react';
import { DomainType, WorkspaceItem } from '../types/workspace';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FormField } from './ui/FormField';
import { cn } from '../lib/utils';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (newWorkspace: WorkspaceItem) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkspace,
}) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<DomainType>('Finance');
  const [description, setDescription] = useState('');
  const [accessLevel, setAccessLevel] = useState('Authorized Team Access');
  const [error, setError] = useState('');

  const domainOptions: {
    type: DomainType;
    label: string;
    icon: React.ReactNode;
    iconName: string;
    defaultDesc: string;
  }[] = [
    {
      type: 'Finance',
      label: 'Finance',
      icon: <TrendingUp size={16} className="text-[#1769E0]" />,
      iconName: 'TrendingUp',
      defaultDesc: 'Financial intelligence & operational auditing',
    },
    {
      type: 'Research',
      label: 'Research',
      icon: <FlaskConical size={16} className="text-[#2496FF]" />,
      iconName: 'FlaskConical',
      defaultDesc: 'Scientific synthesis & literature reasoning',
    },
    {
      type: 'Healthcare',
      label: 'Healthcare',
      icon: <Activity size={16} className="text-[#0D9488]" />,
      iconName: 'Activity',
      defaultDesc: 'Clinical data & HIPAA-compliant analytics',
    },
    {
      type: 'Education',
      label: 'Education',
      icon: <GraduationCap size={16} className="text-[#8B5CF6]" />,
      iconName: 'GraduationCap',
      defaultDesc: 'Curriculum optimization & learning outcomes',
    },
    {
      type: 'Business',
      label: 'Business Strategy',
      icon: <Briefcase size={16} className="text-[#D97706]" />,
      iconName: 'Briefcase',
      defaultDesc: 'Strategic intelligence & market reasoning',
    },
    {
      type: 'Custom',
      label: 'Custom Domain',
      icon: <FolderPlus size={16} className="text-[#64748B]" />,
      iconName: 'FolderPlus',
      defaultDesc: 'Custom enterprise intelligence boundary',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    const selectedOption = domainOptions.find((d) => d.type === domain);
    const newWs: WorkspaceItem = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name.trim(),
      domain: domain,
      description: description.trim() || selectedOption?.defaultDesc || 'Enterprise intelligence domain',
      iconName: selectedOption?.iconName || 'FolderPlus',
      documentCount: 0,
      datasetCount: 0,
      dashboardCount: 0,
      lastActivity: 'Workspace created',
      lastActivityTime: 'Just now',
      colorAccent: domain === 'Finance' ? '#1769E0' : domain === 'Research' ? '#2496FF' : domain === 'Healthcare' ? '#0D9488' : '#8B5CF6',
      isAuthorized: true,
    };

    onCreateWorkspace(newWs);
    onClose();
    setName('');
    setDescription('');
    setError('');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" ariaLabel="Create Workspace">
      <DialogHeader
        title="Create Workspace"
        description="Define an isolated domain boundary for your data and AI reasoning"
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <DialogBody className="space-y-5 py-4 overflow-y-auto flex-1">
          {/* 1. Workspace Name */}
          <FormField label="Workspace Name" htmlFor="ws-name" isRequired error={error}>
            <Input
              id="ws-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Legal & Compliance Operations"
              isError={!!error}
              className="h-11 text-xs w-full"
              autoFocus
            />
          </FormField>

          {/* 2. Domain Type Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-text-1)] block">
              Select Domain Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {domainOptions.map((opt) => {
                const isSelected = domain === opt.type;
                return (
                  <button
                    type="button"
                    key={opt.type}
                    className={cn(
                      'p-3 sm:p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer select-none',
                      isSelected
                        ? 'border-[var(--c-blue)] bg-[var(--c-blue-soft)] ring-1 ring-[var(--c-blue)] shadow-xs'
                        : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-2)] hover:bg-[var(--c-page)]'
                    )}
                    onClick={() => setDomain(opt.type)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'bg-white shadow-2xs' : 'bg-[var(--c-page)]'
                        )}
                      >
                        {opt.icon}
                      </div>
                      <span className="text-xs font-semibold text-[var(--c-text-1)] truncate">
                        {opt.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[var(--c-blue)] text-white flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Description (Multiline Textarea) */}
          <div className="space-y-1.5">
            <label htmlFor="ws-desc" className="text-xs font-semibold text-[var(--c-text-1)] block">
              Description <span className="text-[var(--c-text-3)] font-normal">(Optional)</span>
            </label>
            <textarea
              id="ws-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of domain purpose and data scope..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text-1)] placeholder:text-[var(--c-text-3)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue-ring)] outline-none resize-none transition-all block box-border"
            />
          </div>

          {/* 4. Access Control Policy */}
          <div className="space-y-1.5">
            <label htmlFor="ws-access" className="text-xs font-semibold text-[var(--c-text-1)] block">
              Access Control Policy
            </label>
            <div className="relative flex items-center w-full">
              <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-blue)] pointer-events-none" />
              <select
                id="ws-access"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full h-11 pl-10 pr-10 text-xs font-medium bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text-1)] hover:border-[var(--c-border-2)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue-ring)] outline-none cursor-pointer appearance-none transition-colors"
              >
                <option value="Authorized Team Access">Authorized Team Access (RBAC Managed)</option>
                <option value="Restricted Enterprise Access">Restricted Enterprise Access (Executive Only)</option>
                <option value="Confidential Workspace">Confidential Workspace (Strict SAML 2.0)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)] pointer-events-none" />
            </div>
          </div>
        </DialogBody>

        {/* 5. Footer and Action Buttons */}
        <DialogFooter className="pt-4 border-t border-[var(--c-border)] flex items-center justify-end gap-3 shrink-0">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            className="h-10 px-5 text-xs font-semibold border border-[var(--c-border)] text-[var(--c-text-1)] hover:bg-[var(--c-page)] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="h-10 px-6 text-xs font-bold bg-[var(--c-navy)] text-white hover:bg-[var(--c-navy-hover)] rounded-xl shadow-xs"
          >
            Create Workspace
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

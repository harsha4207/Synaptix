import React, { useState } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { DomainType, WorkspaceItem } from '../types/workspace';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FormField } from './ui/FormField';

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

  const domainOptions: { type: DomainType; label: string; iconName: string; defaultDesc: string }[] = [
    { type: 'Finance', label: 'Finance', iconName: 'TrendingUp', defaultDesc: 'Financial intelligence & operational auditing' },
    { type: 'Research', label: 'Research', iconName: 'FlaskConical', defaultDesc: 'Scientific synthesis & literature reasoning' },
    { type: 'Healthcare', label: 'Healthcare', iconName: 'Activity', defaultDesc: 'Clinical data & HIPAA-compliant analytics' },
    { type: 'Education', label: 'Education', iconName: 'GraduationCap', defaultDesc: 'Curriculum optimization & learning outcomes' },
    { type: 'Business', label: 'Business Strategy', iconName: 'Briefcase', defaultDesc: 'Strategic intelligence & market reasoning' },
    { type: 'Custom', label: 'Custom Domain', iconName: 'FolderPlus', defaultDesc: 'Custom enterprise intelligence boundary' },
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

      <form onSubmit={handleSubmit}>
        <DialogBody>
          {/* Workspace Name */}
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
              autoFocus
            />
          </FormField>

          {/* Domain Type Selection */}
          <div className="form-group">
            <label className="form-label">Select Domain Category</label>
            <div className="domain-selection-grid">
              {domainOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  className={`domain-select-card ${domain === opt.type ? 'active' : ''}`}
                  onClick={() => setDomain(opt.type)}
                >
                  <span className="domain-select-label">{opt.label}</span>
                  {domain === opt.type && <Check size={14} className="check-mark" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <FormField label="Description (Optional)" htmlFor="ws-desc">
            <Input
              id="ws-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of domain purpose and data scope..."
            />
          </FormField>

          {/* Initial Permissions */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Access Control Policy</label>
            <div className="access-policy-box">
              <ShieldCheck size={16} className="policy-icon" />
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="policy-select"
              >
                <option value="Authorized Team Access">Authorized Team Access (RBAC Managed)</option>
                <option value="Restricted Enterprise Access">Restricted Enterprise Access (Executive Only)</option>
                <option value="Confidential Workspace">Confidential Workspace (Strict SAML 2.0)</option>
              </select>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Workspace
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

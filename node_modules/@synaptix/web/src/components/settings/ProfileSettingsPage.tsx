import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, CheckCircle2, AlertCircle, Shield, Building, Mail, Phone, User, Briefcase } from 'lucide-react';
import { UserProfileInfo } from '../../types/workspace';

interface ProfileSettingsPageProps {
  user: UserProfileInfo;
  onUpdateProfile: (updated: Partial<UserProfileInfo>) => void;
  onAddToast: (msg: string) => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  user,
  onUpdateProfile,
  onAddToast,
}) => {
  // Form State initialized with authenticated user details
  const [formData, setFormData] = useState({
    name: user.name || '',
    displayName: user.displayName || user.name || '',
    email: user.email || '',
    jobTitle: user.jobTitle || 'Enterprise Systems Lead',
    department: user.department || 'Intelligence & Operations',
    organization: user.organization || 'SYNAPTIX COMMAND',
    phone: user.phone || '+1 (555) 234-8901',
    bio: user.bio || 'Enterprise security and cross-workspace intelligence orchestration lead for Synaptix Command.',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user prop changes externally
  useEffect(() => {
    setFormData({
      name: user.name || '',
      displayName: user.displayName || user.name || '',
      email: user.email || '',
      jobTitle: user.jobTitle || 'Enterprise Systems Lead',
      department: user.department || 'Intelligence & Operations',
      organization: user.organization || 'SYNAPTIX COMMAND',
      phone: user.phone || '+1 (555) 234-8901',
      bio: user.bio || 'Enterprise security and cross-workspace intelligence orchestration lead for Synaptix Command.',
    });
    setAvatarPreview(user.avatarUrl || null);
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if form has unsaved modifications
  const isDirty =
    formData.name !== (user.name || '') ||
    formData.displayName !== (user.displayName || user.name || '') ||
    formData.email !== (user.email || '') ||
    formData.jobTitle !== (user.jobTitle || 'Enterprise Systems Lead') ||
    formData.department !== (user.department || 'Intelligence & Operations') ||
    formData.organization !== (user.organization || 'SYNAPTIX COMMAND') ||
    formData.phone !== (user.phone || '+1 (555) 234-8901') ||
    formData.bio !== (user.bio || 'Enterprise security and cross-workspace intelligence orchestration lead for Synaptix Command.') ||
    avatarPreview !== (user.avatarUrl || null);

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (JPG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid image format. Supported formats: JPG, PNG, or WebP.');
      return;
    }

    // Validate size (max 3MB)
    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPhotoError('File size exceeds the 3MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
      onAddToast('Profile photo preview updated (Active for current browser session)');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onAddToast('Profile photo removed');
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Work email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid work email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      onUpdateProfile({
        ...formData,
        avatarUrl: avatarPreview || undefined,
      });

      setIsSaving(false);
      setIsSavedFeedback(true);
      setTimeout(() => setIsSavedFeedback(false), 3500);
      onAddToast('Profile settings & avatar saved permanently');
    }, 300);
  };

  const handleCancel = () => {
    // Reset to existing authenticated state
    setFormData({
      name: user.name || '',
      displayName: user.displayName || user.name || '',
      email: user.email || '',
      jobTitle: user.jobTitle || 'Enterprise Systems Lead',
      department: user.department || 'Intelligence & Operations',
      organization: user.organization || 'SYNAPTIX COMMAND',
      phone: user.phone || '+1 (555) 234-8901',
      bio: user.bio || 'Enterprise security and cross-workspace intelligence orchestration lead for Synaptix Command.',
    });
    setAvatarPreview(user.avatarUrl || null);
    setPhotoError(null);
    setFormErrors({});
    onAddToast('Unsaved changes discarded');
  };

  return (
    <div className="profile-settings-page-content" aria-label="Profile Settings Section">
      {/* 1. Profile Header Overview Card */}
      <div className="settings-section-card profile-summary-card">
        <div className="profile-summary-header-wrap">
          <div className="profile-summary-avatar-wrap">
            {avatarPreview ? (
              <img src={avatarPreview} alt={formData.name || 'User'} className="profile-summary-avatar-img" />
            ) : (
              <div className="profile-summary-avatar-fallback">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
          </div>
          <div className="profile-summary-text-wrap">
            <div className="profile-summary-title-row">
              <h2 className="profile-summary-name">{formData.name || 'Enterprise Administrator'}</h2>
              <span className="profile-summary-badge">Active Directory Verified</span>
            </div>
            <p className="profile-summary-sub">
              {formData.jobTitle} &bull; {formData.organization}
            </p>
            <div className="profile-summary-meta">
              <span className="summary-meta-item">
                <Mail size={13} /> {formData.email}
              </span>
              <span className="summary-meta-item">
                <Shield size={13} /> {user.role || 'Enterprise Administrator'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="profile-settings-form-shell">
        {/* 2. Professional Profile Photo Section */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <h3 className="section-title">Profile Photo</h3>
              <p className="section-subtitle">
                Your circular avatar displayed across workspaces, audit logs, and shared analysis boards.
              </p>
            </div>
          </div>

          <div className="profile-photo-row">
            <div className="profile-avatar-large">
              {avatarPreview ? (
                <img src={avatarPreview} alt={formData.name} className="avatar-img-large" />
              ) : (
                <div className="avatar-placeholder-large">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>

            <div className="profile-photo-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
                aria-label="Upload profile photo"
              />

              <div className="photo-btn-group">
                <button
                  type="button"
                  className="btn-upload-trigger"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={15} />
                  <span>Upload Photo</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 size={15} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {photoError ? (
                <div className="photo-notice-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{photoError}</span>
                </div>
              ) : (
                <p className="photo-guidelines-text">
                  Supports square JPG, PNG, or WebP up to 3MB. Saved photos persist automatically across navigation and browser refreshes.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Personal & Professional Information Form Grid */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <h3 className="section-title">Personal & Enterprise Information</h3>
              <p className="section-subtitle">
                Manage contact parameters and workspace identification for cross-domain intelligence collaboration.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            {/* Full Name */}
            <div className="settings-field-group">
              <label htmlFor="prof-fullname" className="field-label">
                Full Name <span className="req-star">*</span>
              </label>
              <div className="field-input-icon-wrap">
                <User size={15} className="field-icon-prefix" />
                <input
                  id="prof-fullname"
                  type="text"
                  className={`field-input with-prefix ${formErrors.name ? 'has-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Alex Vance"
                />
              </div>
              {formErrors.name && (
                <span className="field-error-text">
                  <AlertCircle size={12} /> {formErrors.name}
                </span>
              )}
            </div>

            {/* Display Name */}
            <div className="settings-field-group">
              <label htmlFor="prof-displayname" className="field-label">
                Display Name
              </label>
              <div className="field-input-icon-wrap">
                <User size={15} className="field-icon-prefix" />
                <input
                  id="prof-displayname"
                  type="text"
                  className="field-input with-prefix"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="e.g. Alex V."
                />
              </div>
              <span className="field-helper">Short moniker shown on quick command activity</span>
            </div>

            {/* Work Email */}
            <div className="settings-field-group">
              <label htmlFor="prof-email" className="field-label">
                Work Email <span className="req-star">*</span>
              </label>
              <div className="field-input-icon-wrap">
                <Mail size={15} className="field-icon-prefix" />
                <input
                  id="prof-email"
                  type="email"
                  className={`field-input with-prefix ${formErrors.email ? 'has-error' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@enterprise.com"
                />
              </div>
              {formErrors.email && (
                <span className="field-error-text">
                  <AlertCircle size={12} /> {formErrors.email}
                </span>
              )}
            </div>

            {/* Job Title */}
            <div className="settings-field-group">
              <label htmlFor="prof-jobtitle" className="field-label">
                Job Title
              </label>
              <div className="field-input-icon-wrap">
                <Briefcase size={15} className="field-icon-prefix" />
                <input
                  id="prof-jobtitle"
                  type="text"
                  className="field-input with-prefix"
                  value={formData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  placeholder="e.g. Enterprise Systems Lead"
                />
              </div>
            </div>

            {/* Department */}
            <div className="settings-field-group">
              <label htmlFor="prof-dept" className="field-label">
                Department
              </label>
              <div className="field-input-icon-wrap">
                <Building size={15} className="field-icon-prefix" />
                <input
                  id="prof-dept"
                  type="text"
                  className="field-input with-prefix"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="e.g. Intelligence & Operations"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="settings-field-group">
              <label htmlFor="prof-org" className="field-label">
                Organization / Tenant
              </label>
              <div className="field-input-icon-wrap">
                <Building size={15} className="field-icon-prefix" />
                <input
                  id="prof-org"
                  type="text"
                  className="field-input with-prefix"
                  value={formData.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  placeholder="e.g. SYNAPTIX COMMAND"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="settings-field-group">
              <label htmlFor="prof-phone" className="field-label">
                Phone Number
              </label>
              <div className="field-input-icon-wrap">
                <Phone size={15} className="field-icon-prefix" />
                <input
                  id="prof-phone"
                  type="tel"
                  className="field-input with-prefix"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 234-8901"
                />
              </div>
            </div>

            {/* Assigned Role (Read-only IAM protection) */}
            <div className="settings-field-group">
              <label className="field-label">Assigned Role</label>
              <div className="settings-readonly-card">
                <div className="role-card-badge">
                  <Shield size={14} className="text-primary-blue" />
                  <span className="role-title">{user.role || 'Enterprise Administrator'}</span>
                </div>
                <p className="role-lock-explanation">
                  Managed via Enterprise IAM Policy &bull; Read-only in Profile Settings
                </p>
              </div>
            </div>

            {/* Professional Bio (Full Width multiline text area) */}
            <div className="settings-field-group full-width">
              <label htmlFor="prof-bio" className="field-label">
                Professional Bio
              </label>
              <textarea
                id="prof-bio"
                className="field-input field-textarea"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Enterprise security and cross-workspace intelligence orchestration lead for Synaptix Command."
              />
              <span className="field-helper">
                Brief professional summary rendered on workspace domain leadership and audit boards.
              </span>
            </div>
          </div>
        </div>

        {/* 4. Form Actions Footer */}
        <div className="settings-actions-footer">
          {isSavedFeedback ? (
            <div className="settings-success-indicator">
              <CheckCircle2 size={16} />
              <span>Profile details & avatar updated successfully</span>
            </div>
          ) : (
            <div className="footer-notice-left text-muted">
              * Profile updates are persisted to secure client storage and survive page refreshes.
            </div>
          )}

          <div className="footer-btns-right">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={!isDirty || isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CLIENT_PRESETS } from '../data/brandingPresets';
import { InstitutionProfile } from '../types';
import {
  Building2,
  Download,
  Upload,
  SlidersHorizontal,
  ImageIcon,
  School,
  UserCheck,
  MapPin,
  MessageSquare,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Globe,
  Phone,
  Mail,
} from 'lucide-react';

export const InstitutionCustomizerView: React.FC = () => {
  const {
    institutions,
    institution,
    addInstitution,
    updateInstitution,
    deleteInstitution,
    switchInstitution,
    applyClientPreset,
    showToast,
  } = useApp();

  const [formData, setFormData] = useState<InstitutionProfile>(institution);
  const [logoPreview, setLogoPreview] = useState<string>(institution.logoUrl);
  const [isAddingNewSchool, setIsAddingNewSchool] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if active institution in context changes
  const handleSelectSchool = (inst: InstitutionProfile) => {
    switchInstitution(inst.id);
    setFormData(inst);
    setLogoPreview(inst.logoUrl);
    setIsAddingNewSchool(false);
  };

  const handleStartAddNewSchool = () => {
    setIsAddingNewSchool(true);
    const newSchoolTemplate: InstitutionProfile = {
      id: `school-${Date.now()}`,
      name: '',
      shortName: '',
      category: 'School',
      tagline: 'Excellence in Education',
      affiliationCode: 'AFF-2024-NEW',
      boardName: 'CBSE Affiliated',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
      principalName: 'Dr. Principal',
      principalDesignation: 'Principal',
      principalEmail: 'principal@school.edu',
      principalWhatsApp: '919876543210',
      phone: '+91 98765-00000',
      email: 'info@school.edu',
      address: 'Campus Address, City, State',
      website: 'www.school.edu',
      academicSession: '2024 - 2025 (Term 2)',
      primaryColor: '#004ac6',
      accentColor: '#007d55',
      defaulterThreshold: 75.0,
      currencySymbol: '₹',
    };
    setFormData(newSchoolTemplate);
    setLogoPreview(newSchoolTemplate.logoUrl);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setFormData(prev => ({ ...prev, logoUrl: base64String }));
        showToast('Custom logo uploaded & ready to save!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('School/College name is required', 'warning');
      return;
    }

    if (isAddingNewSchool) {
      addInstitution(formData);
      setIsAddingNewSchool(false);
    } else {
      updateInstitution(formData.id, formData);
    }
  };

  const handleDeleteCurrentSchool = (id: string, name: string) => {
    if (institutions.length <= 1) {
      showToast('Cannot delete the only registered school', 'warning');
      return;
    }
    if (confirm(`Are you sure you want to remove "${name}" from your managed institutions?`)) {
      deleteInstitution(id);
    }
  };

  const handleExportClientConfig = () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.shortName.replace(/\s+/g, '_')}_Branding_Config.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Client branding configuration exported as JSON');
  };

  const handleImportClientConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as InstitutionProfile;
          if (parsed.name && parsed.affiliationCode) {
            setFormData(parsed);
            setLogoPreview(parsed.logoUrl);
            addInstitution(parsed);
            showToast(`Imported branding profile for ${parsed.name}`);
          } else {
            showToast('Invalid client configuration JSON format', 'error');
          }
        } catch {
          showToast('Failed to parse JSON file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-6xl mx-auto text-left pb-24">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">School & Institution Manager</h2>
              <p className="text-[11px] sm:text-xs text-[#737686]">
                Add, remove, customize, and switch between multi-campus schools and universities.
              </p>
            </div>
          </div>

          {/* Import / Export / Add Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleStartAddNewSchool}
              className="h-9 sm:h-10 px-3 bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add School</span>
            </button>
            <button
              onClick={handleExportClientConfig}
              className="h-9 sm:h-10 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-1.5 border border-[#dae2fd] active:scale-95 transition-all"
              type="button"
              title="Export config JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#004ac6]" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <label className="h-9 sm:h-10 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-1.5 border border-[#dae2fd] cursor-pointer active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5 text-[#007d55]" />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportClientConfig}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Managed Schools Switcher & Overview Cards */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-[#131b2e] flex items-center gap-1.5">
            <School className="w-4 h-4 text-[#004ac6]" />
            <span>Configured Schools & Campuses ({institutions.length})</span>
          </span>
          <span className="text-[10px] text-[#737686]">Click card to switch active workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {institutions.map(inst => {
            const isCurrentActive = inst.id === (isAddingNewSchool ? '' : formData.id);
            return (
              <div
                key={inst.id}
                onClick={() => handleSelectSchool(inst)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 text-left relative ${
                  isCurrentActive
                    ? 'border-[#004ac6] bg-[#004ac6]/5 ring-2 ring-[#004ac6]/20'
                    : 'border-[#eaedff] bg-[#faf8ff] hover:border-[#dae2fd]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={inst.logoUrl}
                    alt={inst.shortName}
                    className="w-10 h-10 rounded-xl object-cover border border-[#dae2fd] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{inst.shortName}</h4>
                      {isCurrentActive && (
                        <span className="px-1.5 py-0.2 bg-[#bdffdb] text-[#002113] text-[9px] font-bold rounded-full flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#007d55]" />
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#004ac6] font-semibold block truncate">{inst.category} • {inst.boardName.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#737686] block truncate">{inst.principalDesignation}: {inst.principalName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#f2f3ff] text-[10px]">
                  <span className="text-[#737686] truncate">Affiliation: {inst.affiliationCode}</span>
                  {institutions.length > 1 && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCurrentSchool(inst.id, inst.name);
                      }}
                      className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded-lg transition-colors"
                      title="Remove School"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Edit / Add Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Form Title bar */}
        <div className="flex items-center justify-between bg-[#f2f3ff] p-3 rounded-2xl border border-[#dae2fd]">
          <span className="text-xs sm:text-sm font-bold text-[#004ac6] flex items-center gap-2">
            {isAddingNewSchool ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isAddingNewSchool ? 'Add New Institution Profile' : `Editing: ${formData.name || formData.shortName}`}</span>
          </span>

          {isAddingNewSchool && (
            <button
              type="button"
              onClick={() => {
                setIsAddingNewSchool(false);
                setFormData(institution);
                setLogoPreview(institution.logoUrl);
              }}
              className="text-xs font-bold text-[#737686] hover:text-[#131b2e]"
            >
              Cancel Add
            </button>
          )}
        </div>

        {/* Section 1: Core Institution Details */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
            <School className="w-4 h-4 text-[#004ac6]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">Campus & Affiliation Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Full Institution Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Delhi Public School Sector 4"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-[#131b2e] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Short Name / Header Tag</label>
              <input
                type="text"
                required
                value={formData.shortName}
                onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="e.g. DPS Sec-4"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-[#131b2e] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Institution Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              >
                <option value="School">School (K-12)</option>
                <option value="College">College / Degree Institute</option>
                <option value="University">University Campus</option>
                <option value="Academy">Academy / Coaching Institute</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Affiliation Board</label>
              <input
                type="text"
                value={formData.boardName}
                onChange={e => setFormData({ ...formData, boardName: e.target.value })}
                placeholder="CBSE, ICSE, NAAC A++"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Affiliation Code / Registration</label>
              <input
                type="text"
                value={formData.affiliationCode}
                onChange={e => setFormData({ ...formData, affiliationCode: e.target.value })}
                placeholder="CBSE-2130092"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-mono text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logo, Branding & Color Palette */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
            <ImageIcon className="w-4 h-4 text-[#007d55]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">Logo & Visual Theme</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Logo Preview and Upload */}
            <div className="flex items-center gap-3">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#004ac6] shadow-xs shrink-0"
              />
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  Upload New Logo
                </button>
                <p className="text-[9px] text-[#737686]">PNG/JPG up to 2MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Direct Logo URL */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Or Direct Logo Web Image URL</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={e => {
                  setFormData({ ...formData, logoUrl: e.target.value });
                  setLogoPreview(e.target.value);
                }}
                placeholder="https://..."
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Primary Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full h-9 px-2 bg-[#f2f3ff] rounded-lg text-xs font-mono text-[#131b2e]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Accent Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-full h-9 px-2 bg-[#f2f3ff] rounded-lg text-xs font-mono text-[#131b2e]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Academic Session</label>
              <input
                type="text"
                value={formData.academicSession}
                onChange={e => setFormData({ ...formData, academicSession: e.target.value })}
                placeholder="2024-2025"
                className="w-full h-9 px-2.5 bg-[#f2f3ff] rounded-lg text-xs text-[#131b2e] border border-[#dae2fd]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                placeholder="₹, $, €"
                className="w-full h-9 px-2.5 bg-[#f2f3ff] rounded-lg text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Principal & Administration Info */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
            <UserCheck className="w-4 h-4 text-[#004ac6]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">Principal & Signatory Office</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Principal / Head Name</label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                placeholder="Dr. Anita Roy"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs sm:text-sm text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Executive Designation</label>
              <select
                value={formData.principalDesignation}
                onChange={e => setFormData({ ...formData, principalDesignation: e.target.value as any })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              >
                <option value="Principal">Principal</option>
                <option value="Dean">Dean</option>
                <option value="Director">Director</option>
                <option value="Headmaster">Headmaster</option>
                <option value="President">President</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Principal WhatsApp / Mobile</label>
              <input
                type="text"
                value={formData.principalWhatsApp}
                onChange={e => setFormData({ ...formData, principalWhatsApp: e.target.value })}
                placeholder="919876543210"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Campus Official Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Campus Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff]">
          <span className="text-[11px] sm:text-xs text-[#737686]">
            All updates instantly reflect across reports, WhatsApp messages, attendance registers, and export headers.
          </span>

          <button
            type="submit"
            className="h-10 sm:h-11 px-6 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs active:scale-95 transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{isAddingNewSchool ? 'Save & Add School' : 'Update School Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

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
} from 'lucide-react';

export const InstitutionCustomizerView: React.FC = () => {
  const { institution, updateInstitution, applyClientPreset, showToast } = useApp();
  const [formData, setFormData] = useState<InstitutionProfile>(institution);
  const [logoPreview, setLogoPreview] = useState<string>(institution.logoUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if institution in context changes
  const handlePresetSelect = (preset: InstitutionProfile) => {
    setFormData(preset);
    setLogoPreview(preset.logoUrl);
    applyClientPreset(preset.id);
    showToast(`Applied preset: ${preset.name}`);
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
    updateInstitution(formData);
    showToast(`Successfully updated & saved branding for "${formData.name}"!`);
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
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as InstitutionProfile;
          if (parsed.name && parsed.affiliationCode) {
            setFormData(parsed);
            setLogoPreview(parsed.logoUrl);
            updateInstitution(parsed);
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
              <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">School & College Customizer</h2>
              <p className="text-[11px] sm:text-xs text-[#737686]">White-label rebranding hub to customize and sell this platform to any school or college client.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={handleExportClientConfig}
              className="h-9 px-3 bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="truncate">Export JSON</span>
            </button>
            <label className="h-9 px-3 bg-[#dbe1ff] hover:bg-[#c7d2fe] text-[#004ac6] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span className="truncate">Import Config</span>
              <input type="file" accept=".json" onChange={handleImportClientConfig} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 1-Click Client Presets Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#004ac6]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Quick Client Presets</h3>
          </div>
          <span className="text-[10px] bg-[#dbe1ff] text-[#004ac6] font-bold px-2 py-0.5 rounded-full">
            1-Click Demo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {CLIENT_PRESETS.map(preset => {
            const isSelected = formData.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 text-left active:scale-95 ${
                  isSelected
                    ? 'border-[#004ac6] bg-[#004ac6]/5 ring-2 ring-[#004ac6]/20'
                    : 'border-[#eaedff] bg-[#faf8ff] hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={preset.logoUrl}
                    alt={preset.shortName}
                    className="w-8 h-8 rounded-lg object-cover border border-[#dae2fd] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-[#131b2e] truncate">{preset.shortName}</h4>
                    <span className="text-[10px] text-[#737686] block truncate">{preset.category} • {preset.boardName.split(' ')[0]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#dae2fd]/40 text-[10px]">
                  <span className="text-[#737686] truncate">{preset.principalDesignation}: {preset.principalName.split(' ')[0]}</span>
                  <span className={`font-bold ${isSelected ? 'text-[#004ac6]' : 'text-[#737686]'}`}>
                    {isSelected ? 'Active' : 'Apply'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Branding Form + Live Preview */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left 2 Columns: Editable Inputs */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Logo Replacement Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
              <ImageIcon className="w-4 h-4 text-[#004ac6]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Replace Institution Logo</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="relative group shrink-0">
                <img
                  src={logoPreview}
                  alt="Institution Logo Preview"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#004ac6]/30 shadow-xs bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold active:scale-95"
                >
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span>Upload</span>
                </button>
              </div>

              <div className="flex-1 space-y-2 text-left w-full">
                <h4 className="font-bold text-xs text-[#131b2e]">Upload Custom School / College Logo</h4>
                <p className="text-[10px] sm:text-[11px] text-[#737686]">
                  Supports PNG, JPG, SVG, and WebP (up to 2MB). This logo will appear on all headers, PDF report cards, and student ID cards.
                </p>
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3.5 bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const sample = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80';
                      setLogoPreview(sample);
                      setFormData(prev => ({ ...prev, logoUrl: sample }));
                      showToast('Reset to default academic crest');
                    }}
                    className="h-9 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] text-xs font-bold rounded-xl border border-[#dae2fd] active:scale-95"
                  >
                    Reset Logo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Core Profile Details */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
              <School className="w-4 h-4 text-[#004ac6]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Institution Identity & Board</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Full Institution Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd] focus:bg-white"
                  placeholder="e.g. Delhi Public School / St. Xavier's College"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Short Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.shortName}
                  onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd] focus:bg-white"
                  placeholder="e.g. DPS Sector 4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Institution Type</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd]"
                >
                  <option value="School">School (K-12)</option>
                  <option value="College">Degree College</option>
                  <option value="University">University / Engineering</option>
                  <option value="Academy">Coaching / Academy</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Board / Accreditation / Council</label>
                <input
                  type="text"
                  value={formData.boardName}
                  onChange={e => setFormData({ ...formData, boardName: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                  placeholder="e.g. CBSE / ICSE / Autonomous / UGC / AICTE"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Affiliation Code</label>
                <input
                  type="text"
                  value={formData.affiliationCode}
                  onChange={e => setFormData({ ...formData, affiliationCode: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd] focus:bg-white"
                  placeholder="e.g. CBSE/AFF/2130492"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Academic Session / Term</label>
                <input
                  type="text"
                  value={formData.academicSession}
                  onChange={e => setFormData({ ...formData, academicSession: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                  placeholder="e.g. 2024 - 2025 (Term 2)"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Motto / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                placeholder="e.g. Service Before Self • Excellence in Academics"
              />
            </div>
          </div>

          {/* Principal & Executive Authorities */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
              <UserCheck className="w-4 h-4 text-[#007d55]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Executive Authority (Principal / Dean)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Authority Title</label>
                <select
                  value={formData.principalDesignation}
                  onChange={e => setFormData({ ...formData, principalDesignation: e.target.value as any })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd]"
                >
                  <option value="Principal">Principal</option>
                  <option value="Dean">Dean</option>
                  <option value="Director">Director</option>
                  <option value="Headmaster">Headmaster</option>
                  <option value="President">President</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Principal / Dean Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.principalName}
                  onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd] focus:bg-white"
                  placeholder="e.g. Dr. Anita Roy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Principal WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.principalWhatsApp}
                  onChange={e => setFormData({ ...formData, principalWhatsApp: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd] focus:bg-white"
                  placeholder="+919876543200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Principal Official Email</label>
                <input
                  type="email"
                  required
                  value={formData.principalEmail}
                  onChange={e => setFormData({ ...formData, principalEmail: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                  placeholder="principal@school.edu.in"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
              <MapPin className="w-4 h-4 text-[#004ac6]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Campus Contact & Location</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">General Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">General Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Website URL</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Campus Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                placeholder="Full address included in PDF footers"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Branding Mockup Preview & Save */}
        <div className="space-y-3 sm:space-y-4">
          {/* Live Header Mockup */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
              <span className="text-xs font-bold text-[#131b2e]">Live Client Preview</span>
              <span className="px-2 py-0.5 bg-[#bdffdb] text-[#002113] font-bold text-[10px] rounded-full">
                Real-Time
              </span>
            </div>

            {/* App Header Preview */}
            <div className="p-2.5 sm:p-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl border border-[#dae2fd] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#737686]">App Top Header</span>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-xs">
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-8 h-8 rounded-lg object-cover border border-[#dae2fd] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-[#131b2e] truncate">{formData.shortName}</span>
                    <span className="text-[9px] font-bold bg-[#dbe1ff] text-[#004ac6] px-1 rounded">PRO</span>
                  </div>
                  <span className="text-[10px] text-[#737686] truncate block">{formData.boardName.split(' ')[0]} • {formData.academicSession}</span>
                </div>
              </div>
            </div>

            {/* PDF Report Header Preview */}
            <div className="p-3 bg-[#004ac6] text-white rounded-xl sm:rounded-2xl space-y-1 text-center shadow-xs">
              <span className="text-[9px] uppercase font-bold text-white/70 block">PDF Report Header</span>
              <h4 className="font-bold text-xs leading-tight truncate">{formData.name.toUpperCase()}</h4>
              <p className="text-[9px] text-white/80 truncate">{formData.boardName} • {formData.affiliationCode}</p>
              <p className="text-[8.5px] text-white/70 truncate">{formData.address}</p>
            </div>

            {/* WhatsApp Notification Preview */}
            <div className="p-2.5 sm:p-3 bg-[#007d55]/10 border border-[#007d55]/30 rounded-xl sm:rounded-2xl space-y-1 text-left">
              <span className="text-[9px] font-bold uppercase text-[#007d55] flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                WhatsApp Parent Alert Template
              </span>
              <div className="bg-white p-2 rounded-xl text-[10px] text-[#131b2e] leading-relaxed shadow-xs font-mono">
                <strong className="text-[#007d55] block truncate">{formData.name.toUpperCase()}</strong>
                <span>Dear Parent, here is the updated attendance for your ward: <strong>92.5%</strong>. Verified by <strong>{formData.principalDesignation} {formData.principalName}</strong>.</span>
              </div>
            </div>

            {/* Submit Save Button */}
            <button
              type="submit"
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] hover:opacity-95 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Branding</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

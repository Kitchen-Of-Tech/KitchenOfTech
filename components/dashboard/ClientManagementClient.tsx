"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  LayoutGrid,
  Table2,
  Upload,
} from 'lucide-react';
import type { ClientRecord, ClientMediaItem, ClientSocialLink, User } from '@/types/auth';
import { COUNTRIES } from '@/lib/constants/countries';
import { cn } from '@/lib/utils';

interface ClientManagementClientProps {
  currentUser: User;
}

interface ClientOption {
  id: string;
  name: string;
}

interface ClientFormState {
  client_status: ClientRecord['client_status'];
  possibility: ClientRecord['possibility'];
  client_name: string;
  business_name: string;
  client_description: string;
  client_business_type: string;
  client_found_from: string;
  important_links: string;
  social_links: ClientSocialLink[];
  phone_numbers: string;
  whatsapp_numbers: string;
  imo_numbers: string;
  emails: string;
  country: string;
  address: string;
  consultation_time_local: string;
  consultation_timezone: string;
  consultation_time_bdt: string;
  cold_email: string;
  cold_message: string;
  follow_up_emails: string[];
  follow_up_messages: string[];
  comment: string;
  client_media: ClientMediaItem[];
}

const CLIENT_STATUSES: ClientRecord['client_status'][] = [
  'Initial',
  '1st Attack',
  'Fellows',
  'Attack Plan Done',
  'Replied',
  'Project Planning',
  'Project Revision',
  'Project Running',
  'Re Follow Up',
  'Cold',
  'Connected',
  'Re Cold',
  'Follow Up',
  'Black Listed',
  'Not Client',
  'Client',
];

const POSSIBILITIES: ClientRecord['possibility'][] = ['High', 'Medium', 'Low'];

const DEFAULT_FORM_STATE: ClientFormState = {
  client_status: 'Initial',
  possibility: 'Medium',
  client_name: '',
  business_name: '',
  client_description: '',
  client_business_type: '',
  client_found_from: '',
  important_links: '',
  social_links: [{ platform: '', url: '' }],
  phone_numbers: '',
  whatsapp_numbers: '',
  imo_numbers: '',
  emails: '',
  country: '',
  address: '',
  consultation_time_local: '',
  consultation_timezone: 'Asia/Dhaka',
  consultation_time_bdt: '',
  cold_email: '',
  cold_message: '',
  follow_up_emails: [''],
  follow_up_messages: [''],
  comment: '',
  client_media: [],
};

const MAX_MEDIA_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ClientManagementClient({ currentUser }: ClientManagementClientProps) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPossibility, setFilterPossibility] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterBusinessType, setFilterBusinessType] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  const [businessTypes, setBusinessTypes] = useState<ClientOption[]>([]);
  const [sources, setSources] = useState<ClientOption[]>([]);
  const [newBusinessType, setNewBusinessType] = useState('');
  const [newSource, setNewSource] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const isModalOpen = showCreateModal || showEditModal || showViewModal;

  const [form, setForm] = useState<ClientFormState>(DEFAULT_FORM_STATE);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timeZones = useMemo(() => {
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      return Intl.supportedValuesOf('timeZone');
    }
    return ['Asia/Dhaka', 'Asia/Kolkata', 'Europe/London', 'America/New_York'];
  }, []);

  useEffect(() => {
    fetchClients();
    fetchOptions();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/clients/options');
      if (response.ok) {
        const data = await response.json();
        setBusinessTypes(data.businessTypes || []);
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM_STATE);
  };

  const splitLines = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  const joinLines = (value?: string[]) => (value && value.length ? value.join('\n') : '');

  const formatErrorMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
      if (parsed && typeof parsed === 'object') {
        if ('message' in parsed) return String(parsed.message);
        if ('errors' in parsed && Array.isArray(parsed.errors)) return parsed.errors.join(', ');
        if ('fieldErrors' in parsed && parsed.fieldErrors && typeof parsed.fieldErrors === 'object') {
          return Object.values(parsed.fieldErrors).flat().join(', ');
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    return message;
  };

  const getTimeZoneOffset = (date: Date, timeZone: string) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
    const asUTC = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    return asUTC - date.getTime();
  };

  const convertToBangladeshTime = (localValue: string, timeZone: string) => {
    if (!localValue || !timeZone) return '';
    const [datePart, timePart] = localValue.split('T');
    if (!datePart || !timePart) return '';
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const offset = getTimeZoneOffset(utcDate, timeZone);
    const zonedUtc = new Date(utcDate.getTime() - offset);
    const bdtFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return bdtFormatter.format(zonedUtc);
  };

  const handleConsultationUpdate = (updates: Partial<ClientFormState>) => {
    const nextForm = { ...form, ...updates };
    const bdt = convertToBangladeshTime(nextForm.consultation_time_local, nextForm.consultation_timezone);
    setForm({ ...nextForm, consultation_time_bdt: bdt });
  };

  const buildPayload = () => ({
    client_status: form.client_status,
    possibility: form.possibility,
    client_name: form.client_name.trim(),
    business_name: form.business_name.trim(),
    client_description: form.client_description.trim() || undefined,
    client_business_type: form.client_business_type || undefined,
    client_found_from: form.client_found_from || undefined,
    client_media: form.client_media,
    important_links: splitLines(form.important_links),
    social_links: form.social_links.filter((link) => link.platform && link.url),
    phone_numbers: splitLines(form.phone_numbers),
    whatsapp_numbers: splitLines(form.whatsapp_numbers),
    imo_numbers: splitLines(form.imo_numbers),
    emails: splitLines(form.emails),
    country: form.country || undefined,
    address: form.address.trim() || undefined,
    consultation_time_local: form.consultation_time_local || undefined,
    consultation_timezone: form.consultation_timezone || undefined,
    consultation_time_bdt: form.consultation_time_bdt || undefined,
    cold_email: form.cold_email.trim() || undefined,
    cold_message: form.cold_message.trim() || undefined,
    follow_up_emails: form.follow_up_emails.map((value) => value.trim()).filter(Boolean),
    follow_up_messages: form.follow_up_messages.map((value) => value.trim()).filter(Boolean),
    comment: form.comment.trim() || undefined,
  });

  const handleCreateClient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.client_name.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!form.business_name.trim()) {
      setError('Business name is required.');
      return;
    }
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ? JSON.stringify(data.error) : 'Failed to create client');
      }

      setSuccess('Client created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClient) return;
    if (!form.client_name.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!form.business_name.trim()) {
      setError('Business name is required.');
      return;
    }
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ? JSON.stringify(data.error) : 'Failed to update client');
      }

      setSuccess('Client updated successfully!');
      setShowEditModal(false);
      setSelectedClient(null);
      fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete client');
      }

      setSuccess('Client deleted successfully!');
      setShowDeleteModal(false);
      setSelectedClient(null);
      fetchClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddOption = async (type: 'businessType' | 'source', value: string) => {
    if (!value.trim()) return;

    try {
      const response = await fetch('/api/clients/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name: value.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'businessType') {
          setBusinessTypes((prev) => [...prev, data.option]);
          setForm((prev) => ({ ...prev, client_business_type: data.option.name }));
          setNewBusinessType('');
        } else {
          setSources((prev) => [...prev, data.option]);
          setForm((prev) => ({ ...prev, client_found_from: data.option.name }));
          setNewSource('');
        }
      }
    } catch (err) {
      console.error('Failed to add option:', err);
    }
  };

  const openEditModal = (client: ClientRecord) => {
    setSelectedClient(client);
    setForm({
      client_status: client.client_status,
      possibility: client.possibility,
      client_name: client.client_name || '',
      business_name: client.business_name || '',
      client_description: client.client_description || '',
      client_business_type: client.client_business_type || '',
      client_found_from: client.client_found_from || '',
      important_links: joinLines(client.important_links),
      social_links: client.social_links && client.social_links.length > 0 ? client.social_links : [{ platform: '', url: '' }],
      phone_numbers: joinLines(client.phone_numbers),
      whatsapp_numbers: joinLines(client.whatsapp_numbers),
      imo_numbers: joinLines(client.imo_numbers),
      emails: joinLines(client.emails),
      country: client.country || '',
      address: client.address || '',
      consultation_time_local: client.consultation_time_local || '',
      consultation_timezone: client.consultation_timezone || 'Asia/Dhaka',
      consultation_time_bdt: client.consultation_time_bdt || '',
      cold_email: client.cold_email || '',
      cold_message: client.cold_message || '',
      follow_up_emails: client.follow_up_emails && client.follow_up_emails.length > 0 ? client.follow_up_emails : [''],
      follow_up_messages: client.follow_up_messages && client.follow_up_messages.length > 0 ? client.follow_up_messages : [''],
      comment: client.comment || '',
      client_media: client.client_media || [],
    });
    setShowEditModal(true);
  };

  const updateFollowUpEmail = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.follow_up_emails];
      next[index] = value;
      return { ...prev, follow_up_emails: next };
    });
  };

  const updateFollowUpMessage = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.follow_up_messages];
      next[index] = value;
      return { ...prev, follow_up_messages: next };
    });
  };

  const addFollowUpEmail = () => {
    setForm((prev) => ({
      ...prev,
      follow_up_emails: [...prev.follow_up_emails, ''],
    }));
  };

  const addFollowUpMessage = () => {
    setForm((prev) => ({
      ...prev,
      follow_up_messages: [...prev.follow_up_messages, ''],
    }));
  };

  const removeFollowUpEmail = (index: number) => {
    setForm((prev) => ({
      ...prev,
      follow_up_emails: prev.follow_up_emails.filter((_, i) => i !== index),
    }));
  };

  const removeFollowUpMessage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      follow_up_messages: prev.follow_up_messages.filter((_, i) => i !== index),
    }));
  };

  const handleOverlayWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Ensure the overlay itself scrolls when wheel events occur (fallback if a smooth-scroller intercepts).
    const el = e.currentTarget as HTMLDivElement;
    if (!el) return;
    // Scroll the overlay by the wheel delta
    el.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMediaUpload = async (files: FileList | null) => {
    if (!files) return;
    const compressedItems: ClientMediaItem[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, or WEBP images are allowed.');
        continue;
      }
      if (file.size > MAX_MEDIA_SIZE) {
        setError('Images must be under 5MB before compression.');
        continue;
      }

      const compressed = await compressImage(file);
      if (compressed) {
        compressedItems.push(compressed);
      }
    }

    if (compressedItems.length > 0) {
      setForm((prev) => ({ ...prev, client_media: [...prev.client_media, ...compressedItems] }));
    }
  };

  const compressImage = (file: File): Promise<ClientMediaItem | null> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1600;
          const scale = Math.min(1, maxWidth / img.width);
          const width = img.width * scale;
          const height = img.height * scale;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }
              const blobReader = new FileReader();
              blobReader.onload = () => {
                resolve({
                  name: file.name,
                  type: blob.type,
                  dataUrl: blobReader.result as string,
                  size: blob.size,
                });
              };
              blobReader.readAsDataURL(blob);
            },
            'image/webp',
            0.75
          );
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const removeMediaItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      client_media: prev.client_media.filter((_, i) => i !== index),
    }));
  };

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      social_links: [...prev.social_links, { platform: '', url: '' }],
    }));
  };

  const updateSocialLink = (index: number, field: keyof ClientSocialLink, value: string) => {
    setForm((prev) => {
      const nextLinks = [...prev.social_links];
      nextLinks[index] = { ...nextLinks[index], [field]: value };
      return { ...prev, social_links: nextLinks };
    });
  };

  const removeSocialLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  const openViewModal = (client: ClientRecord) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const renderList = (items?: string[]) => {
    if (!items || items.length === 0) return <span className="text-white/40">-</span>;
    return (
      <ul className="list-disc space-y-1 pl-4 text-white/80">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      client.client_id?.toLowerCase().includes(query) ||
      client.client_name?.toLowerCase().includes(query) ||
      client.business_name?.toLowerCase().includes(query) ||
      (client.emails || []).join(' ').toLowerCase().includes(query);

    const matchesStatus = filterStatus === 'all' || client.client_status === filterStatus;
    const matchesPossibility = filterPossibility === 'all' || client.possibility === filterPossibility;
    const matchesCountry = filterCountry === 'all' || client.country === filterCountry;
    const matchesBusinessType = filterBusinessType === 'all' || client.client_business_type === filterBusinessType;
    const matchesSource = filterSource === 'all' || client.client_found_from === filterSource;

    return (
      matchesQuery &&
      matchesStatus &&
      matchesPossibility &&
      matchesCountry &&
      matchesBusinessType &&
      matchesSource
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Database</h1>
          <p className="text-white/60">Track cold outreach and relationship status.</p>
          <p className="text-xs text-white/40 mt-1">Manager: {currentUser.full_name || currentUser.username}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
              viewMode === 'table' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            )}
          >
            <Table2 className="h-4 w-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
              viewMode === 'card' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-white"
          >
            <Plus className="h-4 w-4" />
            New Client
          </button>
        </div>
      </div>

      {!isModalOpen && success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, ID, email..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-white placeholder:text-white/40 focus:border-primary/50 focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="all">All Status</option>
            {CLIENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filterPossibility}
            onChange={(event) => setFilterPossibility(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="all">All Possibility</option>
            {POSSIBILITIES.map((possibility) => (
              <option key={possibility} value={possibility}>
                {possibility}
              </option>
            ))}
          </select>
          <select
            value={filterCountry}
            onChange={(event) => setFilterCountry(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="all">All Countries</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            value={filterBusinessType}
            onChange={(event) => setFilterBusinessType(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="all">All Business Types</option>
            {businessTypes.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
          <select
            value={filterSource}
            onChange={(event) => setFilterSource(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="all">All Sources</option>
            {sources.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-white/60">Loading clients...</div>
      ) : viewMode === 'table' ? (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3 text-left">Client ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Possibility</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="cursor-pointer text-white/80 hover:bg-white/5"
                  onClick={() => openViewModal(client)}
                >
                  <td className="px-4 py-3 font-semibold text-white">{client.client_id}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{client.client_name}</div>
                    <div className="text-white/40 text-xs">{client.business_name}</div>
                  </td>
                  <td className="px-4 py-3">{client.client_status}</td>
                  <td className="px-4 py-3">{client.possibility}</td>
                  <td className="px-4 py-3">{client.country || '-'}</td>
                  <td className="px-4 py-3">{new Date(client.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(client);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-white/70 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedClient(client);
                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-red-300 hover:text-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="glass cursor-pointer rounded-2xl border border-white/10 p-6 hover:border-white/20"
              onClick={() => openViewModal(client)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-white/40">{client.client_id}</div>
                  <h3 className="text-lg font-semibold text-white">{client.client_name}</h3>
                  <p className="text-sm text-white/60">{client.business_name}</p>
                </div>
                <div className="text-right text-xs text-white/40">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <div>Status: <span className="text-white">{client.client_status}</span></div>
                <div>Possibility: <span className="text-white">{client.possibility}</span></div>
                <div>Country: <span className="text-white">{client.country || '-'}</span></div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditModal(client);
                  }}
                  className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedClient(client);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="text-white/50">No clients found.</div>
          )}
        </div>
      )}

      {(showCreateModal || showEditModal) && (
        <div
          className="fixed inset-0 z-50 flex h-screen items-start justify-center overflow-y-scroll overscroll-contain bg-black/70 p-6"
          data-lenis-prevent
          onWheel={handleOverlayWheel}
        >
          <div className="w-full max-w-5xl overflow-x-hidden rounded-2xl border border-white/10 bg-[#0b0b11] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-semibold text-white">
                {showCreateModal ? 'Add New Client' : 'Edit Client'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedClient(null);
                }}
                className="rounded-lg p-2 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {formatErrorMessage(error)}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            <form onSubmit={showCreateModal ? handleCreateClient : handleEditClient} className="mt-6 w-full space-y-6">
              <div className="grid gap-4 md:grid-cols-2 min-w-0">
                <div>
                  <label className="text-sm text-white/60">Client Status</label>
                  <select
                    value={form.client_status}
                    onChange={(event) => setForm((prev) => ({ ...prev, client_status: event.target.value as ClientRecord['client_status'] }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    {CLIENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60">Possibility</label>
                  <select
                    value={form.possibility}
                    onChange={(event) => setForm((prev) => ({ ...prev, possibility: event.target.value as ClientRecord['possibility'] }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    {POSSIBILITIES.map((possibility) => (
                      <option key={possibility} value={possibility}>
                        {possibility}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60">Client Name</label>
                  <input
                    value={form.client_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, client_name: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Business Name</label>
                  <input
                    value={form.business_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, business_name: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-white/60">Client Description</label>
                  <textarea
                    value={form.client_description}
                    onChange={(event) => setForm((prev) => ({ ...prev, client_description: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Business Type</label>
                  <select
                    value={form.client_business_type}
                    onChange={(event) => setForm((prev) => ({ ...prev, client_business_type: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    <option value="">Select</option>
                    {businessTypes.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex gap-2 min-w-0">
                    <input
                      value={newBusinessType}
                      onChange={(event) => setNewBusinessType(event.target.value)}
                      placeholder="Add new business type"
                      className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddOption('businessType', newBusinessType)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-white/70"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Found From</label>
                  <select
                    value={form.client_found_from}
                    onChange={(event) => setForm((prev) => ({ ...prev, client_found_from: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    <option value="">Select</option>
                    {sources.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex gap-2 min-w-0">
                    <input
                      value={newSource}
                      onChange={(event) => setNewSource(event.target.value)}
                      placeholder="Add new source"
                      className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddOption('source', newSource)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-white/70"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Country</label>
                  <select
                    value={form.country}
                    onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    <option value="">Select</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60">Address</label>
                  <input
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Phone Numbers (multiple lines)</label>
                  <textarea
                    value={form.phone_numbers}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone_numbers: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">WhatsApp Numbers (multiple lines)</label>
                  <textarea
                    value={form.whatsapp_numbers}
                    onChange={(event) => setForm((prev) => ({ ...prev, whatsapp_numbers: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">IMO Numbers (multiple lines)</label>
                  <textarea
                    value={form.imo_numbers}
                    onChange={(event) => setForm((prev) => ({ ...prev, imo_numbers: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Emails (multiple lines)</label>
                  <textarea
                    value={form.emails}
                    onChange={(event) => setForm((prev) => ({ ...prev, emails: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Consultation Time (Client local)</label>
                  <input
                    type="datetime-local"
                    value={form.consultation_time_local}
                    onChange={(event) => handleConsultationUpdate({ consultation_time_local: event.target.value })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Client Timezone</label>
                  <select
                    value={form.consultation_timezone}
                    onChange={(event) => handleConsultationUpdate({ consultation_timezone: event.target.value })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    {timeZones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60">Bangladesh Time (auto)</label>
                  <input
                    value={form.consultation_time_bdt}
                    readOnly
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/60"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Important Links (one per line)</label>
                  <textarea
                    value={form.important_links}
                    onChange={(event) => setForm((prev) => ({ ...prev, important_links: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Social Media Links</label>
                  <div className="space-y-2">
                    {form.social_links.map((link, index) => (
                      <div key={`social-${index}`} className="flex gap-2">
                        <input
                          value={link.platform}
                          onChange={(event) => updateSocialLink(index, 'platform', event.target.value)}
                          placeholder="Platform"
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                        />
                        <input
                          value={link.url}
                          onChange={(event) => updateSocialLink(index, 'url', event.target.value)}
                          placeholder="https://"
                          className="flex-[2] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="rounded-lg border border-white/10 px-3 text-white/60"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="rounded-lg border border-white/10 px-3 py-2 text-white/70"
                    >
                      Add Social Link
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60">Client Photos & Media (compressed)</label>
                <div className="mt-2 rounded-lg border border-dashed border-white/20 p-4">
                  <input
                    type="file"
                    accept={ALLOWED_MEDIA_TYPES.join(',')}
                    multiple
                    onChange={(event) => handleMediaUpload(event.target.files)}
                    className="hidden"
                    id="client-media-upload"
                  />
                  <label htmlFor="client-media-upload" className="flex cursor-pointer items-center gap-2 text-white/70">
                    <Upload className="h-4 w-4" />
                    Upload and compress images
                  </label>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {form.client_media.map((media, index) => (
                      <div key={`${media.name}-${index}`} className="relative rounded-lg border border-white/10 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={media.dataUrl} alt={media.name} className="h-24 w-full rounded-md object-cover" />
                        <button
                          type="button"
                          onClick={() => removeMediaItem(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Cold Email</label>
                  <textarea
                    value={form.cold_email}
                    onChange={(event) => setForm((prev) => ({ ...prev, cold_email: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Cold Message</label>
                  <textarea
                    value={form.cold_message}
                    onChange={(event) => setForm((prev) => ({ ...prev, cold_message: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Follow Up Emails (multiple lines)</label>
                  <div className="mt-2 space-y-2">
                    {form.follow_up_emails.map((value, index) => (
                      <div key={`followup-email-${index}`} className="flex gap-2 min-w-0">
                        <textarea
                          value={value}
                          onChange={(event) => updateFollowUpEmail(index, event.target.value)}
                          placeholder="Follow up email"
                          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={() => removeFollowUpEmail(index)}
                          disabled={form.follow_up_emails.length === 1}
                          className="shrink-0 rounded-lg border border-white/10 px-3 text-white/60 disabled:opacity-40"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFollowUpEmail}
                      className="rounded-lg border border-white/10 px-3 py-2 text-white/70"
                    >
                      Add Follow Up Email
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Follow Up Messages (multiple lines)</label>
                  <div className="mt-2 space-y-2">
                    {form.follow_up_messages.map((value, index) => (
                      <div key={`followup-message-${index}`} className="flex gap-2 min-w-0">
                        <textarea
                          value={value}
                          onChange={(event) => updateFollowUpMessage(index, event.target.value)}
                          placeholder="Follow up message"
                          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                          rows={3}
                        />
                        <button
                          type="button"
                          onClick={() => removeFollowUpMessage(index)}
                          disabled={form.follow_up_messages.length === 1}
                          className="shrink-0 rounded-lg border border-white/10 px-3 text-white/60 disabled:opacity-40"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFollowUpMessage}
                      className="rounded-lg border border-white/10 px-3 py-2 text-white/70"
                    >
                      Add Follow Up Message
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedClient(null);
                  }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-gradient-primary px-5 py-2 text-white"
                >
                  {actionLoading ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedClient && (
        <div
          className="fixed inset-0 z-50 flex h-screen items-start justify-center overflow-y-scroll overscroll-contain bg-black/70 p-6"
          data-lenis-prevent
          onWheel={handleOverlayWheel}
        >
          <div className="w-full max-w-5xl overflow-x-hidden rounded-2xl border border-white/10 bg-[#0b0b11] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-white/40">{selectedClient.client_id}</p>
                <h2 className="text-2xl font-semibold text-white">{selectedClient.client_name}</h2>
                <p className="text-sm text-white/60">{selectedClient.business_name}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-lg p-2 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Status & Possibility</h3>
                  <div className="mt-3 space-y-2 text-sm text-white/70">
                    <div>Status: <span className="text-white">{selectedClient.client_status}</span></div>
                    <div>Possibility: <span className="text-white">{selectedClient.possibility}</span></div>
                    <div>Found From: <span className="text-white">{selectedClient.client_found_from || '-'}</span></div>
                    <div>Business Type: <span className="text-white">{selectedClient.client_business_type || '-'}</span></div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Contact</h3>
                  <div className="mt-3 space-y-3 text-sm text-white/70">
                    <div>
                      <div className="text-xs text-white/50">Phone Numbers</div>
                      {renderList(selectedClient.phone_numbers)}
                    </div>
                    <div>
                      <div className="text-xs text-white/50">WhatsApp Numbers</div>
                      {renderList(selectedClient.whatsapp_numbers)}
                    </div>
                    <div>
                      <div className="text-xs text-white/50">IMO Numbers</div>
                      {renderList(selectedClient.imo_numbers)}
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Emails</div>
                      {renderList(selectedClient.emails)}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Location</h3>
                  <div className="mt-3 space-y-2 text-sm text-white/70">
                    <div>Country: <span className="text-white">{selectedClient.country || '-'}</span></div>
                    <div>Address: <span className="text-white">{selectedClient.address || '-'}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Consultation Time</h3>
                  <div className="mt-3 space-y-2 text-sm text-white/70">
                    <div>Client Local: <span className="text-white">{selectedClient.consultation_time_local || '-'}</span></div>
                    <div>Timezone: <span className="text-white">{selectedClient.consultation_timezone || '-'}</span></div>
                    <div>Bangladesh Time: <span className="text-white">{selectedClient.consultation_time_bdt || '-'}</span></div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Links</h3>
                  <div className="mt-3 space-y-3 text-sm text-white/70">
                    <div>
                      <div className="text-xs text-white/50">Important Links</div>
                      {renderList(selectedClient.important_links)}
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Social Links</div>
                      {selectedClient.social_links && selectedClient.social_links.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-4 text-white/80">
                          {selectedClient.social_links.map((link, index) => (
                            <li key={`${link.platform}-${index}`}>
                              {link.platform}: {link.url}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Outreach</h3>
                  <div className="mt-3 space-y-3 text-sm text-white/70">
                    <div>
                      <div className="text-xs text-white/50">Cold Email</div>
                      <div className="text-white">{selectedClient.cold_email || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Cold Message</div>
                      <div className="text-white">{selectedClient.cold_message || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Follow Up Emails</div>
                      {renderList(selectedClient.follow_up_emails)}
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Follow Up Messages</div>
                      {renderList(selectedClient.follow_up_messages)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white">Comment</h3>
                <p className="mt-2 text-sm text-white/70">{selectedClient.comment || '-'}</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white">Media</h3>
                {selectedClient.client_media && selectedClient.client_media.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    {selectedClient.client_media.map((media, index) => (
                      <div key={`${media.name}-${index}`} className="rounded-lg border border-white/10 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={media.dataUrl} alt={media.name} className="h-24 w-full rounded-md object-cover" />
                        <div className="mt-2 text-xs text-white/60">{media.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-white/40">No media uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onWheel={handleOverlayWheel}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b11] p-6">
            <h3 className="text-xl font-semibold text-white">Delete Client</h3>
            <p className="mt-2 text-white/60">
              Are you sure you want to delete {selectedClient.client_name}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-white/70"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                className="rounded-lg bg-red-500 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

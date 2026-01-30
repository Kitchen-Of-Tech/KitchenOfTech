"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Upload, X, Plus } from 'lucide-react';
import Image from 'next/image';
import GoogleAd, { AdSlots } from '@/components/articles/GoogleAd';

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'ai-ml', label: 'AI & ML' },
  { value: 'cloud-computing', label: 'Cloud Computing' },
  { value: 'devops', label: 'DevOps' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'general-tech', label: 'General Tech' },
];

export default function SubmitArticlePage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general-tech');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/articles/submit');
    }
  }, [status, router]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!session || !title) return;

    const autoSave = setInterval(() => {
      const draft = {
        title,
        excerpt,
        content,
        category,
        tags,
        timestamp: Date.now(),
      };
      localStorage.setItem('article-draft', JSON.stringify(draft));
    }, 30000); // 30 seconds

    return () => clearInterval(autoSave);
  }, [session, title, excerpt, content, category, tags]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('article-draft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000; // 24 hours
      if (isRecent) {
        if (confirm('Found a saved draft. Would you like to restore it?')) {
          setTitle(draft.title || '');
          setExcerpt(draft.excerpt || '');
          setContent(draft.content || '');
          setCategory(draft.category || 'general-tech');
          setTags(draft.tags || []);
        }
      } else {
        localStorage.removeItem('article-draft');
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (title.length < 10 || title.length > 200) {
      alert('Title must be between 10 and 200 characters');
      return;
    }

    if (!content.trim()) {
      alert('Please enter article content');
      return;
    }

    if (content.length < 100) {
      alert('Article content must be at least 100 characters');
      return;
    }

    if (isDraft) {
      setSavingDraft(true);
    } else {
      setSubmitting(true);
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('excerpt', excerpt);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));
      formData.append('status', isDraft ? 'draft' : 'published');
      formData.append('readingTime', calculateReadingTime(content).toString());
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await fetch('/api/articles/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('article-draft');
        
        if (isDraft) {
          alert('Draft saved successfully!');
          setSavingDraft(false);
        } else {
          alert('Article published successfully!');
          router.push(`/articles/${data.slug}`);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit article');
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('Failed to submit article. Please try again.');
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  };

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {isPreview ? 'Preview Article' : 'Submit Your Article'}
          </h1>
        </div>

        {/* Top Banner Ad */}
        <div className="mb-6">
          <GoogleAd adSlot={AdSlots.SUBMIT_PAGE} adFormat="horizontal" />
        </div>

        <div className="max-w-4xl mx-auto">
          {!isPreview ? (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Title */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <label className="block text-white font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your article title..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <p className="text-white/40 text-sm mt-2">
                  {title.length}/200 characters
                </p>
              </div>

              {/* Excerpt */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <label className="block text-white font-medium mb-2">
                  Excerpt (Short Description)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of your article (shown in article cards)..."
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <p className="text-white/40 text-sm mt-2">
                  {excerpt.length}/300 characters
                </p>
              </div>

              {/* Cover Image */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <label className="block text-white font-medium mb-2">
                  Cover Image
                </label>
                {coverImagePreview ? (
                  <div className="relative">
                    <Image
                      src={coverImagePreview}
                      alt="Cover preview"
                      width={800}
                      height={400}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 text-white/40 mb-2" />
                    <p className="text-white/60 mb-1">Click to upload cover image</p>
                    <p className="text-white/40 text-sm">Max 5MB, JPG/PNG</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Category */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <label className="block text-white font-medium mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <label className="block text-white font-medium mb-2">
                  Tags (up to 10)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={tags.length >= 10}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <label className="block text-white font-medium mb-2">
                  Article Content <span className="text-red-400">*</span>
                </label>
                <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    <strong>Formatting Tips:</strong> Use Markdown syntax - **bold**, *italic*, 
                    # Heading, - Lists, [Link](url), `code`
                  </p>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here... You can use Markdown formatting."
                  rows={20}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-white/40 text-sm">
                    {content.length} characters • {calculateReadingTime(content)} min read
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsPreview(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={savingDraft || submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {savingDraft ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || savingDraft}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div>
              <button
                onClick={() => setIsPreview(false)}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editing
              </button>

              <div className="glass rounded-xl p-8 border border-white/10">
                {/* Preview Header */}
                {coverImagePreview && (
                  <Image
                    src={coverImagePreview}
                    alt={title}
                    width={1200}
                    height={600}
                    className="w-full h-96 object-cover rounded-lg mb-6"
                  />
                )}

                <div className="mb-4">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                    {CATEGORIES.find(c => c.value === category)?.label}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>

                {excerpt && (
                  <p className="text-xl text-white/70 mb-6">{excerpt}</p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-white/80">
                    {content}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/40 text-sm">
                    Reading time: {calculateReadingTime(content)} minutes
                  </p>
                </div>
              </div>

              {/* Preview Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={savingDraft || submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {savingDraft ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || savingDraft}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

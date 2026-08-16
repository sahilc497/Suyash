"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SponsorForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    website: "",
    campaign_type: "Dedicated Video Integration",
    product: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: insertError } = await supabase.from("sponsor_inquiries").insert([
      {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        website: formData.website || null,
        campaign_type: formData.campaign_type,
        product: formData.product || null,
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        message: formData.message || null,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 border border-green-200 bg-green-50 text-center">
        <h3 className="text-xl font-bold text-green-800 mb-2">Inquiry Sent Successfully!</h3>
        <p className="text-green-700">
          Thank you for reaching out. I've received your details and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 p-8 border border-[#dddddd] bg-white shadow-sm">
      <h3 className="text-2xl font-bold mb-2">Want to collaborate?</h3>
      <p className="text-[15px] text-[#666666] mb-8">
        I partner with brands that create excellent engineering tools, hardware, and software platforms. 
        Fill out the form below to inquire about sponsorships and integrations.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Your Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Company *</label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Company Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="https://"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333333] mb-1">Campaign Type</label>
          <select
            value={formData.campaign_type}
            onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
            className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors bg-white"
          >
            <option value="Dedicated Video Integration">Dedicated Video Integration (60-90s)</option>
            <option value="Full Video Sponsorship">Full Video Sponsorship</option>
            <option value="Instagram Reel / Short">Instagram Reel / YouTube Short</option>
            <option value="Website Article Sponsor">Website Article Sponsor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Product to Feature</label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Budget Range</label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. $1k - $3k"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-1">Timeline</label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="e.g. Q3 2026"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333333] mb-1">Additional Details</label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border border-[#cccccc] focus:border-blue-600 focus:outline-none transition-colors font-sans"
            placeholder="Tell me more about the goals of the campaign..."
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-[#111111] text-white font-semibold hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}

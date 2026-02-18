"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectResponse } from "./ProjectList";

const PRODUCT_CATEGORIES = [
  "SaaS",
  "E-commerce",
  "Mobile App",
  "Content / Media",
  "Agency",
  "Marketplace",
  "Developer Tools",
  "Other",
];

const PERSONAL_BRAND_CATEGORIES = [
  "Creator / Influencer",
  "Consultant",
  "Coach / Trainer",
  "Freelancer",
  "Speaker / Author",
  "Other",
];

interface ProjectFormProps {
  project?: ProjectResponse;
  type?: "PRODUCT" | "PERSONAL_BRAND";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({
  project,
  type,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const isEditing = !!project;
  const effectiveType = project?.type ?? type ?? "PRODUCT";
  const isBrand = effectiveType === "PERSONAL_BRAND";

  const categories = isBrand ? PERSONAL_BRAND_CATEGORIES : PRODUCT_CATEGORIES;

  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl ?? "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [mrr, setMrr] = useState(project?.mrr != null ? String(project.mrr) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const label = isBrand ? "Personal Brand" : "Product";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${label} name is required.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const normalizeUrl = (url: string) => {
        const trimmed = url.trim();
        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
      };

      const body = {
        name: name.trim(),
        description: description.trim() || null,
        websiteUrl: normalizeUrl(websiteUrl),
        imageUrl: normalizeUrl(imageUrl),
        category: category || null,
        type: effectiveType,
        mrr: mrr.trim() !== "" ? parseFloat(mrr) : null,
      };

      if (isEditing) {
        await apiClient.put(`/api/projects/${project.id}`, body);
      } else {
        await apiClient.post("/api/projects", body);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">
          {isEditing ? `Edit ${label}` : `New ${label}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">
              Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBrand ? "Your Brand Name" : "My SaaS Product"}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isBrand
                  ? "Brief description of your personal brand..."
                  : "Brief description of your product..."
              }
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
            />
          </div>

          <div>
            <Label htmlFor="websiteUrl" className="text-gray-700">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder={isBrand ? "yourbrand.com" : "myproduct.com"}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl" className="text-gray-700">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={isBrand ? "yourbrand.com/photo.png" : "myproduct.com/logo.png"}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 mt-1"
            />
          </div>

          {isEditing && (
            <div>
              <Label htmlFor="mrr" className="text-gray-700">
                MRR (Monthly Recurring Revenue) <span className="text-gray-400 font-normal">in USD</span>
              </Label>
              <Input
                id="mrr"
                type="number"
                min="0"
                step="0.01"
                value={mrr}
                onChange={(e) => setMrr(e.target.value)}
                placeholder="e.g. 1500"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="category" className="text-gray-700">
              Category
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : `Create ${label}`}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

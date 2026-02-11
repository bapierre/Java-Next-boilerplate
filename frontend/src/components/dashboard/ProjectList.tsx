"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProjectForm from "./ProjectForm";

interface ChannelResponse {
  id: number;
  platform: string;
  channelName: string;
  channelUrl: string | null;
  isActive: boolean;
  followerCount?: number | null;
  lastSyncedAt: string | null;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  category: string | null;
  type?: string;
  channels: ChannelResponse[];
  createdAt: string;
}

type FormType = "PRODUCT" | "PERSONAL_BRAND" | null;

interface ProjectListProps {
  email: string;
  onSignOut: () => void;
}

export default function ProjectList({ email, onSignOut }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<FormType>(null);

  const fetchProjects = async () => {
    try {
      setError(null);
      const data = await apiClient.get<ProjectResponse[]>("/api/projects");
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(
        "Could not connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreated = () => {
    setFormType(null);
    fetchProjects();
  };

  const personalBrands = projects.filter((p) => p.type === "PERSONAL_BRAND");
  const primaryBrand = personalBrands[0] ?? null;
  const additionalBrands = personalBrands.slice(1);
  const products = projects.filter((p) => p.type !== "PERSONAL_BRAND");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header: primary personal brand as user identity ── */}
      <header className="mb-8">
        {primaryBrand ? (
          <div className="flex items-center justify-between">
            <a
              href={`/dashboard/projects/${primaryBrand.id}`}
              className="flex items-center gap-4 group"
            >
              {primaryBrand.imageUrl ? (
                <img
                  src={primaryBrand.imageUrl}
                  alt={primaryBrand.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 group-hover:border-purple-400 transition-colors"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-purple-100 border-2 border-purple-200 group-hover:border-purple-400 transition-colors flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-7 h-7 text-purple-400"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {primaryBrand.name}
                </h1>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  {email}
                  {primaryBrand.category && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-purple-600">
                        {primaryBrand.category}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </a>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm">{email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        )}
      </header>

      {error && (
        <Card className="bg-white border-red-200 mb-6">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Setup personal brand prompt (no brand yet) ── */}
      {!primaryBrand && formType !== "PERSONAL_BRAND" && !error && (
        <Card className="bg-purple-50 border-purple-200 mb-8">
          <CardContent className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-purple-500"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm">
                  Set up your personal brand
                </p>
                <p className="text-gray-500 text-xs">
                  Add your name, photo, and connect your social channels.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setFormType("PERSONAL_BRAND")}
            >
              Set Up
            </Button>
          </CardContent>
        </Card>
      )}

      {formType === "PERSONAL_BRAND" && (
        <div className="mb-8">
          <ProjectForm
            type="PERSONAL_BRAND"
            onSuccess={handleCreated}
            onCancel={() => setFormType(null)}
          />
        </div>
      )}

      {/* ── Additional personal brands ── */}
      {additionalBrands.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Other Personal Brands
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormType("PERSONAL_BRAND")}
            >
              Add Brand
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {additionalBrands.map((brand) => (
              <a
                key={brand.id}
                href={`/dashboard/projects/${brand.id}`}
                className="block"
              >
                <Card className="bg-purple-50 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer h-full">
                  <CardContent className="flex items-center gap-3 py-4">
                    {brand.imageUrl ? (
                      <img
                        src={brand.imageUrl}
                        alt={brand.name}
                        className="w-10 h-10 rounded-full object-cover border border-purple-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-purple-400"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-gray-900 font-medium text-sm truncate">
                        {brand.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {brand.channels.length}{" "}
                        {brand.channels.length === 1
                          ? "channel"
                          : "channels"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── "Add Brand" button if primary exists but no additional + form not open ── */}
      {primaryBrand &&
        additionalBrands.length === 0 &&
        formType !== "PERSONAL_BRAND" && (
          <div className="flex justify-end mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
              onClick={() => setFormType("PERSONAL_BRAND")}
            >
              + Add another personal brand
            </Button>
          </div>
        )}

      {/* ── Products Section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Your Products
          </h2>
          <Button onClick={() => setFormType("PRODUCT")}>New Product</Button>
        </div>

        {formType === "PRODUCT" && (
          <div className="mb-6">
            <ProjectForm
              type="PRODUCT"
              onSuccess={handleCreated}
              onCancel={() => setFormType(null)}
            />
          </div>
        )}

        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((project) => (
              <a
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block"
              >
                <Card className="bg-white border-gray-200 hover:border-purple-300 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-gray-900 text-lg">
                        {project.name}
                      </CardTitle>
                      {project.category && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {project.category}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {project.channels.length}{" "}
                        {project.channels.length === 1
                          ? "channel"
                          : "channels"}{" "}
                        connected
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          formType !== "PRODUCT" && (
            <Card className="bg-white border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-gray-400 text-sm mb-3">
                  No products yet. Add your first product to start tracking.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormType("PRODUCT")}
                >
                  Create Product
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

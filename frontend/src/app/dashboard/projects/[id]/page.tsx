"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProjectForm from "@/components/dashboard/ProjectForm";
import {
  ConnectedSources,
  ConnectPlatformModal,
} from "@/components/dashboard/ChannelCatalog";
import type { ProjectResponse } from "@/components/dashboard/ProjectList";

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedPlatform, setConnectedPlatform] = useState<string | null>(
    null
  );

  const fetchProject = async () => {
    try {
      const data = await apiClient.get<ProjectResponse>(
        `/api/projects/${projectId}`
      );
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      setConnectedPlatform(connected);
      const timeout = setTimeout(() => setConnectedPlatform(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  const isBrand = project?.type === "PERSONAL_BRAND";
  const label = isBrand ? "personal brand" : "product";

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete this ${label}? This action cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await apiClient.delete(`/api/projects/${projectId}`);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to delete project:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Project not found.</p>
          <a
            href="/dashboard"
            className="text-purple-600 hover:underline text-sm mt-2 inline-block"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <ProjectForm
            project={project}
            onSuccess={() => {
              setEditing(false);
              fetchProject();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Nav + project header */}
        <a
          href="/dashboard"
          className="text-gray-500 hover:text-gray-900 text-sm mb-6 inline-block"
        >
          &larr; Back to dashboard
        </a>

        {connectedPlatform && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Successfully connected {connectedPlatform}! Token exchange is
            pending — the channel will become active once platform API
            integration is complete.
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {project.category && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {project.category}
                </span>
              )}
              {project.description && (
                <p className="text-gray-500 text-sm">{project.description}</p>
              )}
            </div>
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm mt-1 inline-block"
              >
                {project.websiteUrl}
              </a>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Connected sources */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Connected Sources
          </h3>
          <ConnectedSources
            projectId={project.id}
            channels={project.channels}
            onOpenModal={() => setShowConnectModal(true)}
            onChannelChange={fetchProject}
          />
        </div>

        {/* Graphs area (placeholder for future) */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Analytics
          </h3>
          <Card className="bg-white border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-gray-300 mb-3"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <p className="text-gray-400 text-sm">
                Analytics will appear here once your channels are active.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Connect platform modal */}
        {showConnectModal && (
          <ConnectPlatformModal
            projectId={project.id}
            connectedChannels={project.channels}
            onChannelChange={fetchProject}
            onClose={() => setShowConnectModal(false)}
          />
        )}
      </div>
    </div>
  );
}

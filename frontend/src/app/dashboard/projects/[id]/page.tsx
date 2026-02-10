"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProjectForm from "@/components/dashboard/ProjectForm";
import ChannelCatalog from "@/components/dashboard/ChannelCatalog";
import type { ProjectResponse } from "@/components/dashboard/ProjectList";

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      // Clear the query param after showing
      const timeout = setTimeout(() => setConnectedPlatform(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
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
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FFBE18] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-zinc-400">Project not found.</p>
          <a href="/dashboard" className="text-[#FFBE18] hover:underline text-sm mt-2 inline-block">
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] p-8">
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
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-4xl mx-auto">
        <a
          href="/dashboard"
          className="text-zinc-400 hover:text-white text-sm mb-6 inline-block"
        >
          &larr; Back to dashboard
        </a>

        {connectedPlatform && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm">
            Successfully connected {connectedPlatform}! Token exchange is
            pending — the channel will become active once platform API
            integration is complete.
          </div>
        )}

        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-2xl">
                  {project.name}
                </CardTitle>
                {project.category && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full mt-2 inline-block">
                    {project.category}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
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
          </CardHeader>
          <CardContent>
            {project.description && (
              <p className="text-zinc-400 mb-3">{project.description}</p>
            )}
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFBE18] hover:underline text-sm"
              >
                {project.websiteUrl}
              </a>
            )}
          </CardContent>
        </Card>

        <ChannelCatalog
          projectId={project.id}
          connectedChannels={project.channels}
          onChannelChange={fetchProject}
        />
      </div>
    </div>
  );
}

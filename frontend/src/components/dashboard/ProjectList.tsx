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
  lastSyncedAt: string | null;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  category: string | null;
  channels: ChannelResponse[];
  createdAt: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProjects = async () => {
    try {
      setError(null);
      const data = await apiClient.get<ProjectResponse[]>("/api/projects");
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Could not connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreated = () => {
    setShowForm(false);
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#FFBE18] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Your Products</h2>
        <Button onClick={() => setShowForm(true)}>New Product</Button>
      </div>

      {error && (
        <Card className="bg-zinc-900 border-red-800/50 mb-6">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="mb-6">
          <ProjectForm
            onSuccess={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {projects.length === 0 && !showForm && !error ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-zinc-400 mb-4">
              No products yet. Create your first product to start connecting channels.
            </p>
            <Button onClick={() => setShowForm(true)}>Create Product</Button>
          </CardContent>
        </Card>
      ) : projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block"
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">
                      {project.name}
                    </CardTitle>
                    {project.category && (
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                        {project.category}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>
                      {project.channels.length}{" "}
                      {project.channels.length === 1 ? "channel" : "channels"}{" "}
                      connected
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

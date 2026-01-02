"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, User as UserIcon, Mail } from "lucide-react";
import apiClient from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize state from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    // Set local preview state, do NOT upload yet
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let imageUrl = image;

      // Check if we have a file waiting to be uploaded
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await apiClient.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data.fileUrl;
        setUploading(false);
      }

      await apiClient.patch("/user/profile", { name, image: imageUrl });

      // Update session locally to reflect changes immediately
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          image: imageUrl,
        },
      });

      setIsEditing(false);
      setSelectedFile(null); // Clear pending file
      router.refresh(); // This triggers our new DB fetch in auth.ts
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!session) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>

        <div className="border rounded-lg p-8 bg-card shadow-sm space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="w-24 h-24 border sm:w-32 sm:h-32">
                <AvatarImage src={previewUrl || image} />
                <AvatarFallback className="text-2xl bg-muted">
                  {name?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={!isEditing || uploading}
            />

            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Change Picture
              </Button>
            )}
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="pl-10"
                />
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  value={session.user?.email || ""}
                  disabled
                  className="pl-10 bg-muted"
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <p className="text-[0.8rem] text-muted-foreground mt-1">
                  Email addresses cannot be changed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset fields
                    setName(session.user?.name || "");
                    setImage(session.user?.image || "");
                    setPreviewUrl("");
                    setSelectedFile(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading || uploading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

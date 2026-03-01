"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { updateUserProfile } from "@/lib/supabase/profile-utils"
import { updateAuthProfile } from "@/lib/supabase/auth-client"
import { toast } from "sonner"
import { Loader2, Save, User, Building2, Mail } from "lucide-react"

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    email: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name ?? profile.fullName ?? "",
        company_name: profile.company_name ?? "",
        email: profile.email || "",
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Updating profile:', formData)
      if (!user) {
        toast.error("Not authenticated")
        return
      }

      await updateAuthProfile({ full_name: formData.full_name })
      const { error } = await updateUserProfile({
        full_name: formData.full_name,
        company_name: formData.company_name || undefined,
      })
      if (error) throw new Error(error)

      console.log('Profile updated successfully, refreshing...')
      await refreshProfile()
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error('Profile update exception:', error)
      toast.error("An error occurred", {
        description: error instanceof Error ? error.message : "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatarUrl || ""} alt={profile?.fullName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                        {getInitials(profile?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{profile?.fullName || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="company_name" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company Name
                      </Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="text-sm font-mono">{user?.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member Since</Label>
                    <p className="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  )
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { IconLock, IconCheck } from "@tabler/icons-react";
import { changePassword } from "@/services/authService";

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const result = await changePassword(currentPassword, newPassword);

    if (result.success) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error || "Failed to change password.");
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg py-6 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconLock className="h-5 w-5 text-primary" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your account password. You'll need your current password to make this change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
              <IconCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Your password has been changed successfully.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setSuccess(false);
                  }}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setSuccess(false);
                  }}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 8 characters
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setSuccess(false);
                  }}
                  required
                  minLength={8}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </Field>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
                {isLoading ? "Changing password..." : "Change password"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

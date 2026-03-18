import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { IconArrowLeft, IconCheck, IconPhone, IconMail } from "@tabler/icons-react";
import { forgotPassword } from "@/services/authService";

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [channel, setChannel] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await forgotPassword(identifier);

    if (result.success) {
      setSuccess(true);
      setChannel(result.channel ?? null);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>
            Enter your phone number or email address and we'll send you a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <IconCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    New password sent
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {channel === "sms"
                      ? "A new password has been sent to your phone via SMS."
                      : channel === "email"
                        ? "A new password has been sent to your email address."
                        : "A new password has been sent to your registered contact."}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    You can change this password after logging in.
                  </p>
                </div>
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="identifier">Phone number or email</FieldLabel>
                  <div className="relative">
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="+254 7XX XXX XXX or email@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="pl-10"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      {identifier.includes("@") ? (
                        <IconMail className="h-4 w-4" />
                      ) : (
                        <IconPhone className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </Field>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || !identifier.trim()}>
                  {isLoading ? "Sending..." : "Send new password"}
                </Button>
              </FieldGroup>
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <IconArrowLeft className="mr-1 h-3 w-3" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

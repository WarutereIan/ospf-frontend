import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useUserRole } from "@/contexts/UserRoleContext";
import { IconInfoCircle, IconCopy, IconCheck } from "@tabler/icons-react";
import type { UserRole } from "@/contexts/UserRoleContext";

// Mock credentials for different user roles
const MOCK_CREDENTIALS: Record<string, { role: UserRole; name: string; phone: string; password: string }> = {
  farmer: {
    role: "farmer",
    name: "John Mutua",
    phone: "+254712345678",
    password: "farmer123",
  },
  buyer: {
    role: "buyer",
    name: "Sarah Mwangi",
    phone: "+254723456789",
    password: "buyer123",
  },
  officer: {
    role: "officer",
    name: "David Kimani",
    phone: "+254734567890",
    password: "officer123",
  },
  staff: {
    role: "staff",
    name: "Mary Wanjiku",
    phone: "+254745678901",
    password: "staff123",
  },
  aggregation_manager: {
    role: "aggregation_manager",
    name: "Peter Kariuki",
    phone: "+254756789012",
    password: "manager123",
  },
  input_provider: {
    role: "input_provider",
    name: "Grace Njeri",
    phone: "+254767890123",
    password: "input123",
  },
  transport_provider: {
    role: "transport_provider",
    name: "James Omondi",
    phone: "+254778901234",
    password: "transport123",
  },
};

export function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setRole, setUserId } = useUserRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");

    // Check against mock credentials
    const credential = Object.values(MOCK_CREDENTIALS).find(
      (cred) => cred.phone === normalizedPhone || cred.phone.replace(/\s+/g, "") === normalizedPhone
    );

    if (credential && credential.password === password) {
      // Set user role and navigate to dashboard
      setRole(credential.role);
      setUserId(`mock-${credential.role}-${Date.now()}`);
      
      // Navigate to dashboard (which will redirect to role-specific dashboard)
      navigate("/dashboard");
    } else {
      setError("Invalid phone number or password. Please check the mock credentials below.");
    }
  };

  const copyCredential = (role: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedCredential(`${role}-${value}`);
    setTimeout(() => setCopiedCredential(null), 2000);
  };

  const fillCredential = (credential: typeof MOCK_CREDENTIALS[string]) => {
    setPhone(credential.phone);
    setPassword(credential.password);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your OFSP Marketplace account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </FieldGroup>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Mock Credentials Display */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <IconInfoCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-bold">Mock Login Credentials</CardTitle>
            </div>
            <CardDescription>
              Use these credentials to explore different user roles and their dashboards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(MOCK_CREDENTIALS).map(([key, cred]) => (
              <div
                key={key}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize">
                        {cred.role.replace("_", " ")}
                      </Badge>
                      <span className="text-sm font-medium">{cred.name}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fillCredential(cred)}
                    className="h-7 text-xs"
                  >
                    Fill
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {cred.phone}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCredential(key, cred.phone)}
                      >
                        {copiedCredential === `${key}-${cred.phone}` ? (
                          <IconCheck className="h-3 w-3 text-green-600" />
                        ) : (
                          <IconCopy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {cred.password}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCredential(key, cred.password)}
                      >
                        {copiedCredential === `${key}-${cred.password}` ? (
                          <IconCheck className="h-3 w-3 text-green-600" />
                        ) : (
                          <IconCopy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Click "Fill" to auto-populate the login form, or copy individual credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

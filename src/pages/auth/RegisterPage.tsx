import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const userRoles = [
  { label: "OFSP Farmer", value: "farmer" },
  { label: "Buyer", value: "buyer" },
  { label: "County Officer", value: "officer" },
  { label: "Aggregation Manager", value: "manager" },
];

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="relative w-full max-w-md">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/80 backdrop-blur-sm">
          <div className="mx-4 rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/50 px-6 py-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">Coming Soon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Registration is not yet available. Please contact the concerned admin for more information.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
        <CardHeader className="space-y-1 opacity-50 pointer-events-none">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Register for OFSP Marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="opacity-50 pointer-events-none">
          <form className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">I am a</FieldLabel>
                <Select items={userRoles} defaultValue={null}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              </Field>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


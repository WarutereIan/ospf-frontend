import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconShieldCheck,
  IconCreditCard,
  IconBuildingBank,
  IconDeviceMobile,
  IconMapPin,
  IconCheck,
  IconLoader2,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, updateMyProfile, sendOtp, verifyOtp } from "@/services/userService";
import { showSuccess, showError } from "@/lib/toast";

interface ProfileData {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    county?: string;
    subCounty?: string;
    ward?: string;
    village?: string;
    address?: string;
    alternatePhone?: string;
    nationalId?: string;
    bankName?: string;
    bankAccount?: string;
    mpesaNumber?: string;
    businessName?: string;
    businessRegNo?: string;
    farmSize?: number;
    bio?: string;
  };
}

type OtpPurpose = "PHONE_CHANGE" | "EMAIL_CHANGE";

export function ProfileSettingsPage() {
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer" || user?.role === "lead_farmer";

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Basic info editing
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({
    firstName: "",
    lastName: "",
    county: "",
    subCounty: "",
    ward: "",
    village: "",
    address: "",
    alternatePhone: "",
    bio: "",
  });
  const [savingBasic, setSavingBasic] = useState(false);

  // Secure field (OTP) editing
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose | null>(null);
  const [newSecureValue, setNewSecureValue] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpChannel, setOtpChannel] = useState("");
  const [otpMaskedTarget, setOtpMaskedTarget] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Payment details editing
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    bankName: "",
    bankAccount: "",
    mpesaNumber: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getMyProfile();
      setProfileData(data as any);
      const p = (data as any).profile || {};
      setBasicForm({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        county: p.county || "",
        subCounty: p.subCounty || "",
        ward: p.ward || "",
        village: p.village || "",
        address: p.address || "",
        alternatePhone: p.alternatePhone || "",
        bio: p.bio || "",
      });
      setPaymentForm({
        bankName: p.bankName || "",
        bankAccount: p.bankAccount || "",
        mpesaNumber: p.mpesaNumber || "",
      });
    } catch {
      showError("Error", "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBasic = async () => {
    setSavingBasic(true);
    try {
      await updateMyProfile(basicForm);
      showSuccess("Profile Updated", "Your profile details have been saved");
      setEditingBasic(false);
      await loadProfile();
    } catch {
      showError("Error", "Failed to update profile");
    } finally {
      setSavingBasic(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpPurpose || !newSecureValue.trim()) return;
    setSendingOtp(true);
    try {
      const result = await sendOtp(otpPurpose, newSecureValue.trim());
      setOtpSent(true);
      setOtpChannel(result.channel);
      setOtpMaskedTarget(result.maskedTarget);
      showSuccess("Code Sent", result.message);
    } catch (err: any) {
      showError("Error", err?.message || "Failed to send verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpPurpose || !otpCode.trim()) return;
    setVerifyingOtp(true);
    try {
      await verifyOtp(otpCode.trim(), otpPurpose);
      showSuccess("Updated", `${otpPurpose === "PHONE_CHANGE" ? "Phone number" : "Email"} updated successfully`);
      resetOtpState();
      await loadProfile();
    } catch (err: any) {
      showError("Verification Failed", err?.message || "Invalid code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetOtpState = () => {
    setOtpPurpose(null);
    setNewSecureValue("");
    setOtpCode("");
    setOtpSent(false);
    setOtpChannel("");
    setOtpMaskedTarget("");
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    try {
      await updateMyProfile(paymentForm);
      showSuccess("Payment Details Saved", "Your payment details have been updated");
      setEditingPayment(false);
      await loadProfile();
    } catch {
      showError("Error", "Failed to update payment details");
    } finally {
      setSavingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profile = profileData?.profile || {};

  return (
    <div className="mx-auto max-w-2xl py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account information and preferences</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconUser className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
            {!editingBasic ? (
              <Button variant="outline" size="sm" onClick={() => setEditingBasic(true)}>
                <IconPencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setEditingBasic(false)}>
                <IconX className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            )}
          </div>
          <CardDescription>Your name, location, and other details</CardDescription>
        </CardHeader>
        <CardContent>
          {editingBasic ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={basicForm.firstName} onChange={(e) => setBasicForm({ ...basicForm, firstName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={basicForm.lastName} onChange={(e) => setBasicForm({ ...basicForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">County</Label>
                  <Input id="county" value={basicForm.county} onChange={(e) => setBasicForm({ ...basicForm, county: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="subCounty">Sub-county</Label>
                  <Input id="subCounty" value={basicForm.subCounty} onChange={(e) => setBasicForm({ ...basicForm, subCounty: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ward">Ward</Label>
                  <Input id="ward" value={basicForm.ward} onChange={(e) => setBasicForm({ ...basicForm, ward: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" value={basicForm.village} onChange={(e) => setBasicForm({ ...basicForm, village: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={basicForm.address} onChange={(e) => setBasicForm({ ...basicForm, address: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="alternatePhone">Alternate phone</Label>
                <Input id="alternatePhone" value={basicForm.alternatePhone} onChange={(e) => setBasicForm({ ...basicForm, alternatePhone: e.target.value })} placeholder="+254..." />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" value={basicForm.bio} onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })} placeholder="Brief description..." />
              </div>
              <Button onClick={handleSaveBasic} disabled={savingBasic} className="w-full">
                {savingBasic ? <><IconLoader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow label="Name" value={[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Not set"} />
              <InfoRow label="County" value={profile.county || "Not set"} />
              <InfoRow label="Sub-county" value={profile.subCounty || "Not set"} />
              <InfoRow label="Ward" value={profile.ward || "Not set"} />
              <InfoRow label="Village" value={profile.village || "Not set"} />
              {profile.address && <InfoRow label="Address" value={profile.address} />}
              {profile.alternatePhone && <InfoRow label="Alternate phone" value={profile.alternatePhone} />}
              {profile.bio && <InfoRow label="Bio" value={profile.bio} />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secure Fields (Phone & Email) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconShieldCheck className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Account Security</CardTitle>
          </div>
          <CardDescription>Phone and email changes require verification via a one-time code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current values */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <IconPhone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone number</p>
                  <p className="text-sm text-muted-foreground">{profileData?.phone || "Not set"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { resetOtpState(); setOtpPurpose("PHONE_CHANGE"); }}
                disabled={otpPurpose !== null}
              >
                Change
              </Button>
            </div>
            <div className="border-t" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <IconMail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email address</p>
                  <p className="text-sm text-muted-foreground">{profileData?.email || "Not set"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { resetOtpState(); setOtpPurpose("EMAIL_CHANGE"); }}
                disabled={otpPurpose !== null}
              >
                Change
              </Button>
            </div>
          </div>

          {/* OTP Flow */}
          {otpPurpose && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {otpPurpose === "PHONE_CHANGE" ? "Change Phone Number" : "Change Email Address"}
                </p>
                <Button variant="ghost" size="sm" onClick={resetOtpState}>
                  <IconX className="h-4 w-4" />
                </Button>
              </div>

              {!otpSent ? (
                <>
                  <div>
                    <Label>{otpPurpose === "PHONE_CHANGE" ? "New phone number" : "New email address"}</Label>
                    <Input
                      type={otpPurpose === "PHONE_CHANGE" ? "tel" : "email"}
                      placeholder={otpPurpose === "PHONE_CHANGE" ? "+254712345678" : "you@example.com"}
                      value={newSecureValue}
                      onChange={(e) => setNewSecureValue(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendOtp} disabled={sendingOtp || !newSecureValue.trim()} className="w-full">
                    {sendingOtp ? <><IconLoader2 className="h-4 w-4 animate-spin mr-2" /> Sending code...</> : "Send Verification Code"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <IconShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">
                      A 6-digit code has been sent via <strong>{otpChannel}</strong> to <strong>{otpMaskedTarget}</strong>.
                      Enter it below to confirm the change.
                    </p>
                  </div>
                  <div>
                    <Label>Verification code</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-lg tracking-widest font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSendOtp} disabled={sendingOtp} className="flex-1">
                      Resend Code
                    </Button>
                    <Button onClick={handleVerifyOtp} disabled={verifyingOtp || otpCode.length !== 6} className="flex-1">
                      {verifyingOtp ? <><IconLoader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</> : "Verify & Update"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details (Farmers only) */}
      {isFarmer && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCreditCard className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </div>
              {!editingPayment ? (
                <Button variant="outline" size="sm" onClick={() => setEditingPayment(true)}>
                  <IconPencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setEditingPayment(false)}>
                  <IconX className="h-3.5 w-3.5 mr-1" /> Cancel
                </Button>
              )}
            </div>
            <CardDescription>How buyers can pay you. Configure the methods that work for you.</CardDescription>
          </CardHeader>
          <CardContent>
            {editingPayment ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconDeviceMobile className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-semibold">M-PESA</p>
                    <Badge variant="outline" className="text-xs">Recommended</Badge>
                  </div>
                  <div>
                    <Label htmlFor="mpesaNumber">M-PESA phone number</Label>
                    <Input
                      id="mpesaNumber"
                      value={paymentForm.mpesaNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, mpesaNumber: e.target.value })}
                      placeholder="+254712345678"
                    />
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconBuildingBank className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold">Bank Transfer</p>
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank name</Label>
                    <Input
                      id="bankName"
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      placeholder="e.g. KCB, Equity Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Account number</Label>
                    <Input
                      id="bankAccount"
                      value={paymentForm.bankAccount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                      placeholder="Account number"
                    />
                  </div>
                </div>
                <Button onClick={handleSavePayment} disabled={savingPayment} className="w-full">
                  {savingPayment ? <><IconLoader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Payment Details"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <IconDeviceMobile className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">M-PESA</p>
                      <p className="text-sm text-muted-foreground">{profile.mpesaNumber || "Not configured"}</p>
                    </div>
                  </div>
                  {profile.mpesaNumber && <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>}
                </div>
                <div className="border-t" />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <IconBuildingBank className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.bankName && profile.bankAccount
                          ? `${profile.bankName} – ****${(profile.bankAccount as string).slice(-4)}`
                          : "Not configured"}
                      </p>
                    </div>
                  </div>
                  {profile.bankName && profile.bankAccount && <Badge className="bg-blue-100 text-blue-700 border-blue-200">Active</Badge>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

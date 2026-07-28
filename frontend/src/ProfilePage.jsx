import { useEffect, useState } from "react";
import "./ProfilePage.css";

function ProfilePage() {
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        phone: "",
        address: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function LoadProfile() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("Token");
            const response = await fetch("/Profile", {
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok || data.status !== "success") {
                throw new Error(data.message || "Unable to load profile.");
            }

            setProfile({
                username: data.result.username || "",
                email: data.result.email || "",
                phone: data.result.phone || "",
                address: data.result.address || "",
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function SaveProfile() {
        try {
            setSaving(true);
            setMessage("");
            setError("");

            const token = localStorage.getItem("Token");
            const response = await fetch("/Profile", {
                method: "PUT",
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone: profile.phone,
                    address: profile.address,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.status !== "success") {
                throw new Error(data.message || "Unable to save profile.");
            }

            setMessage("Profile updated successfully.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        LoadProfile();
    }, []);

    if (loading) {
        return <div className="profile-page"><div className="profile-card">Loading profile...</div></div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <div>
                        <p className="profile-kicker">Account</p>
                        <h1>My Profile</h1>
                        <p>View your account details and update your contact information.</p>
                    </div>
                    <div className="profile-avatar">
                        {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
                    </div>
                </div>

                {error && <div className="profile-alert profile-alert-error">{error}</div>}
                {message && <div className="profile-alert profile-alert-success">{message}</div>}

                <div className="profile-grid">
                    <label className="profile-field">
                        <span>Username</span>
                        <input type="text" value={profile.username} disabled />
                    </label>

                    <label className="profile-field">
                        <span>Email</span>
                        <input type="email" value={profile.email} disabled />
                    </label>

                    <label className="profile-field">
                        <span>Phone Number</span>
                        <input
                            type="tel"
                            placeholder="e.g. 9123 4567"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                    </label>

                    <label className="profile-field profile-field-full">
                        <span>Address</span>
                        <textarea
                            rows="4"
                            placeholder="Enter your address"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        />
                    </label>
                </div>

                <button className="profile-save-btn" type="button" onClick={SaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;

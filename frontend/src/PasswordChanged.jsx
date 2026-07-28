import {
    Check,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

import "./AuthStatus.css";

function PasswordChanged({ ToLogin }) {
    return (
        <main className="auth-status-page">
            <section className="auth-status-card">
                <div className="auth-status-number">
                    02
                </div>

                <div className="auth-status-icon">
                    <Check size={35} />
                </div>

                <p className="auth-status-label">
                    Security update complete
                </p>

                <h1>
                    Password changed
                    <br />
                    successfully.
                </h1>

                <p className="auth-status-description">
                    Your account password has been
                    securely updated. You can now log
                    in using your registered email and
                    your new password.
                </p>

                <div className="auth-security-note">
                    <ShieldCheck size={20} />

                    <span>
                        Your old password will no
                        longer work.
                    </span>
                </div>

                <button
                    type="button"
                    className="auth-status-button"
                    onClick={ToLogin}
                >
                    Return to login
                    <ArrowRight size={18} />
                </button>

                <div className="auth-status-footer">
                    Learning Quest / Account Security
                </div>
            </section>
        </main>
    );
}

export default PasswordChanged;
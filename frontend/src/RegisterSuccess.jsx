import {
    Check,
    ArrowRight,
} from "lucide-react";

import "./AuthStatus.css";

function RegisterSuccess({ ToLogin }) {
    return (
        <main className="auth-status-page">
            <section className="auth-status-card">
                <div className="auth-status-number">
                    01
                </div>

                <div className="auth-status-icon">
                    <Check size={35} />
                </div>

                <p className="auth-status-label">
                    Registration complete
                </p>

                <h1>
                    Account created
                    <br />
                    successfully.
                </h1>

                <p className="auth-status-description">
                    Welcome to Learning Quest. Your
                    account is ready and you may now
                    sign in using your registered
                    email and password.
                </p>

                <button
                    type="button"
                    className="auth-status-button"
                    onClick={ToLogin}
                >
                    Continue to login
                    <ArrowRight size={18} />
                </button>

                <div className="auth-status-footer">
                    Learning Quest / Authentication
                </div>
            </section>
        </main>
    );
}

export default RegisterSuccess;
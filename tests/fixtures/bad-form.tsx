export function LoginForm() {
  return (
    <div className="login-form">
      <h2>Sign In</h2>

      <div className="field">
        <input type="email" placeholder="Email address" />
      </div>

      <div className="field">
        <input type="password" placeholder="Password" />
      </div>

      <div className="account-type">
        <span>Account type</span>
        <label>
          <input type="radio" name="accountType" value="personal" /> Personal
        </label>
        <label>
          <input type="radio" name="accountType" value="business" /> Business
        </label>
      </div>

      <div className="error" style={{ color: "red" }}>
        Invalid email or password
      </div>

      <button type="button">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </button>
    </div>
  );
}

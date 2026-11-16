let userId;

const $ = id => document.getElementById(id);

async function registerUser(e) {
    e.preventDefault();

    try {
        const data = {
            username: $("username").value.trim(),
            email: $("reg-email").value.trim(),
            rollNumber: $("roll-number").value.trim(),
            casualLeave: +$("casual-leave").value,
            medicalLeave: +$("medical-leave").value
        };

        const res = await fetch("/api/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        $("registration-response").innerText = result.message || "";

        if (res.ok) {
            alert(result.message || "User created successfully! You can now log in.");
            $("registration-form").reset();
            $("registration-section").style.display = "none";
            $("login-section").style.display = "block";
            $("email").value = data.email;
        } else {
            alert(result.message || "Registration failed.");
        }
    } catch (err) {
        console.error("Register Error:", err);
        $("registration-response").innerText = "Network error. Please make sure you are accessing the app from your live Render URL (https://...), not by double-clicking index.html.";
    }
}

async function loginUser(e) {
    e.preventDefault();

    try {
        const email = $("email").value.trim();

        const res = await fetch("/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            $("response-message").innerText = data.message || "Login failed";
            alert(data.message || "User not found. Please click 'Create User' first to register.");
            return;
        }

        userId = data.userId;

        $("username-display").innerText = data.username;
        $("roll-number-display").innerText = data.rollNumber;
        $("casual-leave-display").innerText = data.casualLeave;
        $("medical-leave-display").innerText = data.medicalLeave;

        $("login-section").style.display = "none";
        $("balance-section").style.display = "block";
        $("apply-leave-section").style.display = "block";
        $("logout-button").style.display = "inline-block";
        $("response-message").innerText = "";
    } catch (err) {
        console.error("Login Error:", err);
        $("response-message").innerText = "Network error. Please make sure you are accessing the app from your live Render URL (https://...), not by double-clicking index.html.";
    }
}

async function refreshBalance() {
    try {
        if (!userId) return;
        const res = await fetch(`/api/leave-balance/${userId}`);
        const data = await res.json();

        $("casual-leave-display").innerText = data.casualLeave;
        $("medical-leave-display").innerText = data.medicalLeave;
    } catch (err) {
        console.error("Refresh Error:", err);
    }
}

async function applyLeave(e) {
    e.preventDefault();

    try {
        const data = {
            type: $("leave-type").value,
            days: $("leave-days").value
        };

        const res = await fetch(`/api/apply-leave/${userId}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            $("casual-leave-display").innerText = result.casualLeave;
            $("medical-leave-display").innerText = result.medicalLeave;
            $("response-message").innerText = result.message;
            alert(result.message || "Leave applied successfully!");
            $("leave-form").reset();
        } else {
            $("response-message").innerText = result.message;
            alert(result.message || "Failed to apply leave.");
        }
    } catch (err) {
        console.error("Apply Leave Error:", err);
        $("response-message").innerText = "Network error while applying leave.";
    }
}

function logoutUser() {
    userId = null;
    $("balance-section").style.display = "none";
    $("apply-leave-section").style.display = "none";
    $("login-section").style.display = "block";
    $("response-message").innerText = "";
}

function init() {
    $("registration-form").onsubmit = registerUser;
    $("login-form").onsubmit = loginUser;
    $("leave-form").onsubmit = applyLeave;
    $("refresh-balance").onclick = refreshBalance;
    $("logout-button").onclick = logoutUser;

    $("show-registration").onclick = (e) => {
        e.preventDefault();
        $("registration-section").style.display = "block";
        $("login-section").style.display = "none";
        $("response-message").innerText = "";
    };

    $("show-login").onclick = (e) => {
        e.preventDefault();
        $("registration-section").style.display = "none";
        $("login-section").style.display = "block";
        $("response-message").innerText = "";
    };
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

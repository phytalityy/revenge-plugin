(function(e, o, i) {
    "use strict";

    const { findByProps } = o.metro;
    const React = o.react;
    const Patcher = i;
    const { showToast, openSheet } = o.ui || {};

    let unpatches = [];
    let currentChannelId = null;
    let selectedCommand = null;
    let selectedUser = null;
    let selectedDuration = null;
    let selectedReason = null;

    const commands = [
        { name: "warn", icon: "⚠️", desc: "Warn" },
        { name: "timeout", icon: "🔇", desc: "Timeout" },
        { name: "jail", icon: "🔒", desc: "Jail" },
        { name: "kick", icon: "👢", desc: "Kick" },
        { name: "ban", icon: "⛔", desc: "Ban" },
        { name: "purge", icon: "🧹", desc: "Purge" },
        { name: "mute", icon: "🔇", desc: "Mute" },
        { name: "untimeout", icon: "🔊", desc: "Untimeout" },
        { name: "unban", icon: "✅", desc: "Unban" },
        { name: "unjail", icon: "🔓", desc: "Unjail" },
        { name: "unmute", icon: "🔊", desc: "Unmute" },
    ];

    const durations = ["15m","30m","1h","3h","6h","12h","1d","7d","30d","Custom"];
    const reasons = ["Spam","Toxicity","Harassment","Advertising","Politics","Ban Evasion","Custom"];

    const plugin = {
        onLoad: function() {
            console.log("[ModerationTools] Full UI Overlay Loaded (Non-Root Compatible)");

            const DraftStore = findByProps("getDraft", "setDraft");
            if (DraftStore) {
                unpatches.push(Patcher.after(DraftStore, "setDraft", ([channelId, text]) => {
                    currentChannelId = channelId;
                    if (text?.startsWith(",")) handleCommandInput(text);
                }));
            }

            console.log("[ModerationTools] Type , in chat to start");
        },

        onUnload: function() {
            unpatches.forEach(u => u && u());
            unpatches = [];
        }
    };

    function handleCommandInput(text) {
        const query = text.slice(1).toLowerCase().trim();
        const matched = commands.filter(c => c.name.toLowerCase().includes(query));

        if (matched.length > 0) {
            selectedCommand = matched[0].name;
            showModerationSheet();
        }
    }

    function showModerationSheet() {
        openSheet(() => React.createElement(ModerationSheet, {}));
    }

    function ModerationSheet() {
        const [step, setStep] = React.useState("command"); // command → user → duration → reason
        const [preview, setPreview] = React.useState("");

        const updatePreview = () => {
            let p = `,${selectedCommand}`;
            if (selectedUser) p += ` ${selectedUser}`;
            if (selectedDuration) p += ` ${selectedDuration}`;
            if (selectedReason) p += ` ${selectedReason}`;
            setPreview(p);
        };

        React.useEffect(updatePreview, [selectedUser, selectedDuration, selectedReason]);

        return React.createElement("View", { style: { padding: 16, backgroundColor: "#1E1E1E" } },
            React.createElement("Text", { style: { color: "#fff", fontSize: 18, marginBottom: 12 } }, 
                `Moderation: ${selectedCommand || ""}`
            ),
            
            // Live Preview
            React.createElement("Text", { style: { color: "#0f0", marginBottom: 16 } }, preview || "Building command..."),

            // Duration Chips
            step === "duration" && React.createElement("View", {},
                durations.map(d => React.createElement("TouchableOpacity", {
                    onPress: () => { selectedDuration = d; setStep("reason"); updatePreview(); }
                }, React.createElement("Text", { style: { color: "#fff", padding: 12 } }, d)))
            ),

            // Reason Chips
            step === "reason" && React.createElement("View", {},
                reasons.map(r => React.createElement("TouchableOpacity", {
                    onPress: () => { 
                        selectedReason = r; 
                        // Send command
                        findByProps("setDraft")?.setDraft(currentChannelId, preview);
                        showToast("Command ready!");
                    }
                }, React.createElement("Text", { style: { color: "#fff", padding: 12 } }, r)))
            )
        );
    }

    return e.default = plugin, Object.defineProperty(e, "__esModule", { value: true }), e;
})({}, vendetta.metro, vendetta.patcher);

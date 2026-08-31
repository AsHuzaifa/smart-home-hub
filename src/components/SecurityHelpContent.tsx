export function SecurityHelpContent() {
  return (
    <>
      <p>
        This section is a teaching demo of a few IoT security concepts - none of it is real
        cryptography or a real authentication system.
      </p>
      <p>
        <span className="font-medium text-text">Simulated token</span> - every device is issued
        a fake per-device token on load, standing in for the kind of credential a real device
        would authenticate with.
      </p>
      <p>
        <span className="font-medium text-text">Schema validation</span> - every command sent to
        a device (manually, or by a rule) is checked against that device type's expected fields
        and types before it's applied. A command with an unexpected field or wrong type would be
        rejected.
      </p>
      <p>
        <span className="font-medium text-text">Replay-attack demo</span> - click a device in the
        3D house to open its panel. If it has a prior command, you can re-send it with an
        artificially stale timestamp to see whether a simple freshness check (reject anything
        older than 10s) catches it. Real systems defend against replays with signed, single-use
        nonces - this demo only illustrates the timestamp-age idea.
      </p>
      <p>
        <span className="font-medium text-text">Security Log</span> - every simulated check
        above gets recorded there, newest first, with a green dot for accepted and red for
        rejected, plus the reason why.
      </p>
    </>
  );
}
